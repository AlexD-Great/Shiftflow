# ShiftFlow Wave 3 - Deployment Guide

Complete guide to deploy to Vercel production.

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All local tests pass (see TESTING_GUIDE.md)
- [ ] Database is set up and working locally
- [ ] Environment variables are documented
- [ ] Code is committed to Git
- [ ] No sensitive data in code
- [ ] README is updated

---

## 🚀 Step 1: Prepare for Deployment

### 1.1 Commit Your Code

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Wave 3: Complete implementation with execution engine"

# Push to GitHub
git push origin main
```

---

### 1.2 Verify vercel.json

Make sure `packages/web/vercel.json` exists with cron configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/monitor",
      "schedule": "* * * * *"
    }
  ]
}
```

✅ This file is already created!

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your ShiftFlow repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `packages/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Click "Deploy"**
   - Wait for deployment to complete
   - You'll get a production URL like: `https://shiftflow-xxx.vercel.app`

---

### Option B: Using Vercel CLI

```bash
# Navigate to web package
cd packages/web

# Deploy to production
vercel --prod
```

Follow the prompts:
- Set up and deploy: Yes
- Which scope: Your account
- Link to existing project: Yes (if exists) or No (create new)
- What's your project's name: shiftflow
- In which directory is your code located: ./

---

## 🔐 Step 3: Set Environment Variables

### 3.1 In Vercel Dashboard

1. Go to your project in Vercel
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable:

**Required Variables:**

```bash
# Database (use same Vercel Postgres)
DATABASE_URL
Value: postgres://default:xxx@xxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15
Environment: Production, Preview, Development

# NextAuth
NEXTAUTH_URL
Value: https://your-production-url.vercel.app
Environment: Production

NEXTAUTH_URL
Value: http://localhost:3000
Environment: Development

NEXTAUTH_SECRET
Value: (same as local)
Environment: Production, Preview, Development

# SideShift
SIDESHIFT_SECRET
Value: (your secret)
Environment: Production, Preview, Development

AFFILIATE_ID
Value: (your ID)
Environment: Production, Preview, Development

# Cron
CRON_SECRET
Value: (same as local)
Environment: Production, Preview, Development

# Optional: CoinGecko
COINGECKO_API_KEY
Value: (if you have one)
Environment: Production, Preview, Development
```

---

### 3.2 Using Vercel CLI

```bash
# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add SIDESHIFT_SECRET production
vercel env add AFFILIATE_ID production
vercel env add CRON_SECRET production
```

---

## 🗄️ Step 4: Run Production Migration

### 4.1 Pull Production Environment

```bash
cd packages/web
vercel env pull .env.production
```

### 4.2 Run Migration

```bash
npx prisma migrate deploy
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

## ✅ Step 5: Verify Deployment

### 5.1 Check Deployment Status

1. Go to Vercel Dashboard
2. Click on your project
3. Check "Deployments" tab
4. Latest deployment should be "Ready"

### 5.2 Test Production URL

Visit your production URL: `https://your-app.vercel.app`

**Expected:**
- Site loads without errors
- Can connect wallet
- Can authenticate
- Can view workflows

---

### 5.3 Test API Endpoints

```bash
# Replace with your production URL
PROD_URL="https://your-app.vercel.app"

# Test workflow endpoint (should return 401)
curl $PROD_URL/api/workflows

# Test cron endpoint (should return 401)
curl $PROD_URL/api/cron/monitor
```

---

### 5.4 Verify Cron Jobs

1. Go to Vercel Dashboard
2. Click on your project
3. Click "Cron Jobs" tab (or "Settings" → "Cron Jobs")
4. You should see:
   - Path: `/api/cron/monitor`
   - Schedule: `* * * * *` (every minute)
   - Status: Active

---

### 5.5 Test Cron Job Manually

```bash
# Get your CRON_SECRET
# Replace YOUR_CRON_SECRET and YOUR_PROD_URL

curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/monitor
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-12-03T...",
  "duration": "123ms"
}
```

---

## 📊 Step 6: Monitor Production

### 6.1 Check Logs

In Vercel Dashboard:
1. Click on your project
2. Click "Logs" tab
3. Filter by:
   - Function: `/api/cron/monitor`
   - Time range: Last hour

**Look for:**
- Cron job executions every minute
- Workflow checks
- Execution logs
- Any errors

---

### 6.2 Check Database

```bash
# Connect to production database
npx prisma studio --schema=./prisma/schema.prisma
```

Or use Vercel Postgres dashboard:
1. Go to Vercel Dashboard
2. Click "Storage"
3. Click your database
4. Click "Data" tab

**Verify:**
- Users are being created
- Workflows are being stored
- Executions are being tracked

---

### 6.3 Monitor Performance

In Vercel Dashboard:
1. Click "Analytics" tab
2. Check:
   - Response times
   - Error rates
   - Traffic patterns

---

## 🎯 Step 7: Production Testing

### Test 1: End-to-End Workflow

1. Visit production URL
2. Connect wallet
3. Authenticate with SIWE
4. Create a test workflow
5. Activate workflow
6. Wait for cron job to run
7. Check execution in database

**Expected:** Everything works as in local testing

---

### Test 2: SideShift Integration

1. Create workflow with SideShift action
2. Set condition that will trigger
3. Activate workflow
4. Wait for execution
5. Check SideShiftOrder table

**Expected:** 
- x-user-ip header is passed
- Shift is created successfully
- Order is tracked in database

---

### Test 3: Cron Job Reliability

1. Monitor cron job for 10 minutes
2. Check logs for each execution
3. Verify it runs every minute

**Expected:**
- Runs consistently every minute
- No missed executions
- No errors

---

## 🔒 Step 8: Security Checklist

- [ ] All environment variables are set
- [ ] CRON_SECRET is secure and not exposed
- [ ] NEXTAUTH_SECRET is secure
- [ ] Database connection is secure (SSL)
- [ ] API endpoints require authentication
- [ ] No sensitive data in logs
- [ ] CORS is configured correctly
- [ ] Rate limiting is considered

---

## 🐛 Troubleshooting

### Deployment fails

**Check:**
- Build logs in Vercel
- Make sure `packages/web` is set as root directory
- Verify all dependencies are in package.json

**Solution:**
```bash
# Test build locally first
cd packages/web
npm run build
```

---

### Environment variables not working

**Check:**
- Variables are set for correct environment
- Variable names are exact (case-sensitive)
- No extra spaces in values

**Solution:**
- Re-add variables in Vercel Dashboard
- Redeploy after adding variables

---

### Cron job not running

**Check:**
- vercel.json is in correct location
- Cron job is enabled in Vercel Dashboard
- CRON_SECRET is correct

**Solution:**
- Trigger manually first to test
- Check logs for errors
- Verify cron job is active in dashboard

---

### Database connection errors

**Check:**
- DATABASE_URL is correct
- Database is accessible from Vercel
- Connection string includes `?pgbouncer=true`

**Solution:**
- Use POSTGRES_PRISMA_URL from Vercel
- Not POSTGRES_URL (different format)
- Run migration again

---

### Authentication not working

**Check:**
- NEXTAUTH_URL matches production URL
- NEXTAUTH_SECRET is set
- Wallet is connected

**Solution:**
- Update NEXTAUTH_URL to production URL
- Clear browser cache
- Try different wallet

---

## 📈 Step 9: Performance Optimization

### 9.1 Enable Vercel Analytics

1. Go to Vercel Dashboard
2. Click "Analytics" tab
3. Enable Web Analytics
4. Enable Speed Insights

---

### 9.2 Configure Caching

Add to `next.config.js`:

```javascript
module.exports = {
  // ... existing config
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate',
        },
      ],
    },
  ],
}
```

---

### 9.3 Monitor Database Performance

1. Check query performance in logs
2. Verify indexes are being used
3. Monitor connection pool usage

---

## 🎉 Step 10: Go Live Checklist

- [ ] Deployment successful
- [ ] All environment variables set
- [ ] Database migration completed
- [ ] Cron jobs running
- [ ] API endpoints working
- [ ] Authentication working
- [ ] SideShift integration working
- [ ] Monitoring enabled
- [ ] Logs are clean (no errors)
- [ ] Performance is acceptable
- [ ] Security checklist complete

---

## 🚀 Post-Deployment

### Update README

Add production URL to README:
```markdown
## Live Demo

Production: https://your-app.vercel.app
```

### Share with Beta Testers

1. Recruit beta testers
2. Share production URL
3. Provide testing instructions
4. Collect feedback

### Monitor & Iterate

1. Monitor logs daily
2. Check for errors
3. Gather user feedback
4. Fix issues quickly
5. Deploy updates

---

## 📊 Success Metrics

Track these metrics:
- [ ] Uptime: > 99%
- [ ] Response time: < 1 second
- [ ] Error rate: < 1%
- [ ] Cron job success rate: 100%
- [ ] User signups: Growing
- [ ] Workflow executions: Growing

---

## 🎯 Wave 3 Submission

After successful deployment:

1. **Prepare Demo Video**
   - Show authentication
   - Show workflow creation
   - Show execution engine
   - Show SideShift integration

2. **Update Documentation**
   - Add production URL
   - Add screenshots
   - Update README

3. **Prepare Submission**
   - Highlight judge feedback addressed
   - Show technical implementation
   - Demonstrate real automation
   - Share beta tester feedback

4. **Submit to SideShift**
   - Include production URL
   - Include demo video
   - Include documentation
   - Highlight improvements

---

**Ready to deploy?** Follow each step carefully and you'll have a production-ready DeFi automation platform! 🚀
