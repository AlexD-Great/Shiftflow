# 🚀 ShiftFlow Database Setup - Do This Now

Follow these steps exactly to set up your database.

---

## Step 1: Create Vercel Postgres Database (2 minutes)

### Option A: Vercel Dashboard (Recommended - Easiest)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/alexd-great/dashboard
   - Or just: https://vercel.com/dashboard

2. **Find or Create ShiftFlow Project**
   - If you see "shiftflow" or "shiftflow-web" project, click it
   - If not, click "Add New..." → "Project" and import from GitHub

3. **Create Postgres Database**
   - Click "Storage" tab at the top
   - Click "Create Database" button
   - Select "Postgres"
   - Name: `shiftflow-db` (or any name you like)
   - Region: Choose closest to you (e.g., US East)
   - Click "Create"

4. **Get Connection String**
   - After creation, you'll see your database
   - Click on the database name
   - Click ".env.local" tab
   - Look for `POSTGRES_PRISMA_URL=`
   - Copy the ENTIRE value (starts with `postgres://`)
   - It looks like: `postgres://default:xxxxx@xxxxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15`

---

## Step 2: Generate Secrets (1 minute)

Open PowerShell and run these commands to generate secure secrets:

```powershell
# Generate NEXTAUTH_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Generate CRON_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy both outputs - you'll need them in the next step.

**Or use this online tool:**
- Go to: https://generate-secret.vercel.app/32
- Click "Generate" twice to get two different secrets

---

## Step 3: Create .env.local File (2 minutes)

1. **Navigate to packages/web folder**
   ```bash
   cd packages/web
   ```

2. **Create .env.local file**
   - Create a new file named `.env.local` in `packages/web/`
   - Copy the template below and fill in your values

3. **Template:**

```bash
# Database (from Vercel Postgres - Step 1)
DATABASE_URL="postgres://default:xxxxx@xxxxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"

# NextAuth (from Step 2 - first secret)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-first-generated-secret-here"

# SideShift API (get from SideShift dashboard)
SIDESHIFT_SECRET="your-sideshift-api-secret"
AFFILIATE_ID="your-sideshift-affiliate-id"

# Cron Job Security (from Step 2 - second secret)
CRON_SECRET="your-second-generated-secret-here"

# Optional: CoinGecko API (leave empty for now)
COINGECKO_API_KEY=""
```

4. **Fill in the values:**
   - `DATABASE_URL`: Paste from Vercel (Step 1)
   - `NEXTAUTH_SECRET`: Paste first generated secret (Step 2)
   - `CRON_SECRET`: Paste second generated secret (Step 2)
   - `SIDESHIFT_SECRET`: Your SideShift API secret
   - `AFFILIATE_ID`: Your SideShift affiliate ID

---

## Step 4: Push Database Schema (1 minute)

Run this command to create all tables in your database:

```bash
cd packages/web
npx prisma db push
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

If you see this, SUCCESS! ✅

---

## Step 5: Verify Database (1 minute)

Open Prisma Studio to see your database:

```bash
npx prisma studio
```

This opens http://localhost:5555

You should see all 12 tables:
- User
- Account
- Session
- Workflow
- Execution
- ExecutionLog
- SideShiftOrder
- PriceCache
- BetaTester
- Notification
- WorkflowMetrics
- VerificationToken

---

## Step 6: Start Development Server (1 minute)

```bash
npm run dev
```

Visit http://localhost:3000

If it loads without errors, YOU'RE DONE! 🎉

---

## 🐛 Troubleshooting

### "Can't reach database server"
- Check DATABASE_URL is correct
- Make sure you copied the ENTIRE connection string
- Try pinging: `npx prisma db pull`

### "Environment variable not found: DATABASE_URL"
- Make sure `.env.local` is in `packages/web/` folder
- Restart your terminal
- Check file is named exactly `.env.local` (not `.env.local.txt`)

### "Prisma Client not generated"
- Run: `npx prisma generate`

### "Module not found" errors
- Run: `npm install` in packages/web

---

## ✅ Checklist

- [ ] Vercel Postgres database created
- [ ] Connection string copied
- [ ] Secrets generated (NEXTAUTH_SECRET, CRON_SECRET)
- [ ] `.env.local` file created in `packages/web/`
- [ ] All values filled in `.env.local`
- [ ] `npx prisma db push` completed successfully
- [ ] `npx prisma studio` shows all 12 tables
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000

---

## 📝 What to Do After Setup

Once all checkboxes are checked:
1. ✅ Test authentication (connect wallet)
2. ✅ Test workflow creation
3. ✅ Test SideShift integration
4. 🚀 Deploy to Vercel
5. 🚀 Set up production environment variables
6. 🚀 Test cron jobs in production

---

**Ready?** Start with Step 1 and work through each step. Let me know when you're done or if you hit any issues!
