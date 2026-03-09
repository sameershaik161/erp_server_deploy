# 📢 Announcement Email Notification System

## ✅ Feature Overview

When an admin creates a new announcement, the system can automatically send professional email notifications to:
- **Admin** (for confirmation)
- **All registered students** (optional)

## 📧 How It Works

### 1. **Admin Creates Announcement**
When you create a new announcement through the admin panel, the system:
- Saves the announcement to the database
- Automatically sends you a confirmation email
- Optionally sends emails to all students

### 2. **Email Types**

#### 📚 **Academic Announcements**
- Event notifications
- Workshop details
- Seminar information
- Shows: Event date, Venue

#### 💼 **Career Opportunities**
- Job postings
- Internship opportunities
- Campus recruitment drives
- Shows: Company, Location, Package, Deadline, Apply Link

## 🔧 Configuration

### Environment Variables Required:
```env
EMAIL_USER=shaiksamer7277@gmail.com
EMAIL_PASSWORD=prnhziktmrspwrmn
```

## 📋 API Usage

### Create Announcement with Email Notification

**Endpoint:** `POST /api/announcements`

**Headers:**
```json
{
  "Authorization": "Bearer <admin_token>"
}
```

**Request Body for Academic Announcement:**
```json
{
  "title": "Tech Symposium 2024",
  "description": "Join us for an exciting day of technology...",
  "type": "academic",
  "eventDate": "2024-12-15",
  "venue": "Main Auditorium",
  "isPinned": true,
  "sendToAllStudents": false
}
```

**Request Body for Career Opportunity:**
```json
{
  "title": "Google Campus Recruitment",
  "description": "Google is hiring fresh graduates...",
  "type": "career_opportunity",
  "company": "Google",
  "location": "Bangalore, Hyderabad",
  "package": "12-15 LPA",
  "deadline": "2024-11-30",
  "eligibilityCriteria": "B.Tech final year, 70% aggregate",
  "applyLink": "https://careers.google.com",
  "isPinned": true,
  "sendToAllStudents": true
}
```

### Key Parameters:
- `sendToAllStudents`: Set to `true` to email all registered students
- `isPinned`: Pin important announcements at the top
- `targetYear`: Specify year (1,2,3,4) or null for all

## 🧪 Testing

### Test the Email Feature:
```bash
cd backend
node test-announcement-email.mjs
```

This will send you sample emails for both announcement types.

## 📬 Email Features

### What Students Receive:
1. **Beautiful HTML Email** with your announcement details
2. **Clear Type Badge** (Academic or Career)
3. **All relevant details** formatted professionally
4. **Apply Now button** for career opportunities
5. **Admin name** who posted the announcement
6. **Timestamp** of when it was posted

### Email Preview:

#### Academic Announcement Email:
- Subject: "📚 Academic Announcement: [Title]"
- Shows event date and venue
- Professional formatting
- Clear call-to-action

#### Career Opportunity Email:
- Subject: "💼 Career Opportunity: [Title]"
- Company details and package
- Application deadline
- Direct apply link button
- Eligibility criteria

## 🎯 Usage Workflow

1. **Login as Admin**
   ```
   Username: admin
   Password: admin123
   ```

2. **Navigate to Manage Announcements**

3. **Create New Announcement**
   - Fill in the details
   - Choose type (Academic/Career)
   - Check "Send to all students" if needed
   - Click Submit

4. **Email Sent Automatically**
   - You receive confirmation email
   - Students receive notification (if selected)

## 📊 Benefits

1. **Instant Communication** - Students get notified immediately
2. **Professional Format** - Well-designed HTML emails
3. **No Manual Work** - Fully automated process
4. **Detailed Information** - All announcement details in email
5. **Call-to-Action** - Direct links for applications
6. **Track Engagement** - Know emails were sent successfully

## 🔒 Security

- Only authenticated admins can create announcements
- Email credentials stored securely in `.env`
- Students' emails protected and not exposed
- Batch processing to avoid overload

## 🚀 Quick Start

1. **Ensure email is configured** (already done ✅)
2. **Create an announcement** via admin panel
3. **Check "Send to all students"** if you want mass notification
4. **Submit** - Emails sent automatically!

## 📝 Console Logs

When creating announcement, you'll see:
```
📢 New announcement created: Tech Symposium 2024
📧 Sending email notifications...
📧 Admin notification: Sent
📧 Sending to 25 students...
📧 Emails sent: 25/25
```

## ⚠️ Important Notes

1. **Email Limits**: Gmail has daily sending limits (500 emails/day)
2. **Batch Processing**: Emails sent in parallel for efficiency
3. **Error Handling**: If email fails, announcement still gets created
4. **Spam Prevention**: Professional format reduces spam likelihood

## 🎉 Success!

Your announcement email system is fully configured and ready to use!

- Admin gets confirmation emails ✅
- Students can be notified automatically ✅
- Beautiful HTML templates ✅
- Works for both announcement types ✅

**Every new announcement can now trigger automatic email notifications!**
