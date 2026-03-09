import Achievement from "../models/Achievement.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";
import { calculateAchievementPoints, addPoints } from "../services/points.service.js";
import { suspiciousActivityDetector } from "../services/suspiciousActivityDetection.js";

export async function addAchievement(req, res) {
  try {
    console.log("Received body:", req.body);
    const { title, achievementType, description, category, subCategory, dateOfIssue, organizedInstitute, level, award } = req.body;

    // Validate required fields
    if (!title || !achievementType || !category || !dateOfIssue || !organizedInstitute || !level) {
      console.log("Missing fields check:", { title, achievementType, category, dateOfIssue, organizedInstitute, level });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate that non-technical category has a sub-category
    if (category === "Non-technical" && !subCategory) {
      return res.status(400).json({ message: "Sub-category is required for non-technical achievements" });
    }

    // Validate that competition type has an award
    if (achievementType === "Competition" && !award) {
      return res.status(400).json({ message: "Award is required for competition achievements" });
    }

    // Map files to local paths instead of S3 URLs
    const proofFiles = (req.files || []).map(f => `/uploads/${f.filename}`);
    const links = { leetcode: req.body.leetcode || "", linkedin: req.body.linkedin || "", codechef: req.body.codechef || "" };

    const achievementData = {
      student: req.user._id,
      title,
      achievementType,
      description,
      category,
      dateOfIssue,
      organizedInstitute,
      level,
      proofFiles,
      links
    };

    // Add subCategory only if it's a non-technical achievement
    if (category === "Non-technical") {
      achievementData.subCategory = subCategory;
    }

    // Add award only if it's a competition
    if (achievementType === "Competition") {
      achievementData.award = award;
    }

    // Note: Points are not awarded here, only when admin approves the achievement
    const ach = await Achievement.create(achievementData);

    // Run suspicious activity detection
    console.log('🕵️ Running suspicious activity detection...');
    const suspiciousAnalysis = await suspiciousActivityDetector.analyzeSubmissionPattern(
      req.user._id,
      achievementData
    );

    // Store suspicious activity results
    if (suspiciousAnalysis.isSuspicious || suspiciousAnalysis.requiresReview) {
      ach.suspiciousActivity = suspiciousAnalysis;
      await ach.save();
      console.log('⚠️ Suspicious activity detected for achievement:', ach._id, {
        riskScore: suspiciousAnalysis.riskScore,
        patterns: suspiciousAnalysis.suspiciousPatterns.map(p => p.type)
      });
    }

    await User.findByIdAndUpdate(req.user._id, { $push: { achievements: ach._id } });

    const response = {
      message: "Achievement submitted successfully for review",
      achievement: ach
    };

    // Include warning if suspicious
    if (suspiciousAnalysis.isSuspicious) {
      response.warning = "Submission flagged for additional review due to suspicious patterns";
    }

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function myAchievements(req, res) {
  try {
    const items = await Achievement.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAchievement(req, res) {
  try {
    const a = await Achievement.findById(req.params.id).populate("student", "name rollNumber section");
    if (!a) return res.status(404).json({ message: "Not found" });
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAchievement(req, res) {
  try {
    const ach = await Achievement.findById(req.params.id);
    if (!ach) return res.status(404).json({ message: "Not found" });
    if (!ach.student.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });
    await Achievement.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $pull: { achievements: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin functions
export async function getAllAchievements(req, res) {
  try {
    const { status, student } = req.query;
    const query = {};
    if (status) query.status = status;
    if (student) query.student = student;

    const achievements = await Achievement.find(query)
      .populate("student", "name rollNumber email section year")
      .sort({ createdAt: -1 });
      
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function approveAchievement(req, res) {
  try {
    const { id } = req.params;
    const { adminNote, customPoints } = req.body;

    const achievement = await Achievement.findById(id);
    if (!achievement) return res.status(404).json({ message: "Achievement not found" });

    // Calculate points based on achievement type, level, and award
    let calculatedPoints;
    if (customPoints !== undefined && customPoints !== null) {
      // Admin can override with custom points
      calculatedPoints = Number(customPoints);
    } else {
      // Auto-calculate based on type, level, and award
      calculatedPoints = calculateAchievementPoints(
        achievement.achievementType,
        achievement.level,
        achievement.award
      );
    }

    achievement.status = "approved";
    achievement.points = calculatedPoints;
    if (adminNote) achievement.adminNote = adminNote;

    await achievement.save();

    // Add points to user using the points service
    if (calculatedPoints > 0) {
      await addPoints(achievement.student.toString(), calculatedPoints);
    }

    res.json({
      message: "Achievement approved and points awarded",
      achievement,
      pointsAwarded: calculatedPoints
    });
  } catch (err) {
    console.error("Error approving achievement:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function rejectAchievement(req, res) {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const achievement = await Achievement.findById(id);
    if (!achievement) return res.status(404).json({ message: "Achievement not found" });

    achievement.status = "rejected";
    if (adminNote) achievement.adminNote = adminNote;

    await achievement.save();
    
    res.json({ message: "Achievement rejected", achievement });
  } catch (err) {
    console.error("Error rejecting achievement:", err);
    res.status(500).json({ message: err.message });
  }
}

// Utility function to fix broken file references (Admin only)
export async function cleanupBrokenFiles(req, res) {
  try {
    const achievements = await Achievement.find({});
    let cleanedCount = 0;
    
    for (const achievement of achievements) {
      const originalCount = achievement.proofFiles.length;
      const cleanedFiles = cleanupFileReferences(achievement.proofFiles);
      
      if (cleanedFiles.length !== originalCount) {
        achievement.proofFiles = cleanedFiles;
        await achievement.save();
        cleanedCount++;
      }
    }
    
    res.json({
      message: `Cleaned up broken file references in ${cleanedCount} achievements`,
      totalAchievements: achievements.length,
      cleanedAchievements: cleanedCount
    });
  } catch (err) {
    console.error("Error cleaning up broken files:", err);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Export approved achievements to Excel (.xlsx)
 * GET /api/achievements/admin/export
 */
export async function exportApprovedAchievements(req, res) {
  try {
    const { submissionYear } = req.query;

    const query = { status: "approved" };

    if (submissionYear) {
      const yearNum = Number(submissionYear);
      if (!Number.isNaN(yearNum) && yearNum > 1900) {
        const start = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0));
        const end = new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0));
        query.createdAt = { $gte: start, $lt: end };
      }
    }

    // Query approved achievements with populated student data
    const achievements = await Achievement.find(query)
      .populate("student", "name rollNumber email department section year academicBatch admissionYear graduationYear")
      .lean()
      .sort({ createdAt: -1 });

    if (!achievements.length) {
      return res.status(404).json({ message: "No approved achievements found" });
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ERP Portal";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Approved Achievements", {
      views: [{ state: "frozen", ySplit: 1 }], // Freeze header row
    });

    // Define columns with headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Department", key: "department", width: 12 },
      { header: "Section", key: "section", width: 10 },
      { header: "Year", key: "year", width: 8 },
      { header: "Academic Batch", key: "academicBatch", width: 15 },
      { header: "Admission Year", key: "admissionYear", width: 15 },
      { header: "Graduation Year", key: "graduationYear", width: 15 },
      { header: "Achievement Title", key: "title", width: 40 },
      { header: "Category", key: "category", width: 15 },
      { header: "Points", key: "points", width: 10 },
      { header: "Proof Image URL", key: "proofUrl", width: 50 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Add data rows
    achievements.forEach((achievement) => {
      const student = achievement.student || {};

      // Get proof URL - support both proofUrl (single) and proofFiles (array)
      let proofUrl = achievement.proofUrl;
      if (!proofUrl && achievement.proofFiles && achievement.proofFiles.length > 0) {
        proofUrl = achievement.proofFiles[0];
      }

      // Handle array of objects if that's how it's stored (just in case)
      if (typeof proofUrl === 'object' && proofUrl.url) {
        proofUrl = proofUrl.url;
      }

      const row = worksheet.addRow({
        name: student.name || "N/A",
        rollNumber: student.rollNumber || "N/A",
        email: student.email || "N/A",
        department: student.department || "N/A",
        section: student.section || "N/A",
        year: student.year || "N/A",
        academicBatch: student.academicBatch || "N/A",
        admissionYear: student.admissionYear || "N/A",
        graduationYear: student.graduationYear || "N/A",
        title: achievement.title || "N/A",
        category: achievement.category || "N/A",
        points: achievement.points || 0,
        proofUrl: "N/A", // Default value
      });

      // Make Proof Image URL clickable using ExcelJS hyperlink format
      if (proofUrl) {
        // Ensure we have a valid string
        proofUrl = String(proofUrl);

        const fullUrl = proofUrl.startsWith("http")
          ? proofUrl
          : `${process.env.BASE_URL || "http://localhost:5000"}${proofUrl}`;

        try {
          // Log the URL for debugging
          console.log(`Setting hyperlink for achievement ${achievement._id}: ${fullUrl}`);

          const proofCell = row.getCell("proofUrl");
          proofCell.value = {
            text: "View Proof",
            hyperlink: fullUrl,
            tooltip: "Click to view proof",
          };
          proofCell.font = {
            color: { argb: "FF0066CC" },
            underline: true,
            bold: false,
          };
        } catch (cellError) {
          console.error(`Error setting hyperlink for achievement ${achievement._id}:`, cellError);
          row.getCell("proofUrl").value = fullUrl; // Fallback to raw URL text
        }
      }

      row.alignment = { vertical: "middle" };
    });

    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column) => {
      let maxLength = column.header.length;
      column.eachCell({ includeEmpty: false }, (cell) => {
        const cellValue = cell.value?.text || cell.value?.toString() || "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, column.width), 60);
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `approved_achievements_${timestamp}.xlsx`;

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting achievements to Excel:", err);
    res.status(500).json({ message: "Failed to export achievements", error: err.message });
  }
}
