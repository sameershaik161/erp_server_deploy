# AWS Deployment Guide - Student ERP Portal

## 🚀 Complete AWS Deployment Instructions

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- Node.js 18+ installed locally
- Git installed

---

## 📦 BACKEND DEPLOYMENT

### Option 1: AWS EC2 (Recommended for Full Control)

#### Step 1: Launch EC2 Instance
```bash
# 1. Go to AWS Console → EC2 → Launch Instance
# 2. Choose Amazon Linux 2023 or Ubuntu 22.04 LTS
# 3. Instance type: t2.micro (free tier) or t2.small
# 4. Create or select key pair (.pem file)
# 5. Security Group: Allow ports 22 (SSH), 80 (HTTP), 5000 (Custom)
# 6. Launch instance
```

#### Step 2: Connect to EC2
```bash
# Windows (PowerShell)
ssh -i "your-key.pem" ec2-user@your-instance-public-ip

# Or for Ubuntu
ssh -i "your-key.pem" ubuntu@your-instance-public-ip
```

#### Step 3: Upload Code to EC2
```bash
# Option A: Using SCP
scp -i "your-key.pem" -r ./backend ec2-user@your-instance-ip:/home/ec2-user/erp_portal/

# Option B: Using Git (Recommended)
# On EC2:
git clone your-repository-url
cd erp_portal/backend
```

#### Step 4: Deploy Backend
```bash
# On EC2 instance
cd /home/ec2-user/erp_portal/backend

# Make deploy script executable
chmod +x deploy-ec2.sh

# Run deployment
./deploy-ec2.sh
```

#### Step 5: Configure Environment Variables
```bash
# Create .env file on EC2
nano .env

# Copy content from .env.example and fill in:
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_secret
FRONTEND_URL=https://your-frontend-url.s3-website.region.amazonaws.com
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
GEMINI_API_KEY=your_api_key

# Save: Ctrl+O, Enter, Ctrl+X
```

#### Step 6: Start Application
```bash
# Application starts automatically via deploy script
# Check status
pm2 status
pm2 logs erp-backend

# Your backend is now running at:
# http://your-ec2-public-ip:5000
```

#### Step 7: Setup Domain (Optional but Recommended)
```bash
# 1. Buy domain from Route 53 or external provider
# 2. Create A record pointing to EC2 public IP
# 3. Install Nginx as reverse proxy:

sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure Nginx
sudo nano /etc/nginx/conf.d/erp-backend.conf

# Add:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Save and restart Nginx
sudo systemctl restart nginx
```

#### Step 8: Setup SSL (Free with Let's Encrypt)
```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

---

### Option 2: AWS Elastic Beanstalk (Easiest)

#### Step 1: Install EB CLI
```bash
pip install awsebcli --upgrade --user
```

#### Step 2: Initialize EB Application
```bash
cd backend
eb init

# Follow prompts:
# - Select region (e.g., us-east-1)
# - Application name: student-erp-backend
# - Platform: Node.js 18
# - SSH: Yes
# - Generate new keypair: Yes
```

#### Step 3: Create Environment
```bash
eb create erp-backend-prod

# This will:
# - Create load balancer
# - Launch EC2 instance
# - Deploy your app
# - Configure security groups
```

#### Step 4: Set Environment Variables
```bash
eb setenv NODE_ENV=production \
  MONGO_URI="your_mongodb_uri" \
  JWT_SECRET="your_jwt_secret" \
  ADMIN_JWT_SECRET="your_admin_secret" \
  EMAIL_USER="your_email" \
  EMAIL_PASSWORD="your_password" \
  GEMINI_API_KEY="your_key"
```

#### Step 5: Deploy Updates
```bash
# After making changes
eb deploy

# Check status
eb status

# View logs
eb logs

# Your app URL:
# http://erp-backend-prod.elasticbeanstalk.com
```

---

## 🎨 FRONTEND DEPLOYMENT

### Option 1: AWS S3 + CloudFront (Recommended - Fast & Cheap)

#### Step 1: Build Frontend
```bash
cd frontend/skillflux

# Update .env.production with your backend URL
# VITE_API_BASE_URL=http://your-ec2-ip:5000/api
# VITE_BACKEND_URL=http://your-ec2-ip:5000

# Build
npm run build

# This creates a 'dist' folder
```

#### Step 2: Create S3 Bucket
```bash
# Via AWS CLI
aws s3 mb s3://student-erp-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://student-erp-frontend --index-document index.html --error-document index.html
```

#### Step 3: Upload to S3
```bash
# Upload dist folder
aws s3 sync dist/ s3://student-erp-frontend --delete

# Make files public
aws s3api put-bucket-policy --bucket student-erp-frontend --policy file://bucket-policy.json
```

Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::student-erp-frontend/*"
    }
  ]
}
```

#### Step 4: Setup CloudFront (CDN)
```bash
# 1. Go to AWS Console → CloudFront → Create Distribution
# 2. Origin Domain: student-erp-frontend.s3.amazonaws.com
# 3. Origin Path: leave blank
# 4. Viewer Protocol: Redirect HTTP to HTTPS
# 5. Allowed HTTP Methods: GET, HEAD, OPTIONS
# 6. Default Root Object: index.html
# 7. Create Distribution

# Your app will be at:
# https://d111111abcdef8.cloudfront.net
```

#### Step 5: Custom Domain (Optional)
```bash
# 1. Request SSL Certificate in ACM (us-east-1 for CloudFront)
# 2. Add CNAME in CloudFront distribution
# 3. Update Route 53 with CloudFront domain
```

---

### Option 2: AWS Amplify (Easiest - Auto Deploy from Git)

#### Step 1: Push to GitHub
```bash
cd frontend/skillflux
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo
git push -u origin main
```

#### Step 2: Deploy via AWS Amplify
```bash
# 1. Go to AWS Console → Amplify → New App → Host Web App
# 2. Connect GitHub repository
# 3. Select branch: main
# 4. Build settings (auto-detected):
amplify.yml:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

```bash
# 5. Add environment variables:
VITE_API_BASE_URL=http://your-backend-url/api
VITE_BACKEND_URL=http://your-backend-url

# 6. Deploy - it will auto-deploy on every git push!

# Your app URL:
# https://main.d111111abcdef8.amplifyapp.com
```

---

## 🔒 SECURITY CHECKLIST

### Backend
- [ ] Change default admin password
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS with specific frontend URL
- [ ] Set NODE_ENV=production
- [ ] Secure MongoDB (IP whitelist, strong password)
- [ ] Rate limiting on login endpoints
- [ ] Input validation on all routes
- [ ] Security group: Only allow necessary ports

### Frontend
- [ ] Update API URLs in .env.production
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Remove console.logs in production
- [ ] Set secure cookie flags

---

## 📊 MONITORING & MAINTENANCE

### Backend Monitoring
```bash
# PM2 monitoring (EC2)
pm2 monit

# View logs
pm2 logs erp-backend --lines 100

# Restart app
pm2 restart erp-backend

# View resource usage
pm2 status
```

### CloudWatch (Elastic Beanstalk)
```bash
# View metrics in AWS Console
# - CPU usage
# - Memory usage
# - Network traffic
# - Application errors

# Set up alarms for high CPU/memory
```

---

## 💰 COST ESTIMATE

### Minimal Setup (< $10/month)
- EC2 t2.micro (free tier): $0
- S3 storage: ~$1
- CloudFront: ~$1
- Route 53 (if using): $0.50/month per hosted zone
- **Total: ~$2-3/month** (after free tier)

### Production Setup (~$20-30/month)
- EC2 t2.small: ~$17/month
- S3 + CloudFront: ~$2-5/month
- Route 53: $0.50/month
- SSL Certificate (ACM): Free
- **Total: ~$20-25/month**

---

## 🐛 TROUBLESHOOTING

### Backend won't start
```bash
# Check logs
pm2 logs erp-backend

# Common issues:
# 1. Missing .env file → Create it
# 2. Port already in use → Change PORT in .env
# 3. MongoDB connection failed → Check MONGO_URI
# 4. Missing dependencies → Run npm install
```

### Frontend shows API errors
```bash
# 1. Check backend is running
curl http://your-backend-url/api/health

# 2. Check CORS
# Open browser console, look for CORS errors
# Update FRONTEND_URL in backend .env

# 3. Rebuild frontend with correct API URL
cd frontend/skillflux
# Update .env.production
npm run build
aws s3 sync dist/ s3://your-bucket --delete
```

### File uploads not working
```bash
# 1. Check uploads directory exists
ls -la /home/ec2-user/erp_portal/backend/uploads

# 2. Create if missing
mkdir -p uploads
chmod 755 uploads

# 3. For S3 uploads, configure AWS credentials
aws configure
```

---

## 📞 SUPPORT

If you encounter issues:
1. Check application logs: `pm2 logs`
2. Check system logs: `sudo tail -f /var/log/messages`
3. Verify environment variables: `eb printenv`
4. Test API health: `curl http://your-backend/api/health`

---

## 🚀 Quick Start Commands

### Deploy Backend to EC2
```bash
./deploy-ec2.sh
```

### Deploy Frontend to S3
```bash
npm run build && aws s3 sync dist/ s3://your-bucket --delete
```

### Check Everything is Working
```bash
# Backend health
curl https://your-backend.com/api/health

# Frontend
curl https://your-frontend.com

# Should both return 200 OK
```

---

**You're all set! Your Student ERP Portal is now deployed on AWS! 🎉**
