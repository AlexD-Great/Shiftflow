# ✅ Code Pushed! Now Deploy to Vercel

**Status:** Code committed and pushed to GitHub ✅  
**Repository:** https://github.com/AlexD-Great/Shiftflow  
**Commit:** Wave 3 implementation complete

---

## 🚀 Next: Deploy to Vercel (5 Minutes)

### Step 1: Go to Vercel Dashboard
👉 **Open:** https://vercel.com/dashboard

---

### Step 2: Import Your Project

1. **Click "Add New..."** (top right)
2. **Select "Project"**
3. **Click "Import Git Repository"**
4. **Find and select:** `AlexD-Great/Shiftflow`
5. **Click "Import"**

---

### Step 3: Configure Project Settings

**IMPORTANT:** Set these correctly!

```
Framework Preset: Next.js
Root Directory: packages/web  ← CRITICAL!
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Click "Deploy"** and wait 2-3 minutes...

---

### Step 4: Add Environment Variables

After first deployment (even if it fails), add these:

**Go to:** Project → Settings → Environment Variables

#### 1. Database URL
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_prtcAago0d1K@ep-little-frog-ah3g9scs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
Environment: Production, Preview, Development
```

#### 2. NextAuth URL (Production)
```
Name: NEXTAUTH_URL
Value: https://your-vercel-url.vercel.app
Environment: Production
```
*Replace with your actual Vercel URL after deployment!*

#### 3. NextAuth Secret
```
Name: NEXTAUTH_SECRET
Value: shiftflow-nextauth-secret-key-2025-production-ready
Environment: Production, Preview, Development
```

#### 4. SideShift Affiliate ID
```
Name: SIDESHIFT_AFFILIATE_ID
Value: your-affiliate-id
Environment: Production, Preview, Development
```

#### 5. SideShift Secret
```
Name: SIDESHIFT_SECRET
Value: your-sideshift-api-secret
Environment: Production, Preview, Development
```

#### 6. Cron Secret
```
Name: CRON_SECRET
Value: shiftflow-cron-secret-key-2025
Environment: Production, Preview, Development
```

---

### Step 5: Redeploy with Environment Variables

1. **Go to "Deployments" tab**
2. **Click "..." on latest deployment**
3. **Click "Redeploy"**
4. **Check "Use existing Build Cache"**
5. **Click "Redeploy"**

Wait for redeployment to complete...

---

### Step 6: Update NEXTAUTH_URL

After redeployment succeeds:

1. **Copy your production URL** (e.g., `https://shiftflow-web-xxx.vercel.app`)
2. **Go back to Settings → Environment Variables**
3. **Find NEXTAUTH_URL (Production)**
4. **Click "Edit"**
5. **Update value to your actual URL**
6. **Save**
7. **Redeploy again**

---

### Step 7: Run Database Migration

Open terminal and run:

```bash
cd packages/web

# Pull production environment
vercel env pull .env.production

# Run migration
npx prisma migrate deploy
```

**Expected:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

## ✅ Verify Deployment

### 1. Visit Your Site
Open: `https://your-app.vercel.app`

**Should see:**
- ✅ Home page loads
- ✅ No errors
- ✅ Sidebar works

### 2. Test Authentication
1. Open sidebar
2. Connect wallet
3. Sign in
4. Should work!

### 3. Test Workflow Creation
1. Go to `/builder`
2. Create workflow
3. Should save to database
4. Should appear in dashboard

### 4. Test Activation
1. Go to `/dashboard`
2. Click "Activate" on workflow
3. Should show "Monitoring" indicator

---

## 🎯 Deployment Checklist

- [ ] Imported project to Vercel
- [ ] Set Root Directory to `packages/web`
- [ ] First deployment completed
- [ ] Added all environment variables
- [ ] Updated NEXTAUTH_URL with production URL
- [ ] Redeployed with environment variables
- [ ] Ran database migration
- [ ] Tested home page
- [ ] Tested wallet connection
- [ ] Tested workflow creation
- [ ] Tested workflow activation

---

## 🔍 Troubleshooting

### Build Fails:
- **Check Root Directory:** Must be `packages/web`
- **Check Build Logs:** Vercel Dashboard → Deployments → Click deployment
- **Common fix:** Redeploy (sometimes first build times out)

### Database Connection Error:
- **Check DATABASE_URL:** Must be the pooled connection URL
- **Check migration:** Run `npx prisma migrate deploy`

### NextAuth Error:
- **Check NEXTAUTH_URL:** Must match your production URL exactly
- **Check NEXTAUTH_SECRET:** Must be set
- **Redeploy:** After updating variables

### Workflows Not Saving:
- **Check database migration:** Run `npx prisma migrate deploy`
- **Check DATABASE_URL:** Must be correct
- **Check authentication:** Must be signed in

---

## 📊 Expected Timeline

- **Import & Configure:** 2 minutes
- **First Build:** 2-3 minutes
- **Add Environment Variables:** 3 minutes
- **Redeploy:** 1-2 minutes
- **Database Migration:** 30 seconds
- **Testing:** 5 minutes

**Total:** ~15 minutes

---

## 🎉 After Successful Deployment

Your app will be live at:
```
https://your-app.vercel.app
```

**Features Working:**
- ✅ Wallet authentication
- ✅ Workflow creation
- ✅ Workflow activation
- ✅ Dashboard with real data
- ✅ Database persistence
- ✅ Safe multi-sig integration
- ✅ SideShift API integration
- ✅ Cron job monitoring (every minute)

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/AlexD-Great/Shiftflow
- **Deployment Logs:** Project → Deployments → Click deployment
- **Environment Variables:** Project → Settings → Environment Variables
- **Cron Jobs:** Project → Settings → Cron Jobs

---

## 📝 Notes

- **Database:** Using Vercel Neon PostgreSQL (already set up)
- **Cron Jobs:** Automatically configured from `vercel.json`
- **Environment Variables:** Can be updated anytime
- **Redeployment:** Automatic on every push to main branch

---

## 🚀 Ready to Deploy!

**Go to:** https://vercel.com/dashboard

**Click:** "Add New..." → "Project"

**Let's deploy!** 🎉
