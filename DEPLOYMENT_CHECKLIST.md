# ✅ AWS Deployment Checklist - Student ERP Portal

## 📋 PRE-DEPLOYMENT

### Backend Preparation
- [ ] All environment variables added to .env
- [ ] MongoDB Atlas whitelist: `0.0.0.0/0` (all IPs) or specific EC2 IP
- [ ] Changed admin password from default
- [ ] JWT secrets are strong (32+ characters)
- [ ] Email credentials configured (Gmail app password)
- [ ] Gemini API key added
- [ ] Tested all endpoints locally
- [ ] No console.errors or warnings
- [ ] uploads/ folder exists

### Frontend Preparation
- [ ] Updated `.env.production` with backend URL
- [ ] Tested build locally: `npm run build`
- [ ] No build errors
- [ ] Removed debugging code
- [ ] Updated app name/branding
- [ ] Tested in production mode locally

### AWS Account Setup
- [ ] AWS account created
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws configure`
- [ ] Selected deployment region (e.g., us-east-1)
- [ ] Billing alerts set up

---

## 🚀 BACKEND DEPLOYMENT

### Option A: EC2 Deployment
- [ ] EC2 instance launched (t2.micro or t2.small)
- [ ] Security group allows: SSH (22), HTTP (80), Custom TCP (5000)
- [ ] Connected via SSH
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Code uploaded to EC2
- [ ] .env file created on EC2
- [ ] Ran `npm install --production`
- [ ] Started with PM2: `pm2 start server.js --name erp-backend`
- [ ] PM2 startup configured: `pm2 startup && pm2 save`
- [ ] Tested: `curl http://localhost:5000/api/health`
- [ ] Health check returns 200 OK

### Option B: Elastic Beanstalk
- [ ] EB CLI installed: `pip install awsebcli`
- [ ] Initialized: `eb init`
- [ ] Environment created: `eb create erp-backend-prod`
- [ ] Environment variables set: `eb setenv ...`
- [ ] Deployed: `eb deploy`
- [ ] Health check green: `eb status`
- [ ] Tested: App URL works

### Domain & SSL (Optional)
- [ ] Domain purchased/configured in Route 53
- [ ] A record points to EC2 elastic IP
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] HTTPS working

---

## 🎨 FRONTEND DEPLOYMENT

### S3 + CloudFront
- [ ] S3 bucket created: `student-erp-frontend`
- [ ] Static website hosting enabled
- [ ] Bucket policy allows public read
- [ ] Built frontend: `npm run build`
- [ ] Uploaded to S3: `aws s3 sync dist/ s3://bucket-name --delete`
- [ ] CloudFront distribution created
- [ ] CloudFront origin: S3 bucket
- [ ] Default root object: `index.html`
- [ ] Error pages configured (404 → index.html)
- [ ] Tested CloudFront URL works

### Amplify (Alternative)
- [ ] Code pushed to GitHub
- [ ] Amplify app created
- [ ] GitHub connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Auto-deploy working

---

## 🔒 SECURITY VERIFICATION

- [ ] Backend uses HTTPS (SSL certificate)
- [ ] Frontend uses HTTPS
- [ ] CORS configured with specific frontend URL
- [ ] MongoDB has strong password
- [ ] MongoDB IP whitelist configured
- [ ] Admin password changed from default
- [ ] JWT secrets are unique and strong
- [ ] Rate limiting enabled on auth routes
- [ ] File upload size limited
- [ ] Input validation on all routes
- [ ] No sensitive data in logs
- [ ] .env files not committed to Git
- [ ] Security groups minimal (least privilege)

---

## 🧪 POST-DEPLOYMENT TESTING

### Backend Tests
- [ ] Health check: `GET /api/health` → 200 OK
- [ ] Admin login works
- [ ] Student registration works
- [ ] Student login works
- [ ] File upload works
- [ ] Email notifications send successfully
- [ ] Achievement submission works
- [ ] Admin approval/rejection works
- [ ] Leaderboard loads
- [ ] Analytics dashboard works
- [ ] ERP data loads
- [ ] All CRUD operations work

### Frontend Tests
- [ ] Landing page loads
- [ ] Login redirects correctly
- [ ] Admin dashboard accessible
- [ ] Student dashboard accessible
- [ ] File uploads work
- [ ] File downloads work
- [ ] Images display correctly
- [ ] Forms submit successfully
- [ ] Notifications appear
- [ ] Navigation works
- [ ] Responsive on mobile
- [ ] No console errors

### Integration Tests
- [ ] Login from frontend → backend auth works
- [ ] File upload from frontend → files saved on backend
- [ ] File download → files served with auth token
- [ ] Email triggered when achievement approved
- [ ] Points update when achievement approved
- [ ] Leaderboard updates in real-time
- [ ] Analytics reflect latest data

---

## 📊 MONITORING SETUP

- [ ] CloudWatch alarms configured (CPU, Memory)
- [ ] PM2 monitoring: `pm2 monit`
- [ ] Log rotation enabled
- [ ] Backup strategy for MongoDB
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Error tracking (Sentry, etc.)
- [ ] Analytics (Google Analytics, etc.)

---

## 📝 DOCUMENTATION

- [ ] Backend URL documented
- [ ] Frontend URL documented
- [ ] Admin credentials documented (securely)
- [ ] Deployment process documented
- [ ] Emergency rollback procedure documented
- [ ] Team members have access
- [ ] Runbook created for common issues

---

## 🎯 FINAL CHECKS

- [ ] All features working end-to-end
- [ ] Performance acceptable (page load < 3s)
- [ ] Mobile responsive
- [ ] No broken links
- [ ] All images load
- [ ] SSL valid and not expired
- [ ] Favicon displays
- [ ] Browser tab title correct
- [ ] SEO meta tags added
- [ ] Robots.txt configured

---

## 🚨 ROLLBACK PLAN

If deployment fails:

### Backend Rollback
```bash
# EC2
pm2 stop erp-backend
git checkout previous-commit
npm install
pm2 restart erp-backend

# Elastic Beanstalk
eb deploy --version previous-version
```

### Frontend Rollback
```bash
# S3
aws s3 sync old-dist/ s3://bucket-name --delete

# CloudFront invalidation
aws cloudfront create-invalidation --distribution-id ID --paths '/*'
```

---

## 📞 SUPPORT CONTACTS

- **AWS Support**: https://console.aws.amazon.com/support/
- **MongoDB Atlas Support**: https://support.mongodb.com/
- **Your Team Lead**: [Name/Contact]

---

## ✅ DEPLOYMENT COMPLETE

When all checks pass:
- [ ] Deployment announcement sent to team
- [ ] Users notified of new system
- [ ] Training materials shared
- [ ] Support channels ready
- [ ] Celebrate! 🎉

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Deployed By**: _______________  
**Date**: _______________  
**Backend URL**: _______________  
**Frontend URL**: _______________
