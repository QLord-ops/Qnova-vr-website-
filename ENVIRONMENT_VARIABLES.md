# 🔧 QNOVA VR ENVIRONMENT VARIABLES REFERENCE

## CURRENT LOCAL DEVELOPMENT SETTINGS:
```
# Backend (.env)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
GMAIL_USER="qnovavr.de@gmail.com"
GMAIL_APP_PASSWORD="noeycxknfpcmpjir"

# Frontend (.env)
REACT_APP_BACKEND_URL=https://24607d59-36e2-4bb0-b229-c4ef7359ba00.preview.emergentagent.com
WDS_SOCKET_PORT=443
```

## PRODUCTION ENVIRONMENT VARIABLES:

### Railway Backend Environment Variables:
```bash
MONGO_URL=mongodb+srv://qnova_admin:YOUR_MONGODB_PASSWORD@qnova-vr-cluster.xxxxx.mongodb.net/
DB_NAME=qnova_vr_production
GMAIL_USER=qnovavr.de@gmail.com
GMAIL_APP_PASSWORD=noeycxknfpcmpjir
ENVIRONMENT=production
PORT=8001
```

### Vercel Frontend Environment Variables:
```bash
REACT_APP_BACKEND_URL=https://your-railway-project.up.railway.app
```

## IMPORTANT NOTES:
- Replace YOUR_MONGODB_PASSWORD with actual MongoDB Atlas password
- Replace your-railway-project with actual Railway project name
- Gmail app password is already configured and working
- Never commit .env files to public repositories
- Keep these credentials secure

## GMAIL CONFIGURATION DETAILS:
- Email: qnovavr.de@gmail.com
- App Password: noeycxknfpcmpjir
- This is already working for email notifications
- Studio owner receives booking notifications
- Customers receive German confirmation emails