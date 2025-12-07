# Quick Deployment Troubleshooting

## Railway Backend Not Starting

### Error: "Application failed to respond"
**Cause:** Server not listening on correct port or host
**Fix:** Ensure server.js has:
```javascript
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Error: "Cannot find module"
**Cause:** Dependencies not installed
**Fix:** 
1. Check `package.json` has all dependencies
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install`
4. Commit and push

### Error: "MongoDB connection failed"
**Cause:** Invalid connection string or network access
**Fix:**
1. Verify `MONGODB_URI` in Railway environment variables
2. Check MongoDB Atlas → Network Access → Allow access from anywhere (0.0.0.0/0)
3. Ensure connection string has correct username/password

### Error: "CORS policy blocked"
**Cause:** CLIENT_URL doesn't match Vercel URL
**Fix:**
1. Update `CLIENT_URL` in Railway to exact Vercel URL
2. No trailing slash: `https://inturnx.vercel.app` ✅
3. Not: `https://inturnx.vercel.app/` ❌

---

## Vercel Frontend Not Building

### Error: "Build failed - command not found"
**Cause:** Build command incorrect
**Fix:**
1. Vercel Settings → Build & Development Settings
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Install Command: `npm install`

### Error: "Module not found"
**Cause:** Missing dependencies
**Fix:**
1. Ensure all imports are in `package.json` dependencies (not devDependencies)
2. Run locally: `npm run build` to test
3. Check for case-sensitive import issues

### Error: "Environment variable undefined"
**Cause:** VITE_API_URL not set
**Fix:**
1. Vercel → Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-railway-app.railway.app`
3. Redeploy

---

## API Calls Failing

### Error: "Network Error" or "Failed to fetch"
**Cause:** Backend URL incorrect or backend down
**Fix:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Test backend: `curl https://your-railway-app.railway.app/api/health`
3. Check Railway logs for errors

### Error: "401 Unauthorized"
**Cause:** JWT token issues or session configuration
**Fix:**
1. Check `JWT_SECRET` is set in Railway
2. Verify `SESSION_SECRET` is set
3. Clear browser cookies and try again

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** CORS misconfiguration
**Fix:**
1. Ensure `CLIENT_URL` in Railway matches Vercel URL exactly
2. Check server.js CORS configuration
3. Verify allowedOrigins includes your Vercel domain

---

## Socket.IO Connection Issues

### Error: "WebSocket connection failed"
**Cause:** Railway doesn't support WebSocket or CORS issue
**Fix:**
1. Railway should support WebSocket by default
2. Check Socket.IO CORS configuration in server.js
3. Verify client connects to correct backend URL

### Error: "Transport close"
**Cause:** Connection timeout or network issue
**Fix:**
1. Check Railway backend is running
2. Verify Socket.IO client configuration
3. Test with polling transport first

---

## OAuth Authentication Failing

### Error: "Callback URL mismatch"
**Cause:** OAuth callback URLs not updated
**Fix:**
1. GitHub: Update callback to `https://your-railway-app.railway.app/api/auth/github/callback`
2. Google: Update redirect URI in Google Cloud Console
3. LinkedIn: Update redirect URL in LinkedIn Developer Portal

### Error: "Invalid client"
**Cause:** OAuth credentials incorrect
**Fix:**
1. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Railway
2. Check credentials match OAuth app settings
3. Regenerate secrets if needed

---

## Database Issues

### Error: "MongoServerError: Authentication failed"
**Cause:** Wrong username/password in connection string
**Fix:**
1. Check MongoDB Atlas → Database Access
2. Verify username and password
3. Update `MONGODB_URI` in Railway

### Error: "MongooseServerSelectionError"
**Cause:** Cannot reach MongoDB server
**Fix:**
1. MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0
2. Check connection string format
3. Verify cluster is running

---

## 404 Errors on Page Refresh

### Error: "404 Not Found" when refreshing Vercel app
**Cause:** SPA routing not configured
**Fix:**
1. Ensure `vercel.json` exists in client directory
2. Check rewrites configuration:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Performance Issues

### Slow API responses
**Cause:** Database queries not optimized or cold starts
**Fix:**
1. Add database indexes
2. Implement caching
3. Railway: Upgrade plan to reduce cold starts

### High memory usage
**Cause:** Memory leaks or large payloads
**Fix:**
1. Check Railway metrics
2. Optimize database queries
3. Implement pagination for large datasets

---

## Quick Verification Checklist

### Railway Backend
- [ ] All environment variables set
- [ ] `CLIENT_URL` matches Vercel URL
- [ ] `MONGODB_URI` is correct
- [ ] Server starts without errors
- [ ] `/api/health` endpoint returns 200

### Vercel Frontend
- [ ] `VITE_API_URL` points to Railway backend
- [ ] Build completes successfully
- [ ] `vercel.json` configured for SPA routing
- [ ] Environment variables set

### OAuth
- [ ] Callback URLs updated for production
- [ ] Client IDs and secrets set in Railway
- [ ] OAuth apps approved/published

### Database
- [ ] MongoDB Atlas network access allows Railway
- [ ] Connection string is correct
- [ ] Database user has proper permissions

---

## Still Having Issues?

1. **Check Logs**
   - Railway: Dashboard → Deployments → Logs
   - Vercel: Dashboard → Deployments → Build Logs
   - Browser: DevTools → Console

2. **Test Locally**
   ```bash
   # Backend
   cd server
   npm install
   npm start

   # Frontend
   cd client
   npm install
   npm run dev
   ```

3. **Verify Environment**
   ```bash
   # Run health check script
   cd server
   node check-deployment.js
   ```

4. **Common Commands**
   ```bash
   # Railway CLI
   railway logs
   railway status
   
   # Vercel CLI
   vercel logs
   vercel env ls
   ```

---

## Contact & Support

If you're still stuck:
1. Check Railway status page
2. Check Vercel status page
3. Review MongoDB Atlas status
4. Check GitHub OAuth app status
