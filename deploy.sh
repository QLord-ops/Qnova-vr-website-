#!/bin/bash

# 🚀 QNOVA VR Quick Deployment Script

echo "🎮 QNOVA VR Deployment Setup"
echo "============================="

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Please install Git first."; exit 1; }

echo "✅ Git found"

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p qnova-vr-deploy
cd qnova-vr-deploy

# Copy backend files
echo "📦 Copying backend files..."
mkdir -p backend
cp -r ../backend/* backend/

# Copy frontend files
echo "🎨 Copying frontend files..."
mkdir -p frontend
cp -r ../frontend/* frontend/

# Create README for deployment
echo "📄 Creating deployment README..."
cat > README.md << 'EOF'
# 🎮 QNOVA VR - Ready for Deployment

This directory contains the production-ready QNOVA VR website.

## 🚀 Quick Deploy

### Backend (Railway)
1. Go to https://railway.app/
2. Connect GitHub and select this repository
3. Choose the `backend` folder
4. Add environment variables (see .env.template)
5. Deploy!

### Frontend (Vercel)
1. Go to https://vercel.com/
2. Connect GitHub and select this repository
3. Choose the `frontend` folder
4. Add REACT_APP_BACKEND_URL environment variable
5. Deploy!

## 📋 Environment Variables Needed

### Backend:
- MONGO_URL (MongoDB Atlas connection string)
- DB_NAME (qnova_vr)
- GMAIL_USER (qnovavr.de@gmail.com)
- GMAIL_APP_PASSWORD (Gmail app password)

### Frontend:
- REACT_APP_BACKEND_URL (Your Railway backend URL)

## 🎉 That's it!
Your QNOVA VR website will be live with full functionality.
EOF

echo "✅ Deployment files prepared!"
echo ""
echo "🎯 Next Steps:"
echo "1. Push this directory to GitHub"
echo "2. Follow the DEPLOYMENT_GUIDE.md for detailed instructions"
echo "3. Deploy backend to Railway"
echo "4. Deploy frontend to Vercel"
echo ""
echo "🌟 Your QNOVA VR website will be live soon!"