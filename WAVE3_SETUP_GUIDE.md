# ShiftFlow Wave 3 - Setup Guide

Quick start guide to get your development environment running.

---

## ✅ Completed Steps

- [x] npm install completed
- [x] Prisma client generated
- [x] Backend API routes created
- [x] Frontend hooks created

---

## 🚀 Next: Database Setup

You have two options for the database:

### Option 1: Local PostgreSQL (Recommended for Development)

**1. Install PostgreSQL**
- Download from: https://www.postgresql.org/download/windows/
- Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

**2. Create Database**
```sql
CREATE DATABASE shiftflow;
```

**3. Create `.env.local`**
```bash
# Copy from example
cp .env.local.example .env.local
```

**4. Update `.env.local`**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/shiftflow"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
SIDESHIFT_SECRET="your-sideshift-secret"
AFFILIATE_ID="your-affiliate-id"
CRON_SECRET="another-secret-here"  # Generate with: openssl rand -base64 32
```

**5. Run Migration**
```bash
cd packages/web
npx prisma migrate dev --name init
```

**6. (Optional) Seed Database**
```bash
npx prisma db seed
```

---

### Option 2: Vercel Postgres (Recommended for Production)

**1. Create Vercel Postgres Database**
- Go to: https://vercel.com/dashboard
- Click "Storage" → "Create Database" → "Postgres"
- Copy the connection string

**2. Create `.env.local`**
```bash
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
SIDESHIFT_SECRET="your-sideshift-secret"
AFFILIATE_ID="your-affiliate-id"
CRON_SECRET="another-secret-here"
```

**3. Run Migration**
```bash
cd packages/web
npx prisma migrate deploy
```

---

## 🔑 Getting SideShift Credentials

**1. Get Affiliate ID**
- Sign up at: https://sideshift.ai/
- Go to your account settings
- Find your affiliate ID

**2. Get API Secret**
- Contact SideShift support or check your account dashboard
- Request API access if needed

---

## 🧪 Testing the Setup

### 1. Start Development Server

```bash
cd packages/web
npm run dev
```

### 2. Test Database Connection

```bash
npx prisma studio
```

This opens a GUI to view your database at http://localhost:5555

### 3. Test API Endpoints

**Test Authentication:**
```bash
# This will fail with 401 (expected - need to authenticate first)
curl http://localhost:3000/api/workflows
```

**Test SideShift Proxy:**
```bash
# This will also fail with 401 (expected)
curl -X POST http://localhost:3000/api/sideshift/quote \
  -H "Content-Type: application/json" \
  -d '{"depositCoin":"eth","settleCoin":"btc","depositAmount":"0.1"}'
```

---

## 🎨 Frontend Setup

The hooks are already created:
- ✅ `useWalletAuth` - Wallet authentication
- ✅ `useWorkflows` - Workflow management
- ✅ `useSideShift` - SideShift API proxy

### Update Your Components

**Example: Using the hooks**

```typescript
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useSideShift } from '@/hooks/useSideShift';

function MyComponent() {
  const { authenticate, isAuthenticated } = useWalletAuth();
  const { workflows, createWorkflow } = useWorkflows();
  const { getQuote, createShift } = useSideShift();

  // Your component logic
}
```

---

## 📋 Verification Checklist

Before proceeding, verify:

- [ ] Database is running (PostgreSQL or Vercel Postgres)
- [ ] `.env.local` file exists with all variables
- [ ] `npx prisma migrate dev` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] `npx prisma studio` works

---

## 🐛 Troubleshooting

### "Can't reach database server"
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env.local`
- Test connection: `npx prisma db pull`

### "Module not found" errors
- Run: `npm install` again
- Clear cache: `rm -rf node_modules && npm install`

### "Prisma Client not generated"
- Run: `npx prisma generate`

### TypeScript errors
- Restart your IDE/editor
- Run: `npm run build` to check for real errors

---

## 🚀 Next Steps

Once setup is complete:

1. **Test authentication flow**
   - Connect wallet
   - Sign message
   - Verify session

2. **Test workflow creation**
   - Create a test workflow
   - View in Prisma Studio
   - Update and delete

3. **Test SideShift integration**
   - Request a quote
   - Create a shift
   - Check shift status

4. **Move to Phase 3**
   - Implement execution engine
   - Set up cron jobs
   - Add notifications

---

## 📚 Useful Commands

```bash
# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create migration
npx prisma migrate reset       # Reset database
npx prisma db push             # Push schema without migration
npx prisma generate            # Generate Prisma Client

# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Run linter

# Testing
npm test                       # Run tests (when added)
```

---

## 🎯 Current Status

**Phase 1: Backend Foundation** ✅ Complete
- Database schema
- Authentication
- API routes
- SideShift proxy

**Phase 2: Frontend Hooks** ✅ Complete
- useWalletAuth
- useWorkflows
- useSideShift

**Phase 3: Execution Engine** 🔄 Next
- Workflow monitor
- Condition checking
- Cron jobs

---

**Ready to build!** 🚀

Once your database is set up and running, you can start testing the full stack!
