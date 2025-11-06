# Deployment Guide

## Deploy to Vercel (Frontend)

The landing page is ready to deploy to Vercel.

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `AlexD-Great/Shiftflow`
3. **IMPORTANT**: Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `packages/web` ← Click "Edit" and set this!
   - **Build Command**: Leave default (`npm run build`)
   - **Output Directory**: Leave default (`.next`)
   - **Install Command**: Leave default (`npm install`)
4. Click "Deploy"

**Note**: If you already deployed and it failed, go to Project Settings → General → Root Directory and set it to `packages/web`, then redeploy.

That's it! Vercel will give you a live URL like `shiftflow.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd packages/web
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: shiftflow
# - Directory: ./
# - Override settings? No

# For production deployment
vercel --prod
```

### After Deployment

Your site will be live at: `https://shiftflow.vercel.app` (or similar)

Update the links in:
- README.md
- HACKATHON_SUBMISSION.md
- Add the live URL to your GitHub repository description

## Deploy Backend (Optional)

For the workflow engine, you can deploy to Railway or Render.

### Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
cd packages/engine
railway init

# Add environment variables in Railway dashboard
# SIDESHIFT_SECRET
# AFFILIATE_ID
# COINGECKO_API_KEY

# Deploy
railway up
```

### Render Deployment

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `packages/engine`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

## Environment Variables

For production deployments, set these in your hosting dashboard:

```
SIDESHIFT_SECRET=your_private_key
AFFILIATE_ID=your_account_id
COINGECKO_API_KEY=your_api_key (optional)
```

**Never commit these to Git!**

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Live URL working
- [ ] Updated README with live link
- [ ] Updated HACKATHON_SUBMISSION with live link
- [ ] Added live URL to GitHub repository description
- [ ] Tested all links on landing page
- [ ] Backend deployed (optional)
- [ ] Environment variables configured
- [ ] Demo video recorded with live site

## Updating After Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update landing page"
git push
```

Vercel will detect the push and redeploy automatically.

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Domains → Add Domain
3. Enter your domain (e.g., `shiftflow.io`)
4. Follow DNS configuration instructions

## Troubleshooting

**Build fails on Vercel**
- Check that `packages/web/package.json` exists
- Verify Root Directory is set to `packages/web`
- Check build logs for specific errors

**404 on deployment**
- Ensure Output Directory is `.next`
- Check that `app/page.tsx` exists

**Styles not loading**
- Verify `globals.css` is imported in `layout.tsx`
- Check Tailwind config is correct

## Monitoring

Vercel provides:
- Automatic HTTPS
- Global CDN
- Analytics (free tier)
- Deployment logs
- Performance insights

Check your dashboard at https://vercel.com/dashboard
