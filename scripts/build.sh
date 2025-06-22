#!/bin/bash

echo "🚀 Building mikucatswitch for static deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf .next/
rm -rf out/

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the application
echo "🔨 Building application..."
pnpm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Static files are in the 'dist' folder."
    echo "📁 Contents:"
    ls -la dist/
    echo ""
    echo "🌐 To preview locally, run: npm run preview"
    echo "📤 To deploy, upload the entire 'dist' folder to your web server."
    echo ""
    echo "📋 Deployment checklist:"
    echo "  ✓ All files are in dist/ folder"
    echo "  ✓ No server-side dependencies"
    echo "  ✓ Works with any static hosting"
    echo "  ✓ Supports relative paths"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi
