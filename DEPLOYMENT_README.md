# Deployment Files Summary

This directory contains configuration files and guides for deploying InturnX to production.

## Files Overview

### Configuration Files

#### Backend (Railway)
- **`server/railway.toml`** - Railway deployment configuration
- **`server/Procfile`** - Process configuration for Railway
- **`server/.env.example`** - Template for environment variables

#### Frontend (Vercel)
- **`client/vercel.json`** - Vercel deployment configuration for SPA routing
- **`client/.env.production`** - Production environment variables template

### Documentation

- **`DEPLOYMENT_GUIDE.md`** - Complete step-by-step deployment guide
- **`TROUBLESHOOTING.md`** - Quick reference for common deployment issues
- **`server/check-deployment.js`** - Health check script to verify deployment

## Quick Start

### 1. Deploy Backend to Railway

```bash
cd server
# Update .env with production values
# Push to GitHub
# Railway will auto-deploy from the server directory
```

**Required Environment Variables:**
- `MONGODB_URI`
- `JWT_SECRET`
- `SESSION_SECRET`
- `CLIENT_URL` (your Vercel URL)
- `NODE_ENV=production`
- OAuth credentials (GitHub, Google, LinkedIn)

### 2. Deploy Frontend to Vercel

```bash
cd client
# Set VITE_API_URL in Vercel dashboard
# Push to GitHub
# Vercel will auto-deploy from the client directory
```

**Required Environment Variables:**
- `VITE_API_URL` (your Railway backend URL)

### 3. Update Cross-References

After both are deployed:
1. Update `CLIENT_URL` in Railway with your Vercel URL
2. Update `VITE_API_URL` in Vercel with your Railway URL
3. Update OAuth callback URLs to use Railway backend URL

## Key Changes Made for Deployment

### Server Changes
1. **CORS Configuration** - Updated to use environment-based origins
2. **Static File Serving** - Removed (frontend deployed separately)
3. **Catch-all Route** - Removed (not needed for API-only backend)
4. **Socket.IO CORS** - Configured for production

### Client Changes
1. **Vercel Configuration** - Added `vercel.json` for SPA routing
2. **Environment Variables** - Created production template

## Testing Deployment

Run the health check script:
```bash
cd server
RAILWAY_URL=https://your-app.railway.app \
VERCEL_URL=https://your-app.vercel.app \
node check-deployment.js
```

## Common Issues

See `TROUBLESHOOTING.md` for detailed solutions to:
- Backend not starting
- CORS errors
- API connection failures
- OAuth authentication issues
- Database connection problems
- 404 errors on page refresh

## Architecture

```
┌─────────────────┐
│  Vercel         │
│  (Frontend)     │
│  React + Vite   │
└────────┬────────┘
         │ HTTPS
         │ API Calls
         ▼
┌─────────────────┐
│  Railway        │
│  (Backend)      │
│  Node.js + WS   │
└────────┬────────┘
         │
         │ MongoDB
         ▼
┌─────────────────┐
│  MongoDB Atlas  │
│  (Database)     │
└─────────────────┘
```

## Security Notes

- All secrets should be set as environment variables
- Never commit `.env` files to Git
- Use HTTPS for all production URLs
- Update OAuth callback URLs to production domains
- Configure CORS to only allow your frontend domain
- Use strong, unique secrets for JWT and sessions

## Monitoring

### Railway
- View logs: Railway Dashboard → Logs
- Monitor metrics: CPU, Memory, Network
- Set up alerts for downtime

### Vercel
- View deployments: Vercel Dashboard → Deployments
- Check analytics: Vercel Dashboard → Analytics
- Monitor build times and errors

## Rollback

### Railway
1. Go to Deployments
2. Select previous successful deployment
3. Click "Redeploy"

### Vercel
1. Go to Deployments
2. Select previous deployment
3. Click "Promote to Production"

## Support

For deployment issues:
1. Check `TROUBLESHOOTING.md`
2. Review deployment logs
3. Run `check-deployment.js` script
4. Verify environment variables

## Next Steps

After successful deployment:
- [ ] Set up custom domain
- [ ] Configure CI/CD pipelines
- [ ] Set up error tracking (Sentry)
- [ ] Implement monitoring (Datadog, New Relic)
- [ ] Set up automated backups
- [ ] Configure CDN for static assets
- [ ] Implement rate limiting
- [ ] Set up SSL certificates for custom domains
