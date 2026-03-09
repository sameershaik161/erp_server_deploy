#!/bin/bash

# Frontend Build and Deploy Script for AWS S3

echo "🎨 Building Frontend for AWS Deployment..."

# Navigate to frontend directory
cd frontend/skillflux || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🏗️  Building production bundle..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed! dist folder not found"
  exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📁 Build artifacts in: dist/"
echo ""
echo "🚀 To deploy to S3, run:"
echo "   aws s3 sync dist/ s3://your-bucket-name --delete"
echo ""
echo "🌐 Then invalidate CloudFront cache:"
echo "   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'"
