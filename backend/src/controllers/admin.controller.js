import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Achievement from "../models/Achievement.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendApprovalEmail, sendRejectionEmail } from "../services/emailService.js";
import { certificateValidator } from "../services/certificateValidation.js";
import archiver from "archiver";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing" });
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: "Invalid" });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid" });
    const token = jwt.sign({ id: admin._id }, process.env.ADMIN_JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function listAchievements(req, res) {
  try {
    const { status, category, year } = req.query;
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;

    let items;
    if (year) {
      // If year filter is applied, first get students of that year
      const studentIds = await User.find({ year: year })
        .select('_id');

      q.student = { $in: studentIds.map(s => s._id) };
    }

    items = await Achievement.find(q)
      .populate("student", "name rollNumber section totalPoints year")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function verifyAchievement(req, res) {
  try {
    const { id } = req.params;
    const { action, points = 0, adminNote = "" } = req.body;
    const ach = await Achievement.findById(id).populate('student', 'name email');
    if (!ach) return res.status(404).json({ message: "Not found" });

    if (action === "approve") {
      if (ach.status !== "approved") {
        ach.status = "approved";
        ach.points = Number(points || 0);
        ach.adminNote = adminNote;
        await ach.save();
        // increment user points
        const user = await User.findById(ach.student._id);
        user.totalPoints = (user.totalPoints || 0) + Number(points || 0);
        await user.save();

        // Send approval email
        console.log('📧 Attempting to send approval email to:', ach.student.email);
        const emailResult = await sendApprovalEmail(
          ach.student.email,
          ach.student.name,
          ach.title,
          Number(points || 0),
          adminNote
        );
        console.log('📧 Email result:', emailResult);

        return res.json({ message: "Approved", achievement: ach, totalPoints: user.totalPoints, emailSent: emailResult.success });
      } else {
        return res.status(400).json({ message: "Already approved" });
      }
    } else if (action === "reject") {
      ach.status = "rejected";
      ach.adminNote = adminNote;
      await ach.save();

      // Send rejection email
      console.log('📧 Attempting to send rejection email to:', ach.student.email);
      const emailResult = await sendRejectionEmail(
        ach.student.email,
        ach.student.name,
        ach.title,
        adminNote
      );
      console.log('📧 Email result:', emailResult);

      return res.json({ message: "Rejected", achievement: ach, emailSent: emailResult.success });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function toggleHighlight(req, res) {
  try {
    const ach = await Achievement.findById(req.params.id);
    if (!ach) return res.status(404).json({ message: "Not found" });
    ach.highlighted = !ach.highlighted;
    await ach.save();
    res.json({ message: "Toggled", highlighted: ach.highlighted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminDeleteAchievement(req, res) {
  try {
    const ach = await Achievement.findById(req.params.id);
    if (!ach) return res.status(404).json({ message: "Not found" });
    await Achievement.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(ach.student, { $pull: { achievements: req.params.id } });
    res.json({ message: "Deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function manualAdjustPoints(req, res) {
  try {
    const { studentId } = req.params;
    const { delta = 0 } = req.body;
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: "Student not found" });
    user.totalPoints = Math.max(0, (user.totalPoints || 0) + Number(delta));
    await user.save();
    res.json({ message: "Adjusted", totalPoints: user.totalPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Certificate Validation Endpoint
export async function validateCertificate(req, res) {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findById(id).populate('student', 'name email');

    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    if (!achievement.proofFiles || achievement.proofFiles.length === 0) {
      return res.status(400).json({ message: "No certificate files to validate" });
    }

    console.log('🔍 Starting certificate validation for:', achievement.title);

    // Prepare achievement data for validation
    const achievementData = {
      title: achievement.title,
      category: achievement.category,
      level: achievement.level,
      issuer: achievement.issuer || achievement.description,
      studentName: achievement.student.name,
      dateOfAchievement: achievement.dateOfAchievement || achievement.createdAt
    };

    // Validate the first certificate file
    const validationResult = await certificateValidator.validateCertificate(
      achievement.proofFiles[0], // Primary certificate file
      achievementData
    );

    // Store validation result in achievement
    achievement.validationResult = validationResult;
    achievement.lastValidated = new Date();
    await achievement.save();

    console.log('✅ Certificate validation completed:', {
      achievementId: id,
      trustScore: validationResult.trustScore,
      isValid: validationResult.isValid,
      flags: validationResult.flags
    });

    res.json({
      message: "Certificate validation completed",
      validation: validationResult,
      achievement: achievement
    });

  } catch (error) {
    console.error('Certificate validation error:', error);
    res.status(500).json({
      message: "Validation failed",
      error: error.message
    });
  }
}

export async function analytics(req, res) {
  try {
    // Get all students sorted by points for ranking
    const allStudents = await User.find()
      .sort({ totalPoints: -1 })
      .select("name rollNumber section totalPoints year");

    // Add rank to each student
    const rankedStudents = allStudents.map((student, index) => ({
      ...student.toObject(),
      rank: index + 1
    }));

    // Get top 10 students
    const top = rankedStudents.slice(0, 10);

    const approvedCount = await Achievement.countDocuments({ status: "approved" });

    const approvedByCategoryAgg = await Achievement.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
      { $sort: { count: -1, category: 1 } }
    ]);

    const approvedByTypeAgg = await Achievement.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$achievementType", count: { $sum: 1 } } },
      { $project: { _id: 0, achievementType: "$_id", count: 1 } },
      { $sort: { count: -1, achievementType: 1 } }
    ]);

    const approvedByLevelAgg = await Achievement.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $project: { _id: 0, level: "$_id", count: 1 } },
      { $sort: { count: -1, level: 1 } }
    ]);

    const approvedByStudentYearAgg = await Achievement.aggregate([
      { $match: { status: "approved" } },
      { $lookup: { from: "users", localField: "student", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $group: { _id: "$student.year", count: { $sum: 1 } } },
      { $project: { _id: 0, year: "$_id", count: 1 } },
      { $sort: { year: 1 } }
    ]);

    const ERP = (await import("../models/ERP.js")).default;

    const erpYearWiseAgg = await ERP.aggregate([
      { $match: { status: { $in: ["submitted", "verified"] } } },
      {
        $group: {
          _id: "$currentYear",
          count: { $sum: 1 },
          avgCGPA: { $avg: "$overallCGPA" },
          minCGPA: { $min: "$overallCGPA" },
          maxCGPA: { $max: "$overallCGPA" }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          count: 1,
          avgCGPA: { $round: ["$avgCGPA", 2] },
          minCGPA: 1,
          maxCGPA: 1
        }
      },
      { $sort: { year: 1 } }
    ]);

    const totalSubmittedErps = await ERP.countDocuments({ status: { $in: ["submitted", "verified"] } });

    res.json({
      topStudents: top,
      totalStudents: allStudents.length,
      achievements: {
        approvedCount,
        byCategory: approvedByCategoryAgg,
        byType: approvedByTypeAgg,
        byLevel: approvedByLevelAgg,
        byStudentYear: approvedByStudentYearAgg
      },
      erpCgpa: {
        totalSubmitted: totalSubmittedErps,
        yearWise: erpYearWiseAgg
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get all students with their details
export async function getAllStudents(req, res) {
  try {
    console.log("📋 getAllStudents endpoint hit!");
    console.log("Admin:", req.admin?.username);

    const { year, academicBatch, admissionYear } = req.query;
    const query = {};

    // Filter by year (I, II, III, IV)
    if (year) query.year = year;

    // Filter by academic batch (e.g., "2023-2027")
    if (academicBatch) query.academicBatch = academicBatch;

    // Filter by admission year (e.g., 2023)
    if (admissionYear) query.admissionYear = parseInt(admissionYear);

    const students = await User.find(query)
      .select("name email rollNumber department section year totalPoints profilePicUrl achievements academicBatch admissionYear graduationYear socialLinks bannerUrl resumeUrl createdAt updatedAt")
      .populate("achievements")
      .sort({ totalPoints: -1, department: 1, section: 1, rollNumber: 1 });

    // Get ERP data for all students
    const ERP = (await import("../models/ERP.js")).default;
    const studentIds = students.map(s => s._id);
    const erpRecords = await ERP.find({ student: { $in: studentIds } })
      .select("student currentSemester overallCGPA phoneNumber gender status fullName dateOfBirth bloodGroup fatherName motherName accommodationType address")
      .lean();

    // Create a map of ERP data by student ID
    const erpMap = {};
    erpRecords.forEach(erp => {
      erpMap[erp.student.toString()] = erp;
    });

    // Add rank and ERP data to each student
    const rankedStudents = students.map((student, index) => {
      const studentObj = student.toObject();
      const erpData = erpMap[student._id.toString()];

      return {
        ...studentObj,
        rank: index + 1,
        erp: erpData ? {
          currentSemester: erpData.currentSemester,
          overallCGPA: erpData.overallCGPA,
          phoneNumber: erpData.phoneNumber,
          gender: erpData.gender,
          status: erpData.status,
          fullName: erpData.fullName,
          dateOfBirth: erpData.dateOfBirth,
          bloodGroup: erpData.bloodGroup,
          fatherName: erpData.fatherName,
          motherName: erpData.motherName,
          accommodationType: erpData.accommodationType,
          address: erpData.address
        } : null
      };
    });

    // Get unique academic batches and admission years for filtering options
    const uniqueBatches = await User.distinct("academicBatch");
    const uniqueAdmissionYears = await User.distinct("admissionYear");

    console.log(`✅ Found ${rankedStudents.length} students`);

    res.json({
      students: rankedStudents,
      total: rankedStudents.length,
      filterOptions: {
        academicBatches: uniqueBatches.filter(b => b).sort().reverse(),
        admissionYears: uniqueAdmissionYears.filter(y => y).sort().reverse()
      }
    });
  } catch (err) {
    console.error("❌ Get all students error:", err);
    res.status(500).json({ message: err.message });
  }
}

// Get single student with full details
export async function getStudentById(req, res) {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId)
      .select("name email rollNumber department section year totalPoints profilePicUrl resumeUrl socialLinks achievements")
      .populate({
        path: "achievements",
        select: "title description category level status points certificateUrl createdAt"
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ student });
  } catch (err) {
    console.error("Get student by ID error:", err);
    res.status(500).json({ message: err.message });
  }
}

// Dashboard statistics endpoint
export async function getDashboardStats(req, res) {
  try {
    // Get all user statistics
    const totalStudents = await User.countDocuments();
    const totalAchievements = await Achievement.countDocuments();
    const pendingApprovals = await Achievement.countDocuments({ status: "pending" });

    // Calculate total points from all users
    const usersWithPoints = await User.aggregate([
      { $group: { _id: null, totalPoints: { $sum: "$totalPoints" } } }
    ]);
    const totalPoints = usersWithPoints[0]?.totalPoints || 0;

    // Get approval statistics
    const approved = await Achievement.countDocuments({ status: "approved" });
    const approvalRate = totalAchievements > 0 ? ((approved / totalAchievements) * 100).toFixed(1) : 0;

    // Get monthly growth (new users this month)
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonthStart } });
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: thisMonthStart }
    });
    const monthlyGrowth = newUsersLastMonth > 0 ?
      (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1) :
      newUsersThisMonth * 100;

    // Get ERP statistics
    const ERP = (await import("../models/ERP.js")).default;
    const pendingERPs = await ERP.countDocuments({ status: "submitted" });

    // Get announcements statistics  
    const Announcement = (await import("../models/Announcement.js")).default;
    const activeAnnouncements = await Announcement.countDocuments({ isActive: true });

    // Get recent activities
    const recentAchievements = await Achievement.find()
      .populate("student", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentActivities = [];
    for (const achievement of recentAchievements) {
      const timeAgo = getTimeAgo(achievement.createdAt);
      recentActivities.push({
        text: `New achievement submitted by ${achievement.student?.name || "Unknown"}`,
        time: timeAgo,
        type: achievement.status === "approved" ? "success" :
          achievement.status === "rejected" ? "error" : "achievement"
      });
    }

    res.json({
      stats: {
        totalStudents,
        totalAchievements,
        pendingApprovals,
        totalPoints,
        approvalRate: parseFloat(approvalRate),
        monthlyGrowth: parseFloat(monthlyGrowth),
        pendingERPs,
        activeAnnouncements
      },
      recentActivities
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: err.message });
  }
}

// Helper function to get time ago string
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
    }
  }
  return 'just now';
}

// AI-powered certificate analysis using Google Gemini
export async function analyzeCertificate(req, res) {
  try {
    console.log("AI Analysis Request:", req.body);
    const { title, description, category, level } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "your-gemini-api-key-here") {
      // Use Google Gemini for analysis
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
          Analyze this student achievement certificate and provide a detailed assessment:
          
          Certificate Title: ${title}
          Description: ${description || "No description provided"}
          Category: ${category}
          Level: ${level || "Not specified"}
          
          Please provide:
          1. A brief summary of the achievement (2-3 sentences)
          2. Credibility score (0-100) based on the organization, complexity, and value
          3. Key factors that influenced the credibility score
          4. Recommended points to award (0-100)
          5. Key highlights or skills demonstrated
          6. Any red flags or concerns
          
          Format your response as a JSON object with these fields:
          summary, credibility_score, credibility_factors (array), recommended_points, 
          key_highlights (array), skills_identified (array), red_flags (array), 
          assessment_level (Excellent/Good/Fair/Needs Review), ai_confidence (High/Medium/Low)
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the Gemini response
        try {
          // Extract JSON from the response (Gemini might include extra text)
          const jsonMatch = text.match(/\{[^]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log("Gemini AI Analysis Result:", analysis);
            return res.json({ ...analysis, powered_by: "Google Gemini AI" });
          }
        } catch (parseErr) {
          console.error("Failed to parse Gemini response:", parseErr);
          // Fall back to pattern-based analysis
        }
      } catch (geminiErr) {
        console.error("Gemini API Error:", geminiErr);
        // Fall back to pattern-based analysis
      }
    }

    // Fallback to pattern-based analysis if Gemini is not available
    const analysis = generateCertificateAnalysis(title, description, category, level);
    console.log("Pattern-based Analysis Result:", analysis);
    res.json({ ...analysis, powered_by: "Pattern-based Analysis" });

  } catch (err) {
    console.error("AI Analysis Error:", err);
    res.status(500).json({ message: err.message || "Analysis failed" });
  }
}

// Helper function for AI analysis (Pattern-based intelligent analysis)
function generateCertificateAnalysis(title = "", description = "", category = "", level = "") {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();

  // Determine credibility score
  let credibilityScore = 50; // Base score
  let credibilityFactors = [];

  // High-value keywords
  const prestigiousOrgs = ['google', 'microsoft', 'amazon', 'aws', 'ieee', 'ibm', 'oracle', 'coursera', 'udacity', 'stanford', 'mit', 'harvard'];
  const technicalKeywords = ['machine learning', 'ai', 'cloud', 'blockchain', 'data science', 'cybersecurity', 'devops', 'full stack'];
  const competitionKeywords = ['hackathon', 'winner', 'finalist', 'champion', 'award', '1st place', 'first prize'];

  // Check for prestigious organizations
  if (prestigiousOrgs.some(org => titleLower.includes(org) || descLower.includes(org))) {
    credibilityScore += 30;
    credibilityFactors.push('Issued by recognized organization');
  }

  // Check for technical depth
  if (technicalKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword))) {
    credibilityScore += 15;
    credibilityFactors.push('Technical skill certification');
  }

  // Check for competition achievement
  if (competitionKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword))) {
    credibilityScore += 20;
    credibilityFactors.push('Competition/Award achievement');
  }

  // Level-based scoring
  if (level === 'international') credibilityScore += 20;
  else if (level === 'national') credibilityScore += 15;
  else if (level === 'state') credibilityScore += 10;

  // Cap score at 100
  credibilityScore = Math.min(100, credibilityScore);

  // Generate summary
  let summary = '';
  let category_assessment = '';
  let recommended_points = 0;
  let key_highlights = [];

  // Category-specific assessment
  switch (category) {
    case 'certification':
      category_assessment = 'Professional certification demonstrating skill validation';
      recommended_points = Math.floor(credibilityScore * 0.5); // 0-50 points
      if (titleLower.includes('advanced') || titleLower.includes('professional')) {
        key_highlights.push('Advanced level certification');
        recommended_points += 10;
      }
      break;
    case 'competition':
      category_assessment = 'Competitive achievement showing excellence';
      recommended_points = Math.floor(credibilityScore * 0.7); // 0-70 points
      if (titleLower.includes('1st') || titleLower.includes('winner') || titleLower.includes('champion')) {
        key_highlights.push('Top position achieved');
        recommended_points += 20;
      }
      break;
    case 'project':
      category_assessment = 'Technical project demonstrating practical skills';
      recommended_points = Math.floor(credibilityScore * 0.4); // 0-40 points
      if (descLower.includes('deployed') || descLower.includes('live') || descLower.includes('production')) {
        key_highlights.push('Production-ready implementation');
        recommended_points += 15;
      }
      break;
    case 'internship':
      category_assessment = 'Professional work experience';
      recommended_points = Math.floor(credibilityScore * 0.6); // 0-60 points
      if (descLower.includes('ppo') || descLower.includes('full-time offer')) {
        key_highlights.push('Received full-time offer');
        recommended_points += 25;
      }
      break;
    default:
      category_assessment = 'General achievement';
      recommended_points = Math.floor(credibilityScore * 0.3);
  }

  // Generate detailed summary
  if (credibilityScore >= 80) {
    summary = `Highly credible ${category} with exceptional value. This achievement demonstrates significant accomplishment and should be weighted heavily in evaluation.`;
  } else if (credibilityScore >= 60) {
    summary = `Solid ${category} with good credibility. This represents meaningful achievement and validates student's capabilities in the domain.`;
  } else if (credibilityScore >= 40) {
    summary = `Moderate ${category} with acceptable credibility. This shows student initiative and learning, though may need verification of details.`;
  } else {
    summary = `Basic ${category} achievement. While showing student engagement, this may have limited industry recognition. Verify authenticity and scope.`;
  }

  // Extract skills mentioned
  const skills = [];
  const skillPatterns = ['python', 'java', 'javascript', 'react', 'node', 'aws', 'docker', 'kubernetes', 'ml', 'ai', 'data'];
  skillPatterns.forEach(skill => {
    if (titleLower.includes(skill) || descLower.includes(skill)) {
      skills.push(skill.toUpperCase());
    }
  });

  // Identify potential red flags
  const red_flags = [];
  if (description && description.length < 20) {
    red_flags.push('Very brief description - request more details');
  }
  if (!description || description.length === 0) {
    red_flags.push('No description provided');
  }
  if (!title || title.length < 5) {
    red_flags.push('Incomplete title information');
  }

  return {
    summary,
    credibility_score: credibilityScore,
    credibility_factors: credibilityFactors,
    category_assessment: category_assessment,
    recommended_points: recommended_points,
    key_highlights: key_highlights,
    skills_identified: skills,
    red_flags: red_flags,
    assessment_level: credibilityScore >= 80 ? 'Excellent' : credibilityScore >= 60 ? 'Good' : credibilityScore >= 40 ? 'Fair' : 'Needs Review',
    ai_confidence: credibilityScore >= 70 ? 'High' : credibilityScore >= 50 ? 'Medium' : 'Low'
  };
}

// Test email configuration endpoint
export async function testEmail(req, res) {
  try {
    const { testEmail } = req.body;

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'Email credentials not configured in .env file',
        configured: {
          EMAIL_USER: !!process.env.EMAIL_USER,
          EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
        }
      });
    }

    console.log('🧪 Testing email configuration...');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('🔑 EMAIL_PASSWORD configured:', !!process.env.EMAIL_PASSWORD);
    console.log('📬 Sending test email to:', testEmail || process.env.EMAIL_USER);

    // Send test email
    const result = await sendApprovalEmail(
      testEmail || process.env.EMAIL_USER,
      'Test User',
      'Test Achievement - Email Configuration Check',
      100,
      'This is a test email to verify your email configuration is working correctly.'
    );

    console.log('✅ Test email result:', result);

    if (result.success) {
      return res.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox (and spam folder).',
        emailSent: true,
        sentTo: testEmail || process.env.EMAIL_USER,
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error || result.message,
        configured: {
          EMAIL_USER: process.env.EMAIL_USER,
          EMAIL_PASSWORD: '***configured***'
        }
      });
    }
  } catch (err) {
    console.error('❌ Test email error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error testing email',
      error: err.message
    });
  }
}

// ERP Management Functions
export async function getAllERPs(req, res) {
  try {
    console.log("📋 getAllERPs endpoint hit!");
    const { status, year, academicBatch, admissionYear, department } = req.query;

    // First build student filter
    const studentQuery = {};
    if (year) studentQuery.year = year;
    if (academicBatch) studentQuery.academicBatch = academicBatch;
    if (admissionYear) studentQuery.admissionYear = parseInt(admissionYear);
    if (department) studentQuery.department = department;

    // Get matching students if filters are applied
    let studentIds = null;
    if (Object.keys(studentQuery).length > 0) {
      const matchingStudents = await User.find(studentQuery).select('_id');
      studentIds = matchingStudents.map(s => s._id);
    }

    // Build ERP query
    const erpQuery = {};
    if (status) erpQuery.status = status;
    if (studentIds) erpQuery.student = { $in: studentIds };

    const erps = await (await import("../models/ERP.js")).default.find(erpQuery)
      .populate("student", "name rollNumber section year email department academicBatch admissionYear graduationYear totalPoints")
      .populate("verifiedBy", "username")
      .sort({ submittedAt: -1, createdAt: -1 });

    // Get filter options
    const uniqueBatches = await User.distinct("academicBatch");
    const uniqueAdmissionYears = await User.distinct("admissionYear");

    console.log(`✅ Found ${erps.length} ERPs`);

    res.json({
      erps,
      total: erps.length,
      filterOptions: {
        academicBatches: uniqueBatches.filter(b => b).sort().reverse(),
        admissionYears: uniqueAdmissionYears.filter(y => y).sort().reverse()
      }
    });
  } catch (err) {
    console.error("❌ Get ERPs error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function getERPById(req, res) {
  try {
    const { erpId } = req.params;
    const ERP = (await import("../models/ERP.js")).default;

    const erp = await ERP.findById(erpId)
      .populate("student", "name rollNumber section year email")
      .populate("verifiedBy", "username");

    if (!erp) {
      return res.status(404).json({ message: "ERP not found" });
    }

    res.json(erp);
  } catch (err) {
    console.error("Get ERP by ID error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function verifyERP(req, res) {
  try {
    const { erpId } = req.params;
    const { status, adminNote } = req.body; // status: 'verified' or 'rejected'
    const adminId = req.admin.id;

    const ERP = (await import("../models/ERP.js")).default;

    const erp = await ERP.findById(erpId).populate("student", "name email");
    if (!erp) {
      return res.status(404).json({ message: "ERP not found" });
    }

    erp.status = status;
    erp.adminNote = adminNote;
    erp.verifiedAt = new Date();
    erp.verifiedBy = adminId;

    await erp.save();

    // Send email notification to student
    try {
      const emailService = await import("../services/emailService.js");
      if (status === 'verified') {
        await emailService.sendApprovalEmail(erp.student.email, {
          studentName: erp.student.name,
          type: 'ERP Profile',
          adminNote: adminNote
        });
      } else if (status === 'rejected') {
        await emailService.sendRejectionEmail(erp.student.email, {
          studentName: erp.student.name,
          type: 'ERP Profile',
          adminNote: adminNote
        });
      }
    } catch (emailErr) {
      console.warn("Email notification failed:", emailErr.message);
    }

    res.json({
      message: `ERP ${status} successfully`,
      erp: await ERP.findById(erpId).populate("student", "name rollNumber section year")
    });
  } catch (err) {
    console.error("Verify ERP error:", err);
    res.status(500).json({ message: err.message });
  }
}

// Export students with achievements as ZIP (CSV + certificate files)
export async function exportStudentsZIP(req, res) {
  try {
    console.log("📦 ZIP Export started");
    const { filters, selectedFields } = req.body;

    // Build query based on filters
    const query = {};
    if (filters.department && filters.department !== "All") {
      query.department = filters.department;
    }
    if (filters.section && filters.section !== "All") {
      query.section = filters.section;
    }
    if (filters.year && filters.year !== "All") {
      query.year = filters.year;
    }
    if (filters.academicBatch && filters.academicBatch !== "All") {
      query.academicBatch = filters.academicBatch;
    }
    if (filters.admissionYear && filters.admissionYear !== "All") {
      query.admissionYear = filters.admissionYear;
    }

    // Search query
    if (filters.searchQuery) {
      query.$or = [
        { name: { $regex: filters.searchQuery, $options: 'i' } },
        { email: { $regex: filters.searchQuery, $options: 'i' } },
        { rollNumber: { $regex: filters.searchQuery, $options: 'i' } }
      ];
    }

    console.log("🔍 Query filters:", query);

    // Fetch students with achievements - ensure all fields are populated
    const students = await User.find(query)
      .populate({
        path: 'achievements',
        match: filters.filterType === 'withAchievements' ? { status: 'approved' } : {},
        select: 'title category status points proofFiles verificationInfo description achievementType level organizedInstitute dateOfIssue'
      })
      .lean();

    console.log("📊 Raw data sample:", JSON.stringify(students[0]?.achievements?.[0], null, 2));

    // Filter students with achievements if needed
    let filteredStudents = students;
    if (filters.filterType === 'withAchievements') {
      filteredStudents = students.filter(s => s.achievements && s.achievements.length > 0);
    }

    console.log(`✅ Found ${filteredStudents.length} students`);

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper function to get field value
    const getFieldValue = (student, fieldKey) => {
      const fieldMap = {
        name: student.name || '',
        rollNumber: student.rollNumber || '',
        email: student.email || '',
        department: student.department || '',
        section: student.section || '',
        year: student.year || '',
        academicBatch: student.academicBatch || '',
        admissionYear: student.admissionYear || '',
        graduationYear: student.graduationYear || '',
        totalPoints: student.totalPoints || 0,
        totalAchievements: student.achievements?.length || 0,
        approvedAchievements: student.achievements?.filter(a => a.status === 'approved').length || 0,
        pendingAchievements: student.achievements?.filter(a => a.status === 'pending').length || 0,
        rejectedAchievements: student.achievements?.filter(a => a.status === 'rejected').length || 0,
        phoneNumber: student.phoneNumber || '',
        gender: student.gender || '',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
        bloodGroup: student.bloodGroup || '',
        currentSemester: student.currentSemester || '',
        overallCGPA: student.overallCGPA || '',
        erpStatus: student.erpStatus || '',
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        accommodationType: student.accommodationType || '',
        address: student.address ? `${student.address.street || ''}, ${student.address.city || ''}, ${student.address.state || ''} ${student.address.pincode || ''}` : '',
        profilePicUrl: student.profilePicUrl || '',
        bannerUrl: student.bannerUrl || '',
        resumeUrl: student.resumeUrl || '',
        linkedin: student.socialLinks?.linkedin || '',
        github: student.socialLinks?.github || '',
        leetcode: student.socialLinks?.leetcode || '',
        codechef: student.socialLinks?.codechef || '',
        portfolio: student.socialLinks?.portfolio || '',
        createdAt: student.createdAt ? new Date(student.createdAt).toLocaleString() : '',
        updatedAt: student.updatedAt ? new Date(student.updatedAt).toLocaleString() : '',
        achievementDetails: student.achievements?.map(a =>
          `${a.title} (${a.category}) - ${a.points} pts - ${a.status}`
        ).join(' | ') || '',
        achievementTitles: student.achievements?.map(a => a.title).join(' | ') || '',
        achievementCategories: student.achievements?.map(a => a.category).join(' | ') || '',
        achievementPoints: student.achievements?.map(a => a.points).join(' | ') || '',
        achievementCertificateUrls: student.achievements?.map(a => a.certificateUrl || 'N/A').join(' | ') || '',
        achievementStatuses: student.achievements?.map(a => a.status).join(' | ') || '',
      };

      return fieldMap[fieldKey] !== undefined ? fieldMap[fieldKey] : '';
    };

    // Generate CSV content
    const selectedFieldKeys = Object.keys(selectedFields).filter(key => selectedFields[key]);
    const fieldLabels = {
      name: 'Name',
      rollNumber: 'Roll Number',
      email: 'Email',
      department: 'Department',
      section: 'Section',
      year: 'Year',
      academicBatch: 'Academic Batch',
      admissionYear: 'Admission Year',
      graduationYear: 'Graduation Year',
      totalPoints: 'Total Points',
      totalAchievements: 'Total Achievements',
      approvedAchievements: 'Approved Achievements',
      pendingAchievements: 'Pending Achievements',
      rejectedAchievements: 'Rejected Achievements',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      bloodGroup: 'Blood Group',
      currentSemester: 'Current Semester',
      overallCGPA: 'Overall CGPA',
      erpStatus: 'ERP Status',
      fatherName: 'Father Name',
      motherName: 'Mother Name',
      accommodationType: 'Accommodation Type',
      address: 'Address',
      profilePicUrl: 'Profile Picture URL',
      bannerUrl: 'Banner URL',
      resumeUrl: 'Resume URL',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      leetcode: 'LeetCode',
      codechef: 'CodeChef',
      portfolio: 'Portfolio',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      achievementDetails: 'Achievement Details',
      achievementTitles: 'Achievement Titles',
      achievementCategories: 'Achievement Categories',
      achievementPoints: 'Achievement Points',
      achievementCertificateUrls: 'Achievement Certificate URLs',
      achievementStatuses: 'Achievement Statuses',
    };

    const headerRow = selectedFieldKeys.map(key => fieldLabels[key] || key).join(',');
    const dataRows = filteredStudents.map(student => {
      return selectedFieldKeys.map(fieldKey => {
        const value = getFieldValue(student, fieldKey);
        return escapeCSV(value);
      }).join(',');
    });

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const csvContent = BOM + [headerRow, ...dataRows].join('\n');
    console.log("📄 CSV generated");

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set response headers
    const fileName = `students_export_${new Date().toISOString().split('T')[0]}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add CSV file to archive
    archive.append(csvContent, { name: 'students_data.csv' });

    // Collect all certificate URLs to download
    const certificatePromises = [];

    console.log("🔍 Scanning for certificates in achievements...");

    for (const student of filteredStudents) {
      if (student.achievements && student.achievements.length > 0) {
        console.log(`👤 Student: ${student.name} (${student.rollNumber}) - ${student.achievements.length} achievements`);

        for (const achievement of student.achievements) {
          console.log(`  📜 Achievement: "${achievement.title}" - Status: ${achievement.status}`);
          console.log(`     proofFiles:`, achievement.proofFiles);
          console.log(`     verificationInfo:`, achievement.verificationInfo);

          // Check proofFiles array (primary certificate storage)
          if (achievement.proofFiles && Array.isArray(achievement.proofFiles) && achievement.proofFiles.length > 0) {
            console.log(`     ✅ Found ${achievement.proofFiles.length} proof files`);
            achievement.proofFiles.forEach((fileUrl, idx) => {
              if (fileUrl && typeof fileUrl === 'string' && fileUrl.trim()) {
                const safeRollNumber = (student.rollNumber || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
                const safeTitle = (achievement.title || 'certificate').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);

                // Extract extension from URL properly
                let extension = 'pdf';
                try {
                  const urlObj = new URL(fileUrl);
                  const pathname = urlObj.pathname;
                  const lastDot = pathname.lastIndexOf('.');
                  if (lastDot !== -1) {
                    extension = pathname.substring(lastDot + 1).toLowerCase();
                  }
                } catch (e) {
                  // If URL parsing fails, try simple extraction
                  const parts = fileUrl.split('.');
                  if (parts.length > 1) {
                    extension = parts.pop().split('?')[0].toLowerCase();
                  }
                }

                const certFileName = `certificates/${safeRollNumber}_${safeTitle}_${idx + 1}.${extension}`;
                console.log(`     📎 Adding to download: ${certFileName}`);
                console.log(`        URL: ${fileUrl}`);

                certificatePromises.push({
                  url: fileUrl,
                  fileName: certFileName
                });
              }
            });
          } else {
            console.log(`     ⚠️ No proof files found for this achievement`);
          }

          // Also check verificationInfo.certificateUrl
          if (achievement.verificationInfo?.certificateUrl) {
            const certUrl = achievement.verificationInfo.certificateUrl;
            console.log(`     ✅ Found verification certificate URL: ${certUrl}`);
            const safeRollNumber = (student.rollNumber || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
            const safeTitle = (achievement.title || 'certificate').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);

            let extension = 'pdf';
            try {
              const urlObj = new URL(certUrl);
              const pathname = urlObj.pathname;
              const lastDot = pathname.lastIndexOf('.');
              if (lastDot !== -1) {
                extension = pathname.substring(lastDot + 1).toLowerCase();
              }
            } catch (e) {
              const parts = certUrl.split('.');
              if (parts.length > 1) {
                extension = parts.pop().split('?')[0].toLowerCase();
              }
            }

            const certFileName = `certificates/${safeRollNumber}_${safeTitle}_verification.${extension}`;

            certificatePromises.push({
              url: certUrl,
              fileName: certFileName
            });
          }
        }
      }
    }

    console.log(`📎 Found ${certificatePromises.length} certificates to include`);

    // Determine uploads path
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    const uploadsPath = isProduction ? '/tmp/uploads' : path.join(__dirname, "../../uploads");

    // Function to add file to archive
    const addFileToArchive = async (certInfo) => {
      return new Promise((resolve) => {
        try {
          let url = certInfo.url;

          // Check if this is a local file path
          if (url.startsWith('/uploads/')) {
            // Try to read from local disk first
            const fileName = url.replace('/uploads/', '');
            const localPath = path.join(uploadsPath, fileName);

            console.log(`📂 Checking local file: ${localPath}`);

            if (fs.existsSync(localPath)) {
              const fileStream = fs.createReadStream(localPath);
              archive.append(fileStream, { name: certInfo.fileName });
              console.log(`✅ Added from disk: ${certInfo.fileName}`);
              resolve();
              return;
            } else {
              console.log(`⚠️ Local file not found: ${localPath}`);
              // Fall through to try HTTP download
              const baseUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:5000';
              url = baseUrl + url;
            }
          }

          // Handle full URLs (S3, etc.)
          if (!url.startsWith('http')) {
            console.log(`⚠️ Invalid URL format: ${url}`);
            resolve();
            return;
          }

          console.log(`📥 Downloading from URL: ${url}`);

          const protocol = url.startsWith('https') ? https : http;

          const request = protocol.get(url, {
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          }, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
              const redirectUrl = response.headers.location;
              console.log(`🔄 Redirect to: ${redirectUrl}`);
              const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
              redirectProtocol.get(redirectUrl, { timeout: 30000 }, (redirectResponse) => {
                if (redirectResponse.statusCode === 200) {
                  archive.append(redirectResponse, { name: certInfo.fileName });
                  console.log(`✅ Added (after redirect): ${certInfo.fileName}`);
                } else {
                  console.log(`⚠️ Redirect failed: ${redirectUrl} (Status: ${redirectResponse.statusCode})`);
                }
                resolve();
              }).on('error', (err) => {
                console.log(`⚠️ Redirect error: ${err.message}`);
                resolve();
              });
              return;
            }

            if (response.statusCode === 200) {
              archive.append(response, { name: certInfo.fileName });
              console.log(`✅ Added: ${certInfo.fileName}`);
            } else {
              console.log(`⚠️ Failed to download: ${url} (Status: ${response.statusCode})`);
            }
            resolve();
          });

          request.on('error', (err) => {
            console.log(`⚠️ Error downloading ${url}: ${err.message}`);
            resolve();
          });

          request.on('timeout', () => {
            console.log(`⚠️ Timeout downloading ${url}`);
            request.destroy();
            resolve();
          });

        } catch (err) {
          console.log(`⚠️ Error processing ${certInfo.url}: ${err.message}`);
          resolve();
        }
      });
    };

    // Add all certificates to archive
    for (const certInfo of certificatePromises) {
      await addFileToArchive(certInfo);
    }

    // If no certificates were found, add a readme file explaining this
    if (certificatePromises.length === 0) {
      archive.append('No certificates found for the selected students.', { name: 'certificates/README.txt' });
    }

    // Finalize archive
    await archive.finalize();
    console.log("📦 ZIP archive finalized");

  } catch (err) {
    console.error("❌ ZIP Export error:", err);
    res.status(500).json({ message: err.message });
  }
}
