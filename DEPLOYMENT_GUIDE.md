# 🚀 QNOVA VR Deployment Guide

## 📋 Prerequisites
- GitHub account
- Vercel account (free) - for frontend
- Railway account (free) - for backend
- MongoDB Atlas account (free) - for database

## 🗂️ Project Structure
```
qnova-vr/
├── backend/          # FastAPI backend
│   ├── server.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.template
└── frontend/         # React frontend
    ├── src/
    ├── package.json
    └── vercel.json
```

## 🔧 Step-by-Step Deployment

### 1. 🎯 Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account and new cluster
3. Create a database user with read/write permissions
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Note down this connection string for later

### 2. 📧 Email Setup (Gmail)
1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords" and generate a new one
4. Select "Mail" as the app type
5. Note down the 16-character app password

### 3. 🌐 Backend Deployment (Railway)
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your repository and choose the `backend` folder
5. Set environment variables:
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: `qnova_vr`
   - `GMAIL_USER`: `qnovavr.de@gmail.com`
   - `GMAIL_APP_PASSWORD`: Your Gmail app password
6. Deploy and note the Railway URL (e.g., `https://your-app.railway.app`)

### 4. 🎨 Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Click "New Project" and select your repository
4. Set root directory to `frontend`
5. Set environment variable:
   - `REACT_APP_BACKEND_URL`: Your Railway backend URL
6. Deploy and get your Vercel URL (e.g., `https://qnova-vr.vercel.app`)

### 5. 🔗 Final Configuration
1. Update backend CORS settings to allow your frontend URL
2. Test the website functionality
3. Verify booking and contact forms work

## 🌟 Your Live URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`

## 🔧 Environment Variables Reference

### Backend (.env)
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=qnova_vr
GMAIL_USER=qnovavr.de@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

### Frontend (.env.local)
```env
REACT_APP_BACKEND_URL=https://your-backend.railway.app
```

## 🚨 Important Notes
- Keep your Gmail app password secure
- The free MongoDB Atlas tier has 512MB storage limit
- Railway free tier has 512MB RAM and 1GB storage
- Vercel free tier has excellent performance for static sites

## 🎉 Success!
Your QNOVA VR website is now live with:
- ✅ Professional website design
- ✅ Working booking system
- ✅ Contact forms
- ✅ Email notifications
- ✅ Mobile responsive design
- ✅ Multi-language support

## 📞 Support
If you need help with deployment, check the platform documentation:
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)