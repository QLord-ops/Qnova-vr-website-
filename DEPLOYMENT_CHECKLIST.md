# 📋 QNOVA VR DEPLOYMENT CHECKLIST - TIER 1

## BEFORE YOU START - PREPARE THESE:
- [ ] GitHub account (for code repository)
- [ ] Email: qnovavr.de@gmail.com access
- [ ] Gmail app password: noeycxknfpcmpjir (already have this)
- [ ] 2-3 hours of time
- [ ] Phone for potential 2FA verifications

---

## STEP 1: MONGODB ATLAS (Database) ⏱️ 30 min
- [ ] Go to https://www.mongodb.com/atlas
- [ ] Sign up with qnovavr.de@gmail.com
- [ ] Create M0 (FREE) cluster in Frankfurt
- [ ] Create database user: qnova_admin
- [ ] Set network access: 0.0.0.0/0
- [ ] Copy connection string and save it
- [ ] Test connection works

**Connection string format:**
```
mongodb+srv://qnova_admin:PASSWORD@qnova-vr-cluster.xxxxx.mongodb.net/
```

---

## STEP 2: RAILWAY BACKEND (API Server) ⏱️ 45 min
- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] Create new project from GitHub repo
- [ ] Select "backend" folder as root
- [ ] Add environment variables:
  - [ ] MONGO_URL (from Step 1)
  - [ ] DB_NAME=qnova_vr_production
  - [ ] GMAIL_USER=qnovavr.de@gmail.com
  - [ ] GMAIL_APP_PASSWORD=noeycxknfpcmpjir
  - [ ] ENVIRONMENT=production
- [ ] Deploy and verify it works
- [ ] Test health check: YOUR_RAILWAY_URL/health
- [ ] Save your Railway URL

**Your Railway URL will be:**
```
https://your-project-name.up.railway.app
```

---

## STEP 3: VERCEL FRONTEND (Website) ⏱️ 30 min
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Import GitHub repository
- [ ] Set root directory: frontend
- [ ] Framework: Create React App
- [ ] Add environment variable:
  - [ ] REACT_APP_BACKEND_URL (Railway URL from Step 2)
- [ ] Deploy and verify it works
- [ ] Test full website functionality
- [ ] Save your Vercel URL

**Your Vercel URL will be:**
```
https://your-project-name.vercel.app
```

---

## STEP 4: MONITORING (Uptime Alerts) ⏱️ 15 min
- [ ] Go to https://uptimerobot.com
- [ ] Sign up for free account
- [ ] Add website monitor (Vercel URL)
- [ ] Add API monitor (Railway URL + /health)
- [ ] Set up email alerts to qnovavr.de@gmail.com
- [ ] Test alerts work

---

## STEP 5: FINAL TESTING ⏱️ 20 min
- [ ] Visit your Vercel website
- [ ] Test language selection works
- [ ] Navigate through all pages (Home, About, Services, Games, Pricing, Contact)
- [ ] Test booking system:
  - [ ] Book a VR session
  - [ ] Check you receive email notification
  - [ ] Verify booking appears in database
- [ ] Test contact form:
  - [ ] Send test message
  - [ ] Verify you receive email
- [ ] Test on mobile device
- [ ] Check website works in different browsers

---

## 🎉 SUCCESS CRITERIA

### Your website should have:
- [ ] ✅ Loads instantly from anywhere in the world
- [ ] ✅ HTTPS/SSL (green lock icon)
- [ ] ✅ Mobile responsive design
- [ ] ✅ All booking functionality works
- [ ] ✅ Email notifications working
- [ ] ✅ Contact form working
- [ ] ✅ Multi-language support (DE/EN/RU)
- [ ] ✅ 24/7 uptime monitoring
- [ ] ✅ Automatic backups

### Total Cost:
- [ ] ✅ Monthly: €0 (completely FREE!)
- [ ] ✅ Domain: €10-15/year (optional)

---

## 📞 EMERGENCY CONTACTS & RECOVERY

### If something breaks:
1. **Database issues**: MongoDB Atlas support
2. **Backend issues**: Railway support + GitHub repository
3. **Frontend issues**: Vercel support + GitHub repository
4. **Domain issues**: Your domain registrar support

### Access Recovery:
- GitHub: Your main code backup
- MongoDB Atlas: qnovavr.de@gmail.com login
- Railway: GitHub account access
- Vercel: GitHub account access

---

## 🚀 READY TO START?

**Current Status:**
- [ ] Haven't started yet
- [ ] MongoDB Atlas setup (Step 1) 
- [ ] Railway Backend deployed (Step 2)
- [ ] Vercel Frontend deployed (Step 3)  
- [ ] Monitoring configured (Step 4)
- [ ] ✅ FULLY DEPLOYED AND LIVE! 

**Once complete, your QNOVA VR website will be running 24/7 worldwide for FREE! 🌍**

---

**Next Action: Start with Step 1 - MongoDB Atlas setup (30 minutes)**