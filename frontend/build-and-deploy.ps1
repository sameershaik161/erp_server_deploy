# Build and Deploy Frontend to AWS S3
# PowerShell script for Windows

Write-Host "🎨 Building Frontend for AWS Deployment..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location "skillflux"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build for production
Write-Host "🏗️  Building production bundle..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if (!(Test-Path "dist")) {
    Write-Host "❌ Build failed! dist folder not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Build artifacts in: dist/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 To deploy to S3, run:" -ForegroundColor Yellow
Write-Host "   aws s3 sync dist/ s3://your-bucket-name --delete" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Then invalidate CloudFront cache:" -ForegroundColor Yellow
Write-Host "   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'" -ForegroundColor White
