# Environment Variables for Railway-Only Deployment

Copy and paste these into your Railway dashboard under **Variables**.

## Required Variables

```bash
# Database
MONGODB_URI=mongodb+srv://ankitsri033_db_user:ankit123@inturnx.tl9f2ed.mongodb.net/inturnx?retryWrites=true&w=majority

# Security - CHANGE THESE!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-in-production

# Environment
NODE_ENV=production
```

## OAuth Variables (GitHub)

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=Ov23lieErq3f4U5xx5wS
GITHUB_CLIENT_SECRET=ac2ad11263ddc7c21a015959e364c8252f35260e
```

## Optional OAuth Variables

If you want to enable Google or LinkedIn login, add these:

```bash
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth (Optional)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

---

## ⚠️ Important Security Notes

### 1. Generate New Secrets

**DO NOT use the default secrets in production!**

Generate new secrets for:
- `JWT_SECRET`
- `SESSION_SECRET`

You can generate strong secrets using:

**Option 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Online Generator**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" or "256-bit WPA Key"

### 2. Update MongoDB Password

The current MongoDB URI uses a demo password. For production:
1. Go to MongoDB Atlas
2. Database Access → Edit User
3. Change password
4. Update `MONGODB_URI` with new password

---

## How to Add Variables in Railway

### Method 1: Railway Dashboard (Recommended)

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add each variable:
   - **Variable**: `MONGODB_URI`
   - **Value**: `mongodb+srv://...`
6. Click **Add**
7. Repeat for all variables

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Add variables
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="your-secret"
railway variables set SESSION_SECRET="your-secret"
railway variables set NODE_ENV="production"
railway variables set GITHUB_CLIENT_ID="your-id"
railway variables set GITHUB_CLIENT_SECRET="your-secret"
```

---

## Variables NOT Needed for Railway-Only

These variables are **NOT needed** when deploying to Railway only:

- ❌ `CLIENT_URL` - Not needed (same origin)
- ❌ `SERVER_URL` - Not needed (Railway sets this)
- ❌ `PORT` - Railway sets this automatically
- ❌ `RAILWAY_PUBLIC_DOMAIN` - Railway sets this automatically
- ❌ `VITE_API_URL` - Not needed (same origin)

---

## Verification

After adding all variables, verify they're set:

### Railway Dashboard
1. Go to **Variables** tab
2. Check all variables are listed
3. Values should be hidden (shown as `•••••`)

### Railway CLI
```bash
railway variables
```

---

## Example: Complete Variable List

Your Railway variables should look like this:

```
MONGODB_URI          mongodb+srv://ankitsri033_db_user:ankit123@...
JWT_SECRET           a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
SESSION_SECRET       z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0
NODE_ENV             production
GITHUB_CLIENT_ID     Ov23lieErq3f4U5xx5wS
GITHUB_CLIENT_SECRET ac2ad11263ddc7c21a015959e364c8252f35260e
```

---

## After Setting Variables

1. **Redeploy** (if already deployed):
   - Railway → Deployments → Redeploy

2. **Or Push to GitHub**:
   ```bash
   git push origin main
   ```

3. **Verify**:
   - Check deployment logs
   - Test `/api/health` endpoint
   - Try logging in

---

## Troubleshooting

### "MongoDB connection failed"
- Check `MONGODB_URI` is correct
- Verify MongoDB Atlas network access allows Railway
- Check username/password in connection string

### "Invalid JWT token"
- Ensure `JWT_SECRET` is set
- Check it's the same secret across deployments
- Clear browser cookies and try again

### "Session error"
- Ensure `SESSION_SECRET` is set
- Check `NODE_ENV=production` is set
- Verify cookie settings in `server.js`

### "OAuth error"
- Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- Verify callback URL is updated in GitHub OAuth app
- Ensure credentials match your GitHub OAuth app

---

## Security Checklist

Before going to production:

- [ ] Changed `JWT_SECRET` from default
- [ ] Changed `SESSION_SECRET` from default
- [ ] Updated MongoDB password
- [ ] Verified all secrets are strong (32+ characters)
- [ ] Checked no secrets are committed to Git
- [ ] Reviewed MongoDB Atlas network access
- [ ] Updated OAuth credentials if needed
- [ ] Set `NODE_ENV=production`

---

## Need Help?

- **Can't find Railway Variables tab?**
  → Click on your service → Look for "Variables" in the tabs

- **Variables not taking effect?**
  → Redeploy your application after adding variables

- **How to delete a variable?**
  → Variables tab → Click on variable → Delete

- **Can I use .env file?**
  → No, Railway uses environment variables set in dashboard
  → .env files are for local development only

---

## Summary

✅ **Required**: 5 variables (MONGODB_URI, JWT_SECRET, SESSION_SECRET, NODE_ENV, GITHUB credentials)  
✅ **Optional**: Google/LinkedIn OAuth (if you want those login options)  
✅ **Not Needed**: CLIENT_URL, SERVER_URL, PORT, VITE_API_URL  
✅ **Security**: Generate new secrets, don't use defaults!  

**Next Step**: After setting variables, deploy to Railway!
