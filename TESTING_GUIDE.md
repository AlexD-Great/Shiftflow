# ShiftFlow Wave 3 - Testing Guide

Complete testing checklist after database setup.

---

## 🧪 Phase 1: Backend API Testing

### Test 1: Database Connection ✅

```bash
# Open Prisma Studio
npx prisma studio
```

**Expected:** Opens http://localhost:5555 with all 12 tables visible

---

### Test 2: Development Server ✅

```bash
# Start dev server
npm run dev
```

**Expected:** 
- Server starts on http://localhost:3000
- No database connection errors
- No module not found errors

---

### Test 3: API Endpoints (Manual)

**Test Workflow Endpoint:**
```bash
# This should return 401 Unauthorized (expected - not authenticated)
curl http://localhost:3000/api/workflows
```

**Expected Response:**
```json
{"error":"Unauthorized"}
```

✅ If you get this, the API is working!

---

### Test 4: SideShift Proxy (Manual)

```bash
# This should also return 401 (expected)
curl -X POST http://localhost:3000/api/sideshift/quote \
  -H "Content-Type: application/json" \
  -d '{"depositCoin":"eth","settleCoin":"btc","depositAmount":"0.1"}'
```

**Expected Response:**
```json
{"error":"Unauthorized"}
```

✅ If you get this, the proxy is working!

---

### Test 5: Cron Job Endpoint

```bash
# This should return 401 (expected - needs CRON_SECRET)
curl http://localhost:3000/api/cron/monitor
```

**Expected Response:**
```json
{"error":"Unauthorized"}
```

✅ Cron endpoint is protected!

---

## 🎨 Phase 2: Frontend Testing

### Test 1: Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. Select your wallet (MetaMask, WalletConnect, etc.)
4. Approve connection

**Expected:** Wallet connects successfully

---

### Test 2: Authenticate with SIWE

1. After wallet is connected
2. Click "Sign In" button
3. Sign the message in your wallet
4. Wait for authentication

**Expected:** 
- User is authenticated
- Session is created
- User ID is stored in database

**Verify in Prisma Studio:**
- Open http://localhost:5555
- Check "User" table
- You should see your wallet address

---

### Test 3: Create Workflow

1. Navigate to workflow builder
2. Fill in workflow details:
   - Name: "Test DCA Strategy"
   - Description: "Buy BTC when ETH drops below $3000"
3. Add condition:
   - Type: Price Threshold
   - Coin: ethereum
   - Operator: below
   - Value: 3000
4. Add action:
   - Type: SideShift Swap
   - From: ETH
   - To: BTC
   - Amount: 0.1
5. Click "Create Workflow"

**Expected:**
- Workflow is created
- Redirected to workflow list
- Workflow appears with "DRAFT" status

**Verify in Prisma Studio:**
- Check "Workflow" table
- You should see your workflow

---

### Test 4: Update Workflow Status

1. Find your test workflow
2. Click "Activate" button
3. Confirm activation

**Expected:**
- Status changes to "ACTIVE"
- Workflow is now monitored by cron job

**Verify in Prisma Studio:**
- Workflow status should be "ACTIVE"

---

### Test 5: View Workflow Details

1. Click on your workflow
2. View details page

**Expected:**
- See workflow name, description
- See conditions and actions
- See execution history (empty for now)
- See status and execution count

---

## ⚙️ Phase 3: Execution Engine Testing

### Test 1: Manual Cron Trigger

Test the cron job manually with authentication:

```bash
# Get your CRON_SECRET from .env.local
# Replace YOUR_CRON_SECRET with actual value

curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/monitor
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-12-03T...",
  "duration": "123ms"
}
```

**Check Console Output:**
- Should see "[Workflow Monitor] Starting workflow check..."
- Should see number of active workflows
- Should see condition checking logs

---

### Test 2: Price Oracle

The price oracle is tested automatically when cron runs.

**Check Console Output:**
- Look for "[Price Oracle] Fetched ethereum: $..."
- Prices should be cached for 60 seconds

---

### Test 3: Condition Checking

1. Create a workflow with a price condition
2. Set the condition to something that will trigger
   - Example: ETH below $10,000 (should trigger immediately)
3. Activate the workflow
4. Wait for cron job to run (max 1 minute)

**Expected:**
- Cron job checks condition
- Condition is met
- Execution is created
- Check "Execution" table in Prisma Studio

---

### Test 4: Execution Logs

After an execution is created:

1. Open Prisma Studio
2. Go to "ExecutionLog" table
3. View logs for your execution

**Expected:**
- See "Workflow execution started"
- See action execution logs
- See "Workflow execution completed" or error logs

---

### Test 5: Notification System

After a workflow executes:

1. Open Prisma Studio
2. Go to "Notification" table
3. Check for notifications

**Expected:**
- Notification created for workflow execution
- Type: WORKFLOW_EXECUTED
- Message includes workflow details

---

## 🚀 Phase 4: SideShift Integration Testing

### Test 1: Request Quote (Authenticated)

1. Make sure you're authenticated
2. Use the frontend to request a quote
3. Or use authenticated API call

**Expected:**
- Quote is returned from SideShift
- x-user-ip header is passed
- Quote ID is generated

**Check Console:**
- Look for "[SideShift Quote] Requesting quote for user IP: ..."
- Look for "[SideShift Quote] Success - Quote ID: ..."

---

### Test 2: Create Fixed Shift (Authenticated)

1. After getting a quote
2. Create a fixed shift
3. Provide settle address

**Expected:**
- Shift is created
- Deposit address is returned
- Shift is stored in database

**Verify in Prisma Studio:**
- Check "SideShiftOrder" table
- See your shift with status "pending"

---

### Test 3: Check Shift Status

1. Get shift ID from previous test
2. Check shift status

**Expected:**
- Status is returned
- Database is updated with latest status

---

## 📊 Phase 5: Database Integrity Testing

### Test 1: User Relations

1. Open Prisma Studio
2. Click on a User
3. Check relations

**Expected:**
- See workflows created by user
- See executions by user
- All relations work correctly

---

### Test 2: Workflow Relations

1. Click on a Workflow
2. Check relations

**Expected:**
- See user who created it
- See executions of this workflow
- All relations work correctly

---

### Test 3: Execution Relations

1. Click on an Execution
2. Check relations

**Expected:**
- See workflow it belongs to
- See user who owns it
- See execution logs
- All relations work correctly

---

## 🎯 Complete Testing Checklist

### Backend
- [ ] Database connection works
- [ ] Prisma Studio shows all tables
- [ ] Dev server starts without errors
- [ ] API endpoints return 401 when not authenticated
- [ ] Cron endpoint is protected

### Authentication
- [ ] Wallet connects successfully
- [ ] SIWE message signing works
- [ ] User is created in database
- [ ] Session is maintained

### Workflows
- [ ] Can create workflow
- [ ] Can view workflow list
- [ ] Can view workflow details
- [ ] Can update workflow
- [ ] Can activate workflow
- [ ] Can pause workflow
- [ ] Can delete workflow

### Execution Engine
- [ ] Cron job runs successfully
- [ ] Price oracle fetches prices
- [ ] Conditions are checked
- [ ] Executions are created when conditions met
- [ ] Execution logs are stored
- [ ] Notifications are created

### SideShift Integration
- [ ] Can request quote (authenticated)
- [ ] x-user-ip header is passed
- [ ] Can create fixed shift
- [ ] Shift is stored in database
- [ ] Can check shift status
- [ ] Database updates with status

### Database
- [ ] All relations work correctly
- [ ] No orphaned records
- [ ] Cascade deletes work
- [ ] Indexes are used efficiently

---

## 🐛 Common Issues & Solutions

### "Unauthorized" on all API calls
- **Solution:** Make sure you're authenticated with wallet

### Cron job not running
- **Solution:** Check CRON_SECRET is correct in request

### Price oracle not fetching prices
- **Solution:** Check internet connection, CoinGecko API might be rate limited

### Workflow not executing
- **Solution:** 
  - Check workflow status is "ACTIVE"
  - Check conditions are actually met
  - Check cron job is running
  - Check execution logs for errors

### SideShift errors
- **Solution:**
  - Check SIDESHIFT_SECRET is correct
  - Check AFFILIATE_ID is correct
  - Check x-user-ip header is being passed
  - Check SideShift API status

---

## 📈 Performance Testing

### Test 1: Multiple Workflows

1. Create 10 workflows
2. Activate all of them
3. Wait for cron job
4. Check execution time

**Expected:** Should complete in < 5 seconds

---

### Test 2: Price Caching

1. Request price for same coin multiple times
2. Check console logs

**Expected:** 
- First request fetches from API
- Subsequent requests use cache (within 60 seconds)

---

### Test 3: Database Query Performance

1. Create 100 workflows
2. List workflows
3. Check response time

**Expected:** Should load in < 1 second

---

## ✅ Success Criteria

Your implementation is ready for deployment when:

- ✅ All backend tests pass
- ✅ Authentication works end-to-end
- ✅ Can create and manage workflows
- ✅ Execution engine runs automatically
- ✅ SideShift integration works with x-user-ip
- ✅ Database relations are correct
- ✅ No console errors
- ✅ Performance is acceptable

---

## 🚀 Next: Deployment

Once all tests pass, proceed to deployment:

1. Push code to GitHub
2. Deploy to Vercel
3. Set environment variables in Vercel
4. Run production migration
5. Test in production
6. Enable cron jobs
7. Recruit beta testers

---

**Ready to test?** Start with Phase 1 and work through each phase systematically!
