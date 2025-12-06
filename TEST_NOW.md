# ShiftFlow Wave 3 - Quick Test Guide

**All errors fixed! Ready to test!** 🚀

---

## ✅ Pre-Test Checklist

- [x] Database connected (Neon PostgreSQL)
- [x] All tables migrated
- [x] Dev server running (`npm run dev`)
- [x] Prisma Studio running (`npx prisma studio`)
- [x] All errors fixed

---

## 🧪 Test 1: Wallet Authentication

### Steps:
1. **Open the app** - http://localhost:3000
2. **Open sidebar** - Click hamburger menu (top left)
3. **Connect wallet:**
   - Click "Connect Injected" (for MetaMask, Safe, etc.)
   - OR "Connect WalletConnect" (for mobile wallets)
4. **Sign in:**
   - Click "Sign In with Wallet" (green button)
   - Sign the message in your wallet
5. **Verify:**
   - You should see your address with a green dot
   - "Sign Out" button should appear

### Verify in Database:
1. Open Prisma Studio: http://localhost:5555
2. Click "User" table
3. You should see your wallet address!

**Expected Result:** ✅ User created in database with wallet address

---

## 🧪 Test 2: Workflow Creation

### Steps:
1. **Go to workflow builder** - http://localhost:3000/builder
2. **Fill in details:**
   - Workflow Name: "Test Workflow"
   - Condition: ETH price below $3000
   - Action: Cross-Chain Swap
   - From: eth/arbitrum
   - To: btc/bitcoin
   - Amount: 0.01
   - Settle Address: `0xe1e5d5050568620e8620e831` (any valid address)
3. **Create workflow:**
   - Click "Create Workflow" button (should be enabled now!)
   - Wait for success message
   - Should redirect to dashboard

### Verify in Database:
1. Open Prisma Studio: http://localhost:5555
2. Click "Workflow" table
3. You should see your workflow!

**Expected Result:** ✅ Workflow saved to database

---

## 🧪 Test 3: Dashboard View

### Steps:
1. **Go to dashboard** - http://localhost:3000/dashboard
2. **Check workflows:**
   - Should see your created workflow
   - Should show status (ACTIVE)
   - Should show creation date

**Expected Result:** ✅ Workflows displayed from database

---

## 🧪 Test 4: Sign Out

### Steps:
1. **Open sidebar**
2. **Click "Sign Out"**
3. **Verify:**
   - Should show "Connect Injected" button again
   - Session cleared

**Expected Result:** ✅ Sign out successful

---

## 🐛 If Something Doesn't Work

### Authentication Issues
- **Can't connect wallet?** 
  - Make sure you have a wallet extension installed
  - Try refreshing the page
  
- **Sign in button doesn't work?**
  - Check browser console for errors
  - Make sure wallet is connected first

### Workflow Creation Issues
- **Button is disabled?**
  - Make sure you're signed in (green dot in sidebar)
  - Check that all required fields are filled

- **Workflow not appearing in database?**
  - Check browser console for API errors
  - Verify `.env.local` has correct DATABASE_URL
  - Make sure Prisma migration ran successfully

---

## 📊 Success Criteria

✅ **Authentication:**
- Wallet connects
- Sign in works
- User appears in database

✅ **Workflow Creation:**
- Form submits
- Success message shows
- Workflow appears in database
- Redirects to dashboard

✅ **No Errors:**
- No red errors in browser console (ignore wallet extension warnings)
- No crashes
- Smooth user experience

---

## 🎯 After Testing

If all tests pass:
1. ✅ **Mark testing complete**
2. 📦 **Proceed to deployment** (see DEPLOYMENT_GUIDE.md)
3. 🎉 **Submit to hackathon**

If tests fail:
1. 📝 **Note the error**
2. 🔍 **Check browser console**
3. 💬 **Report the issue with details**

---

**Ready to test! Open the app and follow the steps above!** 🚀

**Quick Links:**
- App: http://localhost:3000
- Prisma Studio: http://localhost:5555
- Builder: http://localhost:3000/builder
- Dashboard: http://localhost:3000/dashboard
