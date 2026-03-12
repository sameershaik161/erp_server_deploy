# SkillFlux - Student ERP Portal

## Project Overview

SkillFlux is a comprehensive Student ERP (Enterprise Resource Planning) Portal designed to manage student achievements, activities, ERP data, and announcements. It provides separate views and features for Students and Administrators.

## Technology Stack

### Backend (Node.js & Express)
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Storage**: AWS S3 (via `multer-s3` and `aws-sdk`)
- **AI Integration**: Google Generative AI (`@google/generative-ai`)
- **Security**: Helmet, Express Mongo Sanitize, CORS
- **Other Utilities**: Nodemailer (Emails), ExcelJS (Exports), Archiver

### Frontend (React & Vite)
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (`/skillflux` basename)
- **Styling**: Tailwind CSS & Material UI (`@mui/material`)
- **Animations**: Framer Motion
- **Icons**: Lucide React & MUI Icons
- **HTTP Client**: Axios
- **Notifications**: React Toastify & React Hot Toast

---

## Backend Architecture

The backend follows an MVC-like pattern with a RESTful API structure under `/api/*`.

### Key Directories
- `src/models`: Mongoose schemas defining the data structure.
- `src/controllers`: Business logic for handling API requests.
- `src/routes`: Express route definitions connecting endpoints to controllers.
- `src/middlewares`: Custom middleware (e.g., authentication, file uploading, error handling).
- `src/utils`: Helper functions and utilities.

### Models
1. **User**: Represents students. Stores profile info, ERP credentials, and role.
2. **Admin**: Represents administrators with elevated privileges.
3. **Achievement**: Stores user-submitted achievements. Often linked to file uploads (S3).
4. **ERP**: Holds ERP-related data/updates for students.
5. **Announcement**: Stores system-wide or targeted announcements broadcasted by admins.

### API Routes
- `/api/auth`: Login, Registration, and authentication checks.
- `/api/achievements`: CRUD operations for student achievements.
- `/api/admin`: Administrative endpoints (user management, achievement verification, analytics).
- `/api/erp`: Endpoints for managing and syncing ERP data.
- `/api/announcements`: Managing and retrieving announcements.
- `/api/activities`: Tracking user activities.
- `/uploads`: Static file serving fallback for local development.

---

## Frontend Architecture

The frontend is a Single Page Application (SPA) providing distinct experiences based on user roles (Student vs. Admin).

### Key Pages & Routing

**Public Routes:**
- `/`: Landing Page
- `/login`: Student Login
- `/admin-login`: Admin Login
- `/register`: Student Registration

**Student Routes (Protected):**
- `/dashboard`: Main student overview.
- `/profile`: Student profile management.
- `/achievements`: Viewing personal achievements.
- `/add`: Adding new achievements (with file uploads).
- `/update-erp`: Updating ERP information.
- `/announcements`: Viewing active announcements.
- `/leaderboard`: Displaying top students based on metrics/achievements.

**Admin Routes (Protected - Admin Only):**
- `/admin`: Main administrative dashboard.
- `/admin/students`: Manage all registered students.
- `/admin/manage`: Review and verify student achievements.
- `/admin/analytics`: View system-wide statistics and charts.
- `/admin/manage-erp`: Manage system-wide ERP statuses.
- `/admin/announcements`: Create and manage announcements.

---

## Core Features

1. **Role-Based Access Control (RBAC):**
   - Secure distinction between Students and Admins via JWT.
   - Protected routes logic on the frontend to prevent unauthorized access.

2. **File Management:**
   - Secure uploading of achievement proofs and documents to AWS S3.
   - Local fallback for development environments.

3. **Analytics & Leaderboards:**
   - Admins have access to system usage analytics.
   - Students can view a Gamified Leaderboard to encourage participation.

4. **AI Capabilities:**
   - Integration with Google Generative AI for automated tasks, smart insights, or text analysis within the portal.

5. **Responsive Design:**
   - Built with Tailwind CSS and Material UI to ensure compatibility across desktop and mobile devices.

---

## Configuration & Environments

- **Environment Variables**: Managed via `.env` files (e.g., Database URIs, JWT Secrets, AWS Credentials, AI Keys).
- **Security Check**: Built-in environment validation on production startup.
- **Deployment Setups**: Configurations available for standard hosting (e.g., Vercel, Render) with custom Nginx deployment support (`nginx-skillflux.conf`).
