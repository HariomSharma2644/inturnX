# InturnX Deployment Guide

## Overview
This guide will help you deploy InturnX with:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

## Prerequisites
- Vercel account
- Railway account
- MongoDB Atlas account (already configured)
- GitHub repository

---

## Part 1: Deploy Backend to Railway

### Step 1: Prepare Railway Environment Variables
In your Railway project, add the following environment variables:

```
MONGODB_URI=mongodb+srv://ankitsri033_db_user:ankit123@inturnx.tl9f2ed.mongodb.net/inturnx?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-in-production
NODE_ENV=production
PORT=3001
SERVER_URL=https://your-railway-app.railway.app
CLIENT_URL=https://your-vercel-app.vercel.app
GITHUB_CLIENT_ID=Ov23lieErq3f4U5xx5wS
GITHUB_CLIENT_SECRET=ac2ad11263ddc7c21a015959e364c8252f35260e
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
AI_SERVICE_URL=http://localhost:5000
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

**Important Notes:**
- Replace `your-railway-app.railway.app` with your actual Railway domain
- Replace `your-vercel-app.vercel.app` with your actual Vercel domain
- Update OAuth credentials if needed
- Generate strong secrets for JWT_SECRET and SESSION_SECRET

### Step 2: Configure Railway Deployment
1. Go to your Railway project
2. Connect your GitHub repository
3. Set the **Root Directory** to `server`
4. Railway will automatically detect the Node.js project
5. The `railway.toml` and `Procfile` are already configured

### Step 3: Deploy
1. Push your changes to GitHub
2. Railway will automatically deploy
3. Check the deployment logs for any errors
4. Note your Railway app URL (e.g., `https://inturnx-production.up.railway.app`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Vercel Environment Variables
In your Vercel project settings, add:

```
VITE_API_URL=https://your-railway-app.railway.app
```

Replace `your-railway-app.railway.app` with your actual Railway backend URL.

### Step 2: Configure Vercel Deployment
1. Go to Vercel dashboard
2. Import your GitHub repository
3. Set the **Root Directory** to `client`
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. The `vercel.json` is already configured for SPA routing

### Step 3: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Note your Vercel app URL (e.g., `https://inturnx.vercel.app`)

---

## Part 3: Update Environment Variables

### Update Railway Backend
Go back to Railway and update the `CLIENT_URL` environment variable with your actual Vercel URL:
```
CLIENT_URL=https://inturnx.vercel.app
```

This will trigger a redeployment.

### Update Vercel Frontend
Ensure the `VITE_API_URL` points to your Railway backend:
```
VITE_API_URL=https://inturnx-production.up.railway.app
```

Redeploy if needed.

---

## Part 4: Update OAuth Callback URLs

### GitHub OAuth
1. Go to your GitHub OAuth App settings
2. Update the callback URL to:
   ```
   https://your-railway-app.railway.app/api/auth/github/callback
   ```

### Google OAuth (if configured)
1. Go to Google Cloud Console
2. Update authorized redirect URIs to:
   ```
   https://your-railway-app.railway.app/api/auth/google/callback
   ```

### LinkedIn OAuth (if configured)
1. Go to LinkedIn Developer Portal
2. Update redirect URLs to:
   ```
   https://your-railway-app.railway.app/api/auth/linkedin/callback
   ```

---

## Troubleshooting

### Backend Issues

#### Error: "Cannot connect to MongoDB"
- Check if `MONGODB_URI` is correctly set in Railway
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Railway's IP

#### Error: "CORS policy blocked"
- Ensure `CLIENT_URL` in Railway matches your Vercel URL exactly
- Check that the URL includes `https://` and no trailing slash

#### Error: "Application failed to start"
- Check Railway logs: `railway logs`
- Verify all required environment variables are set
- Ensure `package.json` has correct start script

### Frontend Issues

#### Error: "API calls failing"
- Verify `VITE_API_URL` in Vercel points to Railway backend
- Check Railway backend is running and accessible
- Inspect browser console for CORS errors

#### Error: "404 on page refresh"
- Ensure `vercel.json` is in the `client` directory
- Verify the rewrite rules are configured correctly

#### Error: "Build failed"
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Socket.IO Issues

#### WebSocket connection failing
- Ensure Railway backend allows WebSocket connections
- Check that `CLIENT_URL` is correctly configured
- Verify Socket.IO CORS settings match frontend URL

---

## Verification Steps

1. **Test Backend Health**
   ```
   curl https://your-railway-app.railway.app/api/health
   ```
   Should return: `{"status":"OK","message":"InturnX Server is running"}`

2. **Test Frontend**
   - Visit your Vercel URL
   - Check browser console for errors
   - Try logging in with demo credentials:
     - Email: `demo@inturnx.com`
     - Password: `demo123`

3. **Test API Connection**
   - Open browser DevTools → Network tab
   - Navigate through the app
   - Verify API calls go to Railway backend

---

## Security Checklist

- [ ] Changed default JWT_SECRET
- [ ] Changed default SESSION_SECRET
- [ ] Updated OAuth credentials
- [ ] MongoDB connection string is secure
- [ ] Environment variables are not exposed in client code
- [ ] CORS is configured to only allow your Vercel domain
- [ ] HTTPS is enabled on both Railway and Vercel

---

## Monitoring

### Railway
- View logs: Railway Dashboard → Deployments → Logs
- Monitor metrics: CPU, Memory, Network usage

### Vercel
- View deployment logs: Vercel Dashboard → Deployments
- Analytics: Vercel Dashboard → Analytics

---

## Common Commands

### Redeploy Railway
```bash
# Trigger redeploy by pushing to GitHub or use Railway CLI
railway up
```

### Redeploy Vercel
```bash
# Trigger redeploy by pushing to GitHub or use Vercel CLI
vercel --prod
```

### View Railway Logs
```bash
railway logs
```

---

## Support

If you encounter issues:
1. Check the logs on Railway and Vercel
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is accessible
4. Check OAuth callback URLs are updated
5. Review CORS configuration

---

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure CI/CD for automatic deployments
3. Set up monitoring and alerts
4. Implement backup strategy for MongoDB
5. Add error tracking (e.g., Sentry)
