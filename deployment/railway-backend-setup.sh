#!/bin/bash

# Railway Deployment Guide for QNOVA VR Backend

echo "🚂 Railway Backend Deployment Guide"
echo "===================================="
echo ""
echo "1. Go to https://railway.app"
echo "2. Sign up with GitHub account"
echo "3. Create new project: 'QNOVA VR Backend'"
echo ""
echo "4. Deploy from GitHub:"
echo "   - Connect your GitHub repository"
echo "   - Select backend folder as root directory"
echo "   - Railway will auto-detect Python/FastAPI"
echo ""
echo "5. Environment Variables (Add these in Railway dashboard):"
echo "   MONGO_URL=mongodb+srv://..."
echo "   DB_NAME=qnova_vr_production"
echo "   GMAIL_USER=qnovavr.de@gmail.com"
echo "   GMAIL_APP_PASSWORD=noeycxknfpcmpjir"
echo "   ENVIRONMENT=production"
echo ""
echo "6. Custom Domain:"
echo "   - Generate Railway domain: xxxxx.up.railway.app"
echo "   - Or add custom domain: api.qnova-vr.com"
echo ""
echo "7. Auto-deployments:"
echo "   - Enable auto-deployments from main branch"
echo "   - Every git push will trigger new deployment"
echo ""
echo "✅ Backend will be live at: https://xxxxx.up.railway.app"