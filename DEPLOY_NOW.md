# 🚀 Deploy ShiftFlow to Vercel - Quick Guide

**Date:** December 6, 2025  
**Status:** Ready to deploy!

---

## ✅ Pre-Deployment Checklist

- ✅ All features working locally
- ✅ Database connected (Neon PostgreSQL)
- ✅ Authentication working
- ✅ Workflows can be created, activated, deleted
- ✅ Dashboard showing real data
- ✅ No critical errors

**Ready to deploy!** 🎉

---

## 🚀 Deployment Steps

### Step 1: Commit Your Code

First, let's commit all your changes to Git:

```bash
# Check what's changed
git status

# Add all files
git add .

# Commit with a message
git commit -m "feat: Complete Wave 3 implementation - workflow automation with Safe integration"

# Push to GitHub
git push origin main
```

---

### Step 2: Deploy to Vercel (Dashboard Method - Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with your account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your ShiftFlow repository from GitHub
   - Click "Import"

3. **Configure Build Settings**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `packages/web` ← IMPORTANT!
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

4. **Click "Deploy"**
   - Wait 2-3 minutes for build
   - You'll get a URL like: `https://shiftflow-web-xxx.vercel.app`

---

### Step 3: Set Environment Variables in Vercel

After deployment, you need to add environment variables:

1. **Go to your project in Vercel**
2. **Click "Settings" tab**
3. **Click "Environment Variables" in sidebar**
4. **Add these variables:**

#### Required Variables:

**1. Database (Already exists from Vercel Postgres):**
```
DATABASE_URL
Value: (copy from your .env.local)
Environment: Production, Preview, Development
```

**2. NextAuth URL (Production):**
```
NEXTAUTH_URL
Value: https://your-actual-vercel-url.vercel.app
Environment: Production
```

**3. NextAuth Secret:**
```
NEXTAUTH_SECRET
Value: shiftflow-nextauth-secret-key-2025-production-ready
Environment: Production, Preview, Development
```

**4. SideShift Configuration:**
```
SIDESHIFT_AFFILIATE_ID
Value: your-affiliate-id
Environment: Production, Preview, Development

SIDESHIFT_SECRET
Value: your-sideshift-api-secret
Environment: Production, Preview, Development
```

**5. Cron Secret:**
```
CRON_SECRET
Value: shiftflow-cron-secret-key-2025
Environment: Production, Preview, Development
```

---

### Step 4: Redeploy After Adding Variables

After adding environment variables:

1. **Go to "Deployments" tab**
2. **Click "..." on latest deployment**
3. **Click "Redeploy"**
4. **Wait for redeployment to complete**

---

### Step 5: Run Database Migration (Production)

You need to run Prisma migrations on production database:

```bash
# Navigate to web package
cd packages/web

# Pull production environment variables
vercel env pull .env.production

# Run migration on production
npx prisma migrate deploy
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

## ✅ Verify Deployment

### 1. Visit Your Production URL
Open: `https://your-app.vercel.app`

**Should see:**
- ✅ Home page loads
- ✅ No errors in console
- ✅ Sidebar visible

### 2. Test Authentication
1. Click sidebar to open
2. Connect wallet (MetaMask, etc.)
3. Sign in with wallet
4. Should see your address

### 3. Test Workflow Creation
1. Go to `/builder`
2. Create a test workflow
3. Should redirect to dashboard
4. Workflow should appear

### 4. Test Dashboard
1. Go to `/dashboard`
2. Should see your workflows
3. Try activating a workflow
4. Should see "Monitoring" indicator

---

## 🔍 Troubleshooting

### If deployment fails:

**Check Build Logs:**
1. Go to Vercel Dashboard
2. Click on failed deployment
3. Check "Building" logs for errors

**Common Issues:**

1. **"Cannot find module"**
   - Make sure Root Directory is set to `packages/web`
   - Check that all dependencies are in `package.json`

2. **Database connection error**
   - Verify `DATABASE_URL` is set in environment variables
   - Make sure it's the pooled connection URL

3. **NextAuth error**
   - Verify `NEXTAUTH_URL` matches your production URL
   - Verify `NEXTAUTH_SECRET` is set

4. **Build timeout**
   - This is normal for first deployment
   - Just redeploy

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- [ ] Home page loads
- [ ] Can connect wallet
- [ ] Can sign in
- [ ] Can create workflow
- [ ] Workflow appears in dashboard
- [ ] Can activate workflow
- [ ] Can delete workflow
- [ ] No console errors

---

## 📝 Important Notes

### Database:
- You're using Vercel Neon PostgreSQL (already set up)
- Same database for local and production
- Migrations already run locally

### Cron Jobs:
- Vercel will automatically set up cron from `vercel.json`
- Runs every minute: `* * * * *`
- Endpoint: `/api/cron/monitor`
- Protected by `CRON_SECRET`

### Environment Variables:
- Production uses different `NEXTAUTH_URL`
- All other secrets same as local
- Can update anytime in Vercel Dashboard

---

## 🚀 Quick Deploy Commands

If you prefer CLI:

```bash
# Navigate to web package
cd packages/web

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy: Yes
# - Link to existing project: Yes (or No for new)
# - What's your project's name: shiftflow-web
```

---

## 🎉 After Deployment

Once deployed successfully:

1. **Share your URL:**
   - `https://your-app.vercel.app`

2. **Test all features:**
   - Wallet connection
   - Workflow creation
   - Workflow activation
   - Dashboard display

3. **Monitor:**
   - Check Vercel Analytics
   - Check Function Logs
   - Check Cron Job executions

4. **Submit to Hackathon:**
   - Include your Vercel URL
   - Show working demo
   - Highlight features

---

## 📊 Expected Deployment Time

- **Initial Build:** 2-3 minutes
- **Subsequent Builds:** 1-2 minutes
- **Database Migration:** 10-30 seconds

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your Project:** (will be available after import)
- **Deployment Logs:** Project → Deployments → Click deployment
- **Environment Variables:** Project → Settings → Environment Variables
- **Cron Jobs:** Project → Settings → Cron Jobs

---

## ✅ Ready to Deploy!

**Next Steps:**
1. Commit your code to Git
2. Push to GitHub
3. Import to Vercel
4. Add environment variables
5. Redeploy
6. Test!

**Let's deploy!** 🚀
