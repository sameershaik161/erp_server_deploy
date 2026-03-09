# 🚀 AWS Deployment - Quick Start Guide

## ⚡ FASTEST DEPLOYMENT (5 Minutes)

### Backend (EC2)
```bash
# 1. Launch EC2 (t2.micro, Amazon Linux 2023)
# 2. SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 3. Upload and deploy
scp -i your-key.pem -r backend ec2-user@your-ec2-ip:~/
ssh -i your-key.pem ec2-user@your-ec2-ip
cd backend
chmod +x deploy-ec2.sh
./deploy-ec2.sh

# 4. Create .env file (copy from .env.example)
nano .env
# Set NODE_ENV=production
# Add your MongoDB URI
# Add frontend URL

# Done! Backend running at: http://your-ec2-ip:5000
```

### Frontend (S3)
```bash
# 1. Update backend URL
cd frontend/skillflux
# Edit .env.production:
# VITE_API_BASE_URL=http://your-ec2-ip:5000/api
# VITE_BACKEND_URL=http://your-ec2-ip:5000

# 2. Build
npm run build

# 3. Create S3 bucket
aws s3 mb s3://your-unique-bucket-name

# 4. Upload
aws s3 sync dist/ s3://your-unique-bucket-name --delete
aws s3 website s3://your-unique-bucket-name --index-document index.html

# 5. Make public
aws s3api put-bucket-acl --bucket your-unique-bucket-name --acl public-read

# Done! Frontend at: http://your-unique-bucket-name.s3-website-region.amazonaws.com
```

---

## 🔧 KEY CONFIGURATION CHANGES

### Backend Changes Made:
1. ✅ Port is now dynamic (uses ENV variable)
2. ✅ CORS allows AWS frontend URLs
3. ✅ Environment validation added
4. ✅ Health check endpoint: `/api/health`
5. ✅ Production-ready error handling
6. ✅ Supports EC2, Elastic Beanstalk, and Vercel
7. ✅ File uploads work in production
8. ✅ Logging configured for production

### Frontend Changes Made:
1. ✅ API URLs use environment variables
2. ✅ Production build optimized
3. ✅ Console logging for debugging
4. ✅ Works with S3, CloudFront, Amplify

---

## 📁 NEW FILES CREATED

### Backend
- `.env.example` - Template for environment variables
- `src/utils/validateEnv.js` - Environment validation
- `deploy-ec2.sh` - EC2 deployment script
- `.ebextensions/nodecommand.config` - Elastic Beanstalk config
- `.platform/nginx/conf.d/uploads.conf` - Nginx config
- `package.aws.json` - AWS-specific package.json

### Frontend
- `build-and-deploy.sh` - Build script (Linux/Mac)
- `build-and-deploy.ps1` - Build script (Windows)

### Documentation
- `AWS_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

---

## 🎯 CRITICAL ENVIRONMENT VARIABLES

### Backend (.env)
```env
# MUST UPDATE FOR AWS:
NODE_ENV=production                    # Change from development
PORT=5000                              # EC2: 5000, EB: 8080
FRONTEND_URL=https://your-frontend-url # Your S3/CloudFront URL

# Already Configured (verify these):
MONGO_URI=mongodb+srv://...            # ✅ Already set
JWT_SECRET=...                         # ✅ Already strong
ADMIN_JWT_SECRET=...                   # ✅ Already strong
EMAIL_USER=...                         # ✅ Already set
EMAIL_PASSWORD=...                     # ✅ Already set
GEMINI_API_KEY=...                     # ✅ Already set
```

### Frontend (.env.production)
```env
# MUST UPDATE:
VITE_API_BASE_URL=http://your-ec2-ip:5000/api
VITE_BACKEND_URL=http://your-ec2-ip:5000

# After deployment, use:
# VITE_API_BASE_URL=https://api.yourdomain.com/api
# VITE_BACKEND_URL=https://api.yourdomain.com
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Before Deploying Backend:
- [ ] Updated `.env` with NODE_ENV=production
- [ ] Updated `.env` with FRONTEND_URL
- [ ] MongoDB Atlas allows EC2 IP or 0.0.0.0/0
- [ ] Changed admin password from default
- [ ] Tested locally with `npm start`

### Before Deploying Frontend:
- [ ] Updated `.env.production` with backend URL
- [ ] Tested build: `npm run build`
- [ ] No build errors
- [ ] Tested in production mode locally

---

## 🔥 COMMON ISSUES & FIXES

### Backend Issues

**Problem**: MongoDB connection failed
```bash
# Fix: Whitelist EC2 IP in MongoDB Atlas
# 1. Go to MongoDB Atlas → Network Access
# 2. Add IP: 0.0.0.0/0 (allow all) or specific EC2 IP
```

**Problem**: Port already in use
```bash
# Fix: Kill existing process
pm2 stop all
pm2 delete all
pm2 start server.js --name erp-backend
```

**Problem**: CORS error from frontend
```bash
# Fix: Update FRONTEND_URL in .env
FRONTEND_URL=https://your-actual-frontend-url.com
pm2 restart erp-backend
```

### Frontend Issues

**Problem**: API not reachable
```bash
# Fix: Check backend URL in .env.production
# Rebuild and redeploy
npm run build
aws s3 sync dist/ s3://bucket --delete
```

**Problem**: Blank page after deployment
```bash
# Fix: S3 error document not set
aws s3 website s3://bucket --index-document index.html --error-document index.html
```

---

## 🧪 TEST AFTER DEPLOYMENT

```bash
# 1. Backend health check
curl http://your-ec2-ip:5000/api/health
# Should return: {"status":"healthy",...}

# 2. Frontend loads
curl http://your-s3-website-url
# Should return HTML

# 3. API connection from frontend
# Open frontend in browser
# Open DevTools → Network
# Login should call backend successfully
```

---

## 📊 AWS RESOURCES CREATED

After deployment, you'll have:
- **EC2 Instance**: Running Node.js backend
- **S3 Bucket**: Hosting React frontend  
- **Security Group**: Allowing ports 22, 80, 5000
- **MongoDB Atlas**: Database (already exists)
- **Optional**: CloudFront, Route 53, ACM Certificate

---

## 💰 ESTIMATED COSTS

**Free Tier (First 12 months)**:
- EC2 t2.micro: Free
- S3: Free (5GB)
- Data Transfer: Free (15GB)
- **Total: $0/month**

**After Free Tier**:
- EC2 t2.micro: ~$8.50/month
- S3: ~$1/month
- Data Transfer: ~$1/month
- **Total: ~$10-12/month**

---

## 🆘 EMERGENCY ROLLBACK

If something goes wrong:
```bash
# Backend (EC2)
pm2 stop erp-backend
# Fix issue or restore code
pm2 restart erp-backend

# Frontend (S3)
# Re-upload old dist folder
aws s3 sync old-dist/ s3://bucket --delete
```

---

## 🎉 SUCCESS CHECKLIST

After deployment, verify:
- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Login works (admin & student)
- [ ] File upload works
- [ ] Email notifications work
- [ ] All pages navigate correctly
- [ ] Mobile responsive
- [ ] HTTPS working (if configured)

---

## 📞 NEXT STEPS

1. **Set up domain** (optional)
   - Buy domain from Route 53
   - Point to EC2 for backend
   - Point to CloudFront for frontend

2. **Enable HTTPS**
   - Install Let's Encrypt on EC2
   - Use ACM certificate for CloudFront

3. **Set up monitoring**
   - CloudWatch alarms
   - PM2 monitoring
   - Error tracking

4. **Regular backups**
   - MongoDB Atlas automatic backups
   - EC2 snapshots
   - S3 versioning

---

**🚀 Your app is now LIVE on AWS! 🎊**

Backend: `http://your-ec2-ip:5000`  
Frontend: `http://your-bucket.s3-website.amazonaws.com`

For detailed instructions, see: `AWS_DEPLOYMENT_GUIDE.md`
