# 🔄 Update Existing Vercel Deployment

**Important:** You already have a Vercel project from Wave 2!  
**Action:** Update existing deployment, don't create new project

---

## ✅ Your Existing Project

You already deployed ShiftFlow to Vercel in a previous wave.

**What happens now:**
- Your code is already pushed to GitHub ✅
- Vercel is connected to your GitHub repo
- **Vercel will automatically deploy when you push!** 🎉

---

## 🚀 Automatic Deployment (Easiest)

Since Vercel is already connected to your repo:

### It's Already Deploying! 🎉

1. **Go to Vercel Dashboard**
   👉 https://vercel.com/dashboard

2. **Find your existing ShiftFlow project**
   - Should see "Building" or "Ready"
   - Deployment triggered automatically when you pushed to GitHub

3. **Wait for build to complete** (2-3 minutes)

---

## 🔐 Add New Environment Variables

Your existing project needs new environment variables for Wave 3:

### Go to Your Project Settings:
1. **Vercel Dashboard** → Your ShiftFlow project
2. **Settings** → **Environment Variables**

### Add These NEW Variables:

#### 1. NextAuth Secret (NEW)
```
Name: NEXTAUTH_SECRET
Value: shiftflow-nextauth-secret-key-2025-production-ready
Environment: Production, Preview, Development
```

#### 2. NextAuth URL (UPDATE)
```
Name: NEXTAUTH_URL
Value: https://your-existing-vercel-url.vercel.app
Environment: Production
```

#### 3. Cron Secret (NEW)
```
Name: CRON_SECRET
Value: shiftflow-cron-secret-key-2025
Environment: Production, Preview, Development
```

#### 4. SideShift Variables (if not already set)
```
Name: SIDESHIFT_AFFILIATE_ID
Value: your-affiliate-id
Environment: Production, Preview, Development

Name: SIDESHIFT_SECRET
Value: your-sideshift-api-secret
Environment: Production, Preview, Development
```

### Existing Variables (Should Already Be Set):
- ✅ `DATABASE_URL` - From Vercel Postgres
- ✅ All other Postgres variables

---

## 🔄 Redeploy After Adding Variables

After adding new environment variables:

1. **Go to "Deployments" tab**
2. **Click "..." on latest deployment**
3. **Click "Redeploy"**
4. **Wait for redeployment** (1-2 minutes)

---

## 🗄️ Run Database Migration

Your database schema has changed in Wave 3, so you need to migrate:

```bash
cd packages/web

# Pull production environment
vercel env pull .env.production

# Run migration on production database
npx prisma migrate deploy
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

This will add the new tables and fields for:
- Workflows
- Workflow Executions
- Conditions
- Actions
- User authentication

---

## ✅ Verify Deployment

### 1. Check Deployment Status
- Go to Vercel Dashboard
- Your project should show "Ready"
- Click on the deployment to see details

### 2. Visit Your Site
Open your existing URL: `https://your-app.vercel.app`

**Should see:**
- ✅ Updated home page
- ✅ New sidebar with wallet auth
- ✅ No errors

### 3. Test New Features
1. **Authentication:**
   - Open sidebar
   - Connect wallet
   - Sign in with wallet

2. **Workflow Builder:**
   - Go to `/builder`
   - Create a workflow
   - Should save to database

3. **Dashboard:**
   - Go to `/dashboard`
   - Should see your workflows
   - Try activating a workflow

---

## 🔍 Check What Changed

### New Features in Wave 3:
- ✅ **Wallet Authentication** (NextAuth + wallet signatures)
- ✅ **Database Persistence** (Prisma + Neon PostgreSQL)
- ✅ **Workflow Builder** (create automated workflows)
- ✅ **Dashboard** (view and manage workflows)
- ✅ **Workflow Activation** (start/stop monitoring)
- ✅ **Safe Multi-sig Integration**
- ✅ **SideShift API Integration**
- ✅ **Cron Job Monitoring**

### New API Endpoints:
- `/api/auth/[...nextauth]` - Authentication
- `/api/workflows` - Workflow CRUD
- `/api/workflows/[id]` - Individual workflow operations
- `/api/cron/monitor` - Automated monitoring
- `/api/sideshift/*` - SideShift proxy

### New Database Tables:
- `User` - User accounts
- `Account` - OAuth accounts
- `Session` - User sessions
- `Workflow` - Workflow definitions
- `WorkflowExecution` - Execution history
- `Condition` - Workflow conditions
- `Action` - Workflow actions
- `PriceAlert` - Price monitoring
- `GasAlert` - Gas price monitoring
- `Transaction` - Transaction tracking
- `SafeTransaction` - Safe multi-sig transactions
- `SideShiftOrder` - SideShift order tracking

---

## 🎯 Deployment Checklist

- [ ] Code pushed to GitHub ✅ (already done)
- [ ] Vercel auto-deployment triggered
- [ ] Build completed successfully
- [ ] Added new environment variables (NEXTAUTH_SECRET, CRON_SECRET)
- [ ] Updated NEXTAUTH_URL with production URL
- [ ] Redeployed with new variables
- [ ] Ran database migration (`npx prisma migrate deploy`)
- [ ] Tested authentication
- [ ] Tested workflow creation
- [ ] Tested workflow activation

---

## 🚨 Important Notes

### Don't Create New Project!
- ❌ Don't click "Add New Project"
- ✅ Use your existing ShiftFlow project
- ✅ Vercel auto-deploys on every push to main

### Database Migration Required
- Your database schema has changed significantly
- **Must run:** `npx prisma migrate deploy`
- This is safe - it only adds new tables/fields

### Environment Variables
- Some variables are new (NEXTAUTH_SECRET, CRON_SECRET)
- Some need updating (NEXTAUTH_URL)
- Database variables should already exist

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your Project:** (find your existing ShiftFlow project)
- **GitHub Repo:** https://github.com/AlexD-Great/Shiftflow
- **Latest Commit:** Wave 3 implementation (just pushed)

---

## 📊 Expected Timeline

- **Auto-deployment:** Already started
- **Build time:** 2-3 minutes
- **Add environment variables:** 3 minutes
- **Redeploy:** 1-2 minutes
- **Database migration:** 30 seconds
- **Testing:** 5 minutes

**Total:** ~10 minutes (since auto-deploy already started!)

---

## 🎉 After Successful Update

Your existing Vercel URL will now have:
- ✅ All Wave 3 features
- ✅ Wallet authentication
- ✅ Workflow automation
- ✅ Database persistence
- ✅ Safe multi-sig support
- ✅ Real-time monitoring

---

## 🚀 Next Steps

1. **Check Vercel Dashboard** - See if build is complete
2. **Add new environment variables**
3. **Redeploy**
4. **Run database migration**
5. **Test the new features!**

**Your existing deployment is updating right now!** 🎉
