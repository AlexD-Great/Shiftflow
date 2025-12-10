# 🚀 Vercel Environment Variables Setup

## ✅ Local Environment - DONE
Your `.env.local` file has been updated with SideShift credentials.

## ⚠️ Production Environment - ACTION REQUIRED

You need to add these same credentials to Vercel for production deployment.

---

## 📝 Variables to Add to Vercel

Go to: https://vercel.com/alexs-projects-d94d3fc6/shiftflow-web/settings/environment-variables

Add the following:

### 1. SIDESHIFT_SECRET
```
d553f605e391d39c00a28ab6d4f4578a
```

### 2. SIDESHIFT_AFFILIATE_ID
```
5j3eWpWtW
```

---

## 🎯 Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/
2. Navigate to your ShiftFlow project
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar

### Step 2: Add SIDESHIFT_SECRET
1. Click "Add New" button
2. **Key:** `SIDESHIFT_SECRET`
3. **Value:** `d553f605e391d39c00a28ab6d4f4578a`
4. **Environment:** Select all (Production, Preview, Development)
5. Click "Save"

### Step 3: Add SIDESHIFT_AFFILIATE_ID
1. Click "Add New" button again
2. **Key:** `SIDESHIFT_AFFILIATE_ID`
3. **Value:** `5j3eWpWtW`
4. **Environment:** Select all (Production, Preview, Development)
5. Click "Save"

### Step 4: Redeploy
1. Go to "Deployments" tab
2. Click "..." menu on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

---

## ✅ Verification

After redeploying, test the SideShift API:

1. Go to: https://shiftflow-web.vercel.app/api-test
2. Fill in SideShift Quote form:
   - Deposit Coin: `eth`
   - Settle Coin: `btc`
   - Amount: `1`
3. Click "Get Quote"
4. **Expected:** Quote details appear (NOT "Account not found")

---

## 🎉 Once Complete

After adding to Vercel and redeploying:
- ✅ Local development will work
- ✅ Production will work
- ✅ SideShift quotes will load
- ✅ Workflow execution will work

---

## 📞 Support

If you encounter issues:
- Check Vercel deployment logs
- Verify environment variables are set
- Ensure you selected all environments
- Try redeploying again

---

**Status:** ⚠️ **Waiting for Vercel Configuration**

**Next:** Add variables to Vercel and redeploy!
