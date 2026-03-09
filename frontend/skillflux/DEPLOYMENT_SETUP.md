# Frontend Configuration for Deployed Backend

## ✅ Configuration Complete!

Your frontend is now configured to work with the deployed backend at:
**https://skillflux-backend.vercel.app**

## 📝 What Was Changed

### 1. **API Configuration** (`src/config/api.js`)
   - Created centralized API configuration
   - All file URLs now use the Vercel backend
   - Easy to switch between local and production

### 2. **Axios Instance** (`src/api/axiosInstance.js`)
   - Updated default baseURL to Vercel backend
   - Falls back to environment variable if set

### 3. **File URLs Updated**
   - ✅ `Students.jsx` - Profile pictures and certificates
   - ✅ `Profile.jsx` - Profile pictures and resume downloads
   - ✅ `AchievementCard.jsx` - Certificate proof files
   - ✅ `ManageAchievements.jsx` - Certificate proof files

### 4. **Environment Files**
   - ✅ `.env.example` - Template for configuration
   - ✅ `.env.production` - Production configuration

## 🚀 Local Development Setup

If you want to run locally with local backend:

1. Create a `.env.local` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_BACKEND_URL=http://localhost:5000
   ```

2. Start your local backend:
   ```bash
   cd d:/stackhack/backend
   npm run dev
   ```

3. Start your frontend:
   ```bash
   cd d:/stackhack/frontend/skillflux
   npm run dev
   ```

## 🌐 Production Setup (Already Configured)

The frontend is already configured to use the production backend:
- **API URL**: https://skillflux-backend.vercel.app/api
- **File URL**: https://skillflux-backend.vercel.app

No additional configuration needed! Just deploy your frontend.

## 📤 Deploy Frontend to Vercel

1. **Push to GitHub:**
   ```bash
   cd d:/stackhack/frontend/skillflux
   git add .
   git commit -m "Configure frontend for deployed backend"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your frontend repository
   - Vercel will auto-detect Vite configuration
   - Click "Deploy"

3. **Environment Variables (Optional):**
   If you want to override the default URLs:
   - Add `VITE_API_BASE_URL` = `https://skillflux-backend.vercel.app/api`
   - Add `VITE_BACKEND_URL` = `https://skillflux-backend.vercel.app`

## ✅ Testing Checklist

After deployment, test these features:

- [ ] Student login/registration
- [ ] Admin login
- [ ] Profile picture upload and display
- [ ] Resume upload and download
- [ ] Achievement submission with certificates
- [ ] Certificate viewing in admin panel
- [ ] Certificate download
- [ ] ERP submission
- [ ] AI certificate analysis (admin)

## 🔧 Troubleshooting

### Images/Files Not Loading
**Issue:** Profile pictures or certificates showing broken images

**Solution:**
1. Check browser console for errors
2. Verify backend is accessible: https://skillflux-backend.vercel.app/
3. Check if files were uploaded correctly
4. Note: Files in Vercel's /tmp directory are temporary (see backend README)

### API Requests Failing
**Issue:** API calls returning 404 or CORS errors

**Solution:**
1. Verify backend URL is correct in browser console
2. Check CORS configuration in backend
3. Ensure `FRONTEND_URL` is set correctly in backend's Vercel environment variables

### Local Development Not Working
**Issue:** Can't connect to local backend

**Solution:**
1. Create `.env.local` file with local URLs (see above)
2. Make sure local backend is running on port 5000
3. Check backend console for errors

## 📚 File Structure

```
frontend/skillflux/
├── src/
│   ├── api/
│   │   └── axiosInstance.js     (API client)
│   ├── config/
│   │   └── api.js               (API configuration)
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── Students.jsx     (Updated)
│   │   │   └── ManageAchievements.jsx (Updated)
│   │   └── Student/
│   │       └── Profile.jsx      (Updated)
│   └── components/
│       └── AchievementCard.jsx  (Updated)
├── .env.example                 (Template)
├── .env.production              (Production config)
└── DEPLOYMENT_SETUP.md          (This file)
```

## 🎉 You're All Set!

Your frontend is now configured and ready to deploy! The configuration will:
- ✅ Work with deployed backend out of the box
- ✅ Support local development with `.env.local`
- ✅ Handle file uploads and downloads correctly
- ✅ Display images and certificates from backend

Deploy your frontend and enjoy your full-stack application! 🚀
