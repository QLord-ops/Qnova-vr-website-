# 🚀 QNOVA VR - Tier 1 Deployment Guide
# Free/Low-Cost 24/7 Website Setup

## 🎯 OVERVIEW
This will deploy your website for FREE using:
- MongoDB Atlas (Free 512MB)
- Railway Backend (Free tier) 
- Vercel Frontend (Free tier)
- Total cost: €0/month + domain (~€10-15/year)

## ⏰ ESTIMATED TIME: 2-3 hours total

---

## STEP 1: MONGODB ATLAS SETUP (30 minutes)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" 
3. Sign up with email: qnovavr.de@gmail.com
4. Choose "Build a database" → "M0 (Free)"
5. Provider: AWS, Region: Frankfurt (eu-central-1)
6. Cluster Name: "qnova-vr-cluster"

### 1.2 Configure Database Access
1. Database Access → Add New Database User
   - Username: qnova_admin
   - Password: Generate secure password (SAVE THIS!)
   - Privileges: "Read and write to any database"

### 1.3 Configure Network Access
1. Network Access → Add IP Address
   - Access List Entry: 0.0.0.0/0 (Allow access from anywhere)
   - Comment: "Allow all IPs for deployment"

### 1.4 Get Connection String
1. Clusters → Connect → "Connect your application"
2. Driver: Python, Version: 3.11 or later
3. Copy connection string:
   ```
   mongodb+srv://qnova_admin:<password>@qnova-vr-cluster.xxxxx.mongodb.net/
   ```
4. Replace <password> with your actual password
5. SAVE THIS CONNECTION STRING!

---

## STEP 2: RAILWAY BACKEND DEPLOYMENT (45 minutes)

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Verify email

### 2.2 Deploy Backend
1. New Project → "Deploy from GitHub repo"
2. Connect your GitHub repository
3. Select the repository with QNOVA VR code
4. Choose "backend" folder as root directory

### 2.3 Configure Environment Variables
In Railway dashboard → Variables tab, add:

```
MONGO_URL=mongodb+srv://qnova_admin:YOUR_PASSWORD@qnova-vr-cluster.xxxxx.mongodb.net/
DB_NAME=qnova_vr_production
GMAIL_USER=qnovavr.de@gmail.com
GMAIL_APP_PASSWORD=noeycxknfpcmpjir
ENVIRONMENT=production
PORT=8001
```

### 2.4 Configure Build Settings
1. Settings → Build Command: `pip install -r requirements.txt`
2. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
3. Deploy!

### 2.5 Get Your Backend URL
After deployment, you'll get a URL like:
`https://your-project-name.up.railway.app`

SAVE THIS URL - you'll need it for frontend!

---

## STEP 3: VERCEL FRONTEND DEPLOYMENT (30 minutes)

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Import your GitHub repository

### 3.2 Configure Project
1. Project Name: qnova-vr-frontend
2. Framework Preset: Create React App
3. Root Directory: frontend
4. Build Command: yarn build (or npm run build)
5. Output Directory: build

### 3.3 Environment Variables
Add in Vercel dashboard → Settings → Environment Variables:

```
REACT_APP_BACKEND_URL=https://your-project-name.up.railway.app
```
(Use the Railway URL from Step 2.5)

### 3.4 Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your site will be live at: `https://your-project-name.vercel.app`

---

## STEP 4: DOMAIN SETUP (15 minutes) - OPTIONAL

### 4.1 Purchase Domain (if you want custom domain)
1. Go to Namecheap, GoDaddy, or Google Domains
2. Search for available domain: qnova-vr.com
3. Purchase domain (~€10-15/year)

### 4.2 Configure Domain in Vercel
1. Vercel Dashboard → Domains → Add Domain
2. Enter: qnova-vr.com
3. Follow DNS setup instructions
4. Add CNAME record pointing to Vercel

### 4.3 Update Backend CORS (if using custom domain)
Update Railway environment variable:
```
CORS_ORIGINS=https://qnova-vr.com,https://www.qnova-vr.com
```

---

## STEP 5: TESTING & MONITORING (20 minutes)

### 5.1 Test Your Deployed Website
1. Frontend: https://your-project-name.vercel.app
2. Backend Health: https://your-project-name.up.railway.app/health
3. Test booking system end-to-end
4. Test contact form

### 5.2 Set Up Free Monitoring
1. Go to https://uptimerobot.com
2. Sign up for free account
3. Add monitors:
   - Website: https://your-domain.com
   - API: https://your-backend-url.up.railway.app/health
4. Set up email alerts to: qnovavr.de@gmail.com

---

## ✅ CHECKLIST - VERIFY EVERYTHING WORKS

- [ ] MongoDB Atlas cluster running
- [ ] Railway backend deployed and responding
- [ ] Vercel frontend deployed and loading
- [ ] Booking system works end-to-end
- [ ] Contact form sends emails
- [ ] All pages load correctly
- [ ] Mobile responsiveness working
- [ ] Monitoring alerts configured

---

## 📱 WHAT YOU'LL HAVE AFTER DEPLOYMENT

### ✅ 24/7 Website Features:
- Website accessible worldwide 24/7
- Automatic HTTPS/SSL certificates
- Global CDN for fast loading
- Automatic backups (MongoDB Atlas)
- Email notifications working
- Mobile-responsive design
- Multi-language support (DE/EN/RU)

### ✅ Free Tier Limits:
- MongoDB: 512MB storage (plenty for thousands of bookings)
- Railway: 500 hours/month runtime (adequate for small business)
- Vercel: 100GB bandwidth (sufficient for most websites)
- 99.9% uptime SLA

### ✅ Costs:
- Monthly: €0 (completely free!)
- Yearly: €10-15 for domain (optional)

---

## 🆘 TROUBLESHOOTING

### Common Issues:
1. **Build fails on Railway**: Check requirements.txt format
2. **Frontend can't connect to backend**: Verify REACT_APP_BACKEND_URL
3. **Database connection fails**: Check MongoDB Atlas IP whitelist
4. **Email not working**: Verify GMAIL_APP_PASSWORD is correct

### Need Help?
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs  
- MongoDB Atlas docs: https://docs.atlas.mongodb.com

---

## 🎉 CONGRATULATIONS!

Your QNOVA VR website will be running 24/7 globally for FREE!

**Your websites will be:**
- Frontend: https://your-project-name.vercel.app (or custom domain)
- Backend API: https://your-project-name.up.railway.app
- Admin dashboard: MongoDB Atlas web interface

**Ready to go live? Let's start with Step 1! 🚀**