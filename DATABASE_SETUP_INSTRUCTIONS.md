# Vercel Postgres Setup - Step by Step

Follow these steps to set up your database and continue building.

---

## Step 1: Create Vercel Postgres Database

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your ShiftFlow project (or create one)

2. **Create Storage**
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name: `shiftflow-db`
   - Select region closest to you
   - Click "Create"

3. **Get Connection String**
   - After creation, click on your database
   - Go to ".env.local" tab
   - Copy the `POSTGRES_PRISMA_URL` value
   - It looks like: `postgres://default:xxx@xxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Create Postgres database
vercel postgres create shiftflow-db

# Get connection string
vercel env pull .env.local
```

---

## Step 2: Create .env.local File

Create `packages/web/.env.local` with the following:

```bash
# Database (from Vercel Postgres)
DATABASE_URL="postgres://default:xxx@xxx-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# SideShift API
SIDESHIFT_SECRET="your-sideshift-secret"
AFFILIATE_ID="your-affiliate-id"

# Cron Job Security
CRON_SECRET="another-secret-here"
```

### Generate Secrets

Run these commands to generate secure secrets:

**Windows PowerShell:**
```powershell
# Generate NEXTAUTH_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Generate CRON_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Or use online generator:**
- Visit: https://generate-secret.vercel.app/32

---

## Step 3: Run Database Migration

```bash
cd packages/web

# Push schema to database
npx prisma db push

# Or create migration (recommended for production)
npx prisma migrate deploy
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

## Step 4: Verify Database Setup

```bash
# Open Prisma Studio to view database
npx prisma studio
```

This opens http://localhost:5555 where you can see all your tables.

---

## Step 5: Test the Setup

```bash
# Start dev server
npm run dev
```

Visit http://localhost:3000 - Your app should start without database errors!

---

## 🎯 Quick Checklist

- [ ] Vercel Postgres database created
- [ ] `.env.local` file created with DATABASE_URL
- [ ] Secrets generated (NEXTAUTH_SECRET, CRON_SECRET)
- [ ] `npx prisma db push` completed successfully
- [ ] `npx prisma studio` shows all tables
- [ ] `npm run dev` starts without errors

---

## 🐛 Troubleshooting

**"Can't reach database server"**
- Check if DATABASE_URL is correct
- Make sure you're using `POSTGRES_PRISMA_URL` from Vercel (not POSTGRES_URL)
- Try: `npx prisma db pull` to test connection

**"Environment variable not found: DATABASE_URL"**
- Make sure `.env.local` is in `packages/web/` directory
- Restart your terminal/IDE

**"Schema validation error"**
- Make sure you're using Prisma 5.x (not 7.x)
- Run: `npm list prisma` to check version

---

## 📝 What Happens Next

After database setup is complete, we'll:
1. ✅ Test API endpoints
2. ✅ Verify authentication flow
3. 🚀 Build Phase 3: Execution Engine
4. 🚀 Set up Cron jobs
5. 🚀 Deploy to Vercel

---

**Ready?** Let me know once you've completed Steps 1-2, and I'll help you run the migration!
