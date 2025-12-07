# Deploy InturnX Completely on Railway

This guide shows you how to deploy both frontend and backend on Railway as a single full-stack application.

## Advantages of Railway-Only Deployment

✅ **Single Platform** - Manage everything in one place  
✅ **Simpler Configuration** - No need to coordinate between Vercel and Railway  
✅ **Same Origin** - No CORS issues since frontend and backend are on same domain  
✅ **Cost Effective** - Only one deployment to manage  
✅ **Easier Environment Variables** - All in one place  

## Architecture

```
┌─────────────────────────────────┐
│       Railway Application       │
│                                 │
│  ┌──────────────────────────┐  │
│  │   Express Server         │  │
│  │   (Backend API)          │  │
│  │   Port: 3001             │  │
│  └──────────┬───────────────┘  │
│             │                   │
│             │ Serves            │
│             ▼                   │
│  ┌──────────────────────────┐  │
│  │   Static Files           │  │
│  │   (React Frontend)       │  │
│  │   from /client/dist      │  │
│  └──────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
                │
                │ MongoDB
                ▼
        ┌───────────────┐
        │ MongoDB Atlas │
        └───────────────┘
```

## How It Works

1. **Build Process**: Railway builds the React frontend first
2. **Static Files**: Express serves the built frontend from `/client/dist`
3. **API Routes**: All `/api/*` routes handled by Express backend
4. **SPA Routing**: Catch-all route serves `index.html` for client-side routing
5. **Same Domain**: Frontend and backend share the same Railway URL

---

## Step-by-Step Deployment

### Step 1: Prepare Your Project

The following files have been created for you:

- ✅ `railway.toml` - Railway configuration (root directory)
- ✅ `Procfile` - Start command (root directory)
- ✅ `package.json` - Build scripts (root directory)
- ✅ `server/server.js` - Updated to serve static files in production

### Step 2: Set Environment Variables in Railway

Go to your Railway project and add these environment variables:

```bash
# Required
MONGODB_URI=mongodb+srv://ankitsri033_db_user:ankit123@inturnx.tl9f2ed.mongodb.net/inturnx?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-in-production
NODE_ENV=production

# OAuth (GitHub)
GITHUB_CLIENT_ID=Ov23lieErq3f4U5xx5wS
GITHUB_CLIENT_SECRET=ac2ad11263ddc7c21a015959e364c8252f35260e

# Optional - OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional - OAuth (LinkedIn)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

**Important Notes:**
- `CLIENT_URL` and `SERVER_URL` are **NOT needed** for Railway-only deployment
- Railway automatically sets `PORT` and `RAILWAY_PUBLIC_DOMAIN`
- Generate new strong secrets for `JWT_SECRET` and `SESSION_SECRET`

### Step 3: Configure Railway Project

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your InturnX repository

2. **Project Settings**
   - **Root Directory**: Leave as `/` (root of repository)
   - **Build Command**: Automatically detected from `package.json`
   - **Start Command**: Automatically detected from `Procfile`

3. **Build Configuration**
   Railway will automatically:
   - Run `npm run build` (builds the React frontend)
   - Run `npm run start:prod` (starts the Express server)

### Step 4: Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Railway full-stack deployment"
   git push origin main
   ```

2. **Railway Auto-Deploys**
   - Railway detects the push
   - Starts building the project
   - Builds frontend (`cd client && npm run build`)
   - Starts server (`cd server && node server.js`)

3. **Get Your URL**
   - Railway provides a URL like: `https://inturnx-production.up.railway.app`
   - This URL serves both frontend and backend

### Step 5: Update OAuth Callback URLs

After deployment, update your OAuth app callback URLs:

#### GitHub OAuth
1. Go to: https://github.com/settings/developers
2. Select your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://your-railway-app.railway.app/api/auth/github/callback
   ```

#### Google OAuth (if configured)
1. Go to Google Cloud Console
2. Update **Authorized redirect URIs** to:
   ```
   https://your-railway-app.railway.app/api/auth/google/callback
   ```

#### LinkedIn OAuth (if configured)
1. Go to LinkedIn Developer Portal
2. Update **Redirect URLs** to:
   ```
   https://your-railway-app.railway.app/api/auth/linkedin/callback
   ```

---

## Verification

### 1. Check Deployment Logs

In Railway dashboard:
- Go to **Deployments** → Select latest deployment
- Check **Build Logs** for any errors
- Check **Deploy Logs** to see if server started

### 2. Test Backend Health

```bash
curl https://your-railway-app.railway.app/api/health
```

Expected response:
```json
{"status":"OK","message":"InturnX Server is running"}
```

### 3. Test Frontend

Visit your Railway URL in a browser:
```
https://your-railway-app.railway.app
```

You should see the InturnX homepage.

### 4. Test Login

Try logging in with demo credentials:
- Email: `demo@inturnx.com`
- Password: `demo123`

---

## How the Build Process Works

### 1. Railway Detects `package.json` in Root

```json
{
  "scripts": {
    "build": "cd client && npm install && npm run build",
    "start:prod": "cd server && npm install && node server.js"
  }
}
```

### 2. Build Phase

Railway runs:
```bash
npm run build
```

This:
1. Goes into `client` directory
2. Installs client dependencies
3. Runs `vite build`
4. Creates `client/dist` with production build

### 3. Start Phase

Railway runs (from `Procfile`):
```bash
npm run start:prod
```

This:
1. Goes into `server` directory
2. Installs server dependencies
3. Starts `node server.js`

### 4. Server Serves Everything

The Express server:
- Handles `/api/*` routes → Backend API
- Serves static files from `client/dist` → Frontend
- Catch-all route `/*` → Serves `index.html` for SPA routing

---

## Environment Variables Explained

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key-123` |
| `SESSION_SECRET` | Secret for sessions | `your-session-secret-456` |
| `NODE_ENV` | Environment mode | `production` |

### OAuth (Optional)

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth Client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth Client Secret |

### Auto-Set by Railway

| Variable | Description |
|----------|-------------|
| `PORT` | Port number (Railway sets this) |
| `RAILWAY_PUBLIC_DOMAIN` | Your app's public domain |

---

## Troubleshooting

### Build Fails

**Error**: "Cannot find module"
- **Fix**: Ensure all dependencies are in `package.json`
- Check both `client/package.json` and `server/package.json`

**Error**: "Build command failed"
- **Fix**: Test locally:
  ```bash
  cd client
  npm install
  npm run build
  ```

### Server Won't Start

**Error**: "Application failed to respond"
- **Fix**: Check Railway logs for errors
- Verify `server/server.js` exists
- Ensure `PORT` is used from environment

**Error**: "MongoDB connection failed"
- **Fix**: Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas network access allows Railway

### Frontend Shows 404

**Error**: Blank page or 404 errors
- **Fix**: Ensure `client/dist` was built successfully
- Check that `NODE_ENV=production` is set
- Verify static file serving code is in `server.js`

### API Calls Failing

**Error**: "Network Error" in browser console
- **Fix**: Since frontend and backend are on same domain, this shouldn't happen
- Check browser DevTools → Network tab
- Verify `/api/*` routes are working

### OAuth Not Working

**Error**: "Callback URL mismatch"
- **Fix**: Update OAuth app callback URLs to Railway domain
- Format: `https://your-app.railway.app/api/auth/[provider]/callback`

---

## Comparison: Railway-Only vs Vercel + Railway

| Aspect | Railway-Only | Vercel + Railway |
|--------|--------------|------------------|
| **Platforms** | 1 (Railway) | 2 (Vercel + Railway) |
| **CORS Setup** | Not needed (same origin) | Required |
| **Environment Variables** | One place | Two places |
| **Deployment** | Single deploy | Two deploys |
| **URL Management** | One URL | Two URLs to coordinate |
| **Cost** | One platform fee | Two platform fees |
| **Build Time** | Slightly longer (builds both) | Faster (parallel builds) |
| **CDN** | Railway CDN | Vercel Edge Network (faster) |
| **Complexity** | Simpler | More complex |

---

## Local Development

For local development, you can run frontend and backend separately:

### Terminal 1 - Backend
```bash
cd server
npm install
npm run dev
```

### Terminal 2 - Frontend
```bash
cd client
npm install
npm run dev
```

Or use the combined command:
```bash
npm run dev
```

This runs both using `concurrently`.

---

## Monitoring

### Railway Dashboard

Monitor your deployment:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History of all deployments

### Application Logs

View logs in Railway:
```
Railway Dashboard → Your Project → Deployments → View Logs
```

Look for:
- ✅ "Server running on port 3001"
- ✅ "MongoDB Connected"
- ❌ Any error messages

---

## Updating Your Application

### Make Changes

1. Edit your code locally
2. Test locally
3. Commit changes:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

### Railway Auto-Deploys

- Railway detects the push
- Automatically rebuilds and redeploys
- Zero-downtime deployment

### Rollback if Needed

1. Go to Railway Dashboard → Deployments
2. Select a previous successful deployment
3. Click "Redeploy"

---

## Security Best Practices

- ✅ Use strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET`
- ✅ Never commit `.env` files to Git
- ✅ Keep OAuth credentials secure
- ✅ Use HTTPS (Railway provides this automatically)
- ✅ Regularly update dependencies
- ✅ Monitor logs for suspicious activity
- ✅ Set up MongoDB Atlas IP whitelist (or allow all for Railway)

---

## Next Steps

After successful deployment:

1. **Custom Domain** (Optional)
   - Add custom domain in Railway settings
   - Update DNS records
   - Railway handles SSL automatically

2. **Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Configure uptime monitoring
   - Set up alerts

3. **Performance**
   - Enable caching
   - Optimize database queries
   - Add database indexes

4. **Backups**
   - Set up MongoDB Atlas automated backups
   - Export important data regularly

---

## Cost Estimation

### Railway Pricing (as of 2024)

- **Hobby Plan**: $5/month
  - 500 hours of usage
  - $0.000231/GB-hour for RAM
  - $0.000463/vCPU-hour

- **Pro Plan**: $20/month
  - More resources and priority support

### MongoDB Atlas

- **Free Tier (M0)**: $0/month
  - 512 MB storage
  - Shared RAM
  - Good for development/small apps

- **Paid Tiers**: Starting at $9/month
  - More storage and performance

---

## Support

If you encounter issues:

1. Check Railway deployment logs
2. Review `TROUBLESHOOTING.md`
3. Test locally first
4. Check MongoDB Atlas status
5. Verify all environment variables are set

---

## Summary

✅ **Simple Setup**: One platform, one deployment  
✅ **No CORS Issues**: Frontend and backend on same domain  
✅ **Easy Management**: All configuration in one place  
✅ **Cost Effective**: Single platform fee  
✅ **Auto-Deploy**: Push to GitHub → Railway deploys  

Your InturnX application is now ready to deploy completely on Railway!
