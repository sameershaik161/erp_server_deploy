#!/bin/bash
# Build script for Ubuntu Server deployment at /skillflux

echo "🏗️  Building SkillFlux for Ubuntu Server deployment..."
echo "Server: http://160.187.169.41/skillflux"
echo ""

# Navigate to frontend directory
cd frontend/skillflux

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for production
echo "🔨 Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build output location: frontend/skillflux/dist"
    echo ""
    echo "Next steps:"
    echo "1. Upload the 'dist' folder to your Ubuntu server"
    echo "2. Update nginx configuration (see nginx-skillflux.conf)"
    echo "3. Restart nginx: sudo systemctl reload nginx"
    echo ""
    echo "🌐 Your app will be available at: http://160.187.169.41/skillflux"
else
    echo ""
    echo "❌ Build failed! Check the errors above."
    exit 1
fi
