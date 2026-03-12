# PowerShell build script for Ubuntu Server deployment at /skillflux

Write-Host "🏗️  Building SkillFlux for Ubuntu Server deployment..." -ForegroundColor Cyan
Write-Host "Server: http://160.187.169.41/skillflux" -ForegroundColor Yellow
Write-Host ""

# Navigate to frontend directory
Set-Location frontend\skillflux

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build for production
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Build output location: frontend\skillflux\dist" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Upload the 'dist' folder to your Ubuntu server" -ForegroundColor White
    Write-Host "2. Update nginx configuration (see nginx-skillflux.conf)" -ForegroundColor White
    Write-Host "3. Restart nginx: sudo systemctl reload nginx" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Your app will be available at: http://160.187.169.41/skillflux" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location ..\..
