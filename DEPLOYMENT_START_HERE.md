# 🚀 InturnX Deployment - START HERE

## Choose Your Deployment Strategy

### Option 1: Railway Only (Recommended) ⭐

**Deploy everything on Railway - Simplest option!**

```
┌─────────────────────────────┐
│      Railway App            │
│  ┌──────────────────────┐   │
│  │  Frontend (React)    │   │
│  │  Backend (Express)   │   │
│  │  Same URL!           │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

**👉 Follow this guide:** [`RAILWAY_ONLY_DEPLOYMENT.md`](./RAILWAY_ONLY_DEPLOYMENT.md)

**Pros:**
- ✅ One platform to manage
- ✅ No CORS issues
- ✅ Simpler setup
- ✅ Lower cost

---

### Option 2: Vercel + Railway

**Deploy frontend on Vercel, backend on Railway**

```
┌─────────────┐         ┌─────────────┐
│   Vercel    │  API    │   Railway   │
│  (Frontend) │ ──────> │  (Backend)  │
└─────────────┘         └─────────────┘
```

**👉 Follow this guide:** [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

**Pros:**
- ✅ Faster frontend (Vercel Edge)
- ✅ Better for high traffic

**Cons:**
- ❌ More complex setup
- ❌ CORS configuration needed
- ❌ Two platforms to manage

---

## Quick Start (Railway Only)

### 1️⃣ Set Environment Variables in Railway

```bash
MONGODB_URI=mongodb+srv://ankitsri033_db_user:ankit123@inturnx.tl9f2ed.mongodb.net/inturnx?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-in-production
NODE_ENV=production
GITHUB_CLIENT_ID=Ov23lieErq3f4U5xx5wS
GITHUB_CLIENT_SECRET=ac2ad11263ddc7c21a015959e364c8252f35260e
```

### 2️⃣ Deploy to Railway

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

Railway will automatically:
- Build your React frontend
- Start your Express backend
- Give you a URL like: `https://inturnx-production.up.railway.app`

### 3️⃣ Update OAuth Callback

Update GitHub OAuth callback URL to:
```
https://your-railway-app.railway.app/api/auth/github/callback
```

### 4️⃣ Test Your App

Visit: `https://your-railway-app.railway.app`

Login with:
- Email: `demo@inturnx.com`
- Password: `demo123`

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[RAILWAY_ONLY_DEPLOYMENT.md](./RAILWAY_ONLY_DEPLOYMENT.md)** | Complete Railway-only guide ⭐ |
| **[DEPLOYMENT_OPTIONS.md](./DEPLOYMENT_OPTIONS.md)** | Compare deployment options |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Vercel + Railway guide |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Common issues & fixes |
| **[RAILWAY_DEPLOYMENT_SUMMARY.md](./RAILWAY_DEPLOYMENT_SUMMARY.md)** | Quick reference |

---

## 🆘 Need Help?

### Build Failing?
→ Check `TROUBLESHOOTING.md` → "Build Fails" section

### Server Won't Start?
→ Check `TROUBLESHOOTING.md` → "Server Won't Start" section

### CORS Errors?
→ If using Railway only: Shouldn't happen!  
→ If using Vercel + Railway: Check `DEPLOYMENT_GUIDE.md`

### OAuth Not Working?
→ Update callback URLs to your Railway domain

---

## 🎯 Recommendation

**Start with Railway Only!**

It's the simplest option and works great for most apps. You can always switch to Vercel + Railway later if you need the extra performance.

---

## 📋 Checklist

Before deploying:
- [ ] MongoDB Atlas is set up and accessible
- [ ] GitHub OAuth app is created
- [ ] Environment variables are ready
- [ ] Code is pushed to GitHub

After deploying:
- [ ] Test backend health: `/api/health`
- [ ] Test frontend loads
- [ ] Test login functionality
- [ ] Update OAuth callback URLs

---

## 🚀 Ready to Deploy?

1. Choose your deployment option (Railway Only recommended)
2. Follow the appropriate guide
3. Set environment variables
4. Push to GitHub
5. Test your app!

**Good luck! 🎉**
