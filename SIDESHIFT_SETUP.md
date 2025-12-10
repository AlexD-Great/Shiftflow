# 🔧 SideShift API Setup Guide

## Overview
ShiftFlow requires a SideShift API key to execute cross-chain swaps. This guide explains how to get your API credentials and configure the application.

---

## 🚨 Current Issue: "Account not found"

**Error:** `Account not found` when requesting quotes

**Cause:** Missing or invalid `SIDESHIFT_SECRET` environment variable

**Solution:** Follow the setup steps below

---

## 📝 Step-by-Step Setup

### Step 1: Get SideShift API Credentials

1. **Visit SideShift.ai**
   - Go to: https://sideshift.ai/

2. **Create an Account** (if you don't have one)
   - Sign up for a SideShift account
   - Verify your email

3. **Request API Access**
   - Contact SideShift support: support@sideshift.ai
   - Request API access for your account
   - Mention you're building an automation platform

4. **Get Your API Secret**
   - Once approved, you'll receive:
     - `x-sideshift-secret` (API key)
     - Optional: `affiliateId` (for revenue sharing)

---

### Step 2: Configure Environment Variables

#### For Local Development:

1. **Create `.env.local` file** in `packages/web/`:
   ```bash
   cd packages/web
   cp .env.example .env.local
   ```

2. **Add your SideShift credentials**:
   ```env
   SIDESHIFT_SECRET="your-actual-api-secret-here"
   SIDESHIFT_AFFILIATE_ID="your-affiliate-id" # Optional
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

#### For Vercel Deployment:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to Settings → Environment Variables

2. **Add the following variables**:
   ```
   SIDESHIFT_SECRET = your-actual-api-secret-here
   SIDESHIFT_AFFILIATE_ID = your-affiliate-id (optional)
   ```

3. **Redeploy your application**
   - Trigger a new deployment
   - Or wait for automatic deployment on next push

---

## 🧪 Testing Without API Key

If you don't have a SideShift API key yet, you can still test most features:

### What Works Without API Key:
- ✅ Homepage & Navigation
- ✅ Template Library
- ✅ Workflow Builder UI
- ✅ Dashboard
- ✅ Workflow Creation & Saving
- ✅ Price Monitoring (uses CoinGecko)

### What Requires API Key:
- ❌ SideShift Quote Requests
- ❌ Actual Swap Execution
- ❌ Shift Creation

### Development Mode (Coming Soon):
We're adding a development mode that simulates SideShift responses for testing without an API key.

---

## 🔍 Verifying Your Setup

### Test 1: Check Environment Variables

```bash
# In packages/web directory
node -e "console.log('SIDESHIFT_SECRET:', process.env.SIDESHIFT_SECRET ? 'Set ✅' : 'Missing ❌')"
```

### Test 2: Test Quote API

1. Go to: https://shiftflow-web.vercel.app/api-test
2. Fill in the SideShift Quote form:
   - Deposit Coin: `eth`
   - Settle Coin: `btc`
   - Amount: `1`
3. Click "Get Quote"
4. **Expected Result:** Quote details appear (not "Account not found")

### Test 3: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Go to "Functions" tab
4. Look for `/api/sideshift/quote` logs
5. Check for errors

---

## 🐛 Troubleshooting

### Error: "Account not found"

**Possible Causes:**
1. ❌ `SIDESHIFT_SECRET` not set
2. ❌ Invalid API secret
3. ❌ API secret not activated
4. ❌ Environment variable not deployed to Vercel

**Solutions:**
1. Verify `.env.local` has correct secret
2. Check Vercel environment variables
3. Redeploy after adding variables
4. Contact SideShift support if secret is invalid

---

### Error: "SideShift API not configured"

**Cause:** Missing `SIDESHIFT_SECRET` environment variable

**Solution:**
1. Add `SIDESHIFT_SECRET` to `.env.local`
2. Add to Vercel environment variables
3. Restart dev server / redeploy

---

### Error: CORS / Network Issues

**Cause:** Direct client-side calls to SideShift API

**Solution:**
- All SideShift calls go through our backend proxy
- Check that you're using `/api/sideshift/*` endpoints
- Never call `https://sideshift.ai` directly from client

---

## 📊 API Usage & Limits

### SideShift API Limits:
- **Rate Limit:** Varies by account type
- **Quote Validity:** 30 seconds
- **Minimum Amounts:** Varies by coin pair

### Best Practices:
1. **Cache quotes** - Don't request too frequently
2. **Handle errors** - API may be temporarily unavailable
3. **Validate inputs** - Check coin pairs before requesting
4. **Monitor usage** - Track API calls in logs

---

## 🔐 Security Best Practices

### DO:
- ✅ Store API secret in environment variables
- ✅ Use backend proxy for all SideShift calls
- ✅ Pass `x-user-ip` header (Mike's requirement)
- ✅ Validate all user inputs
- ✅ Log API errors for debugging

### DON'T:
- ❌ Commit API secrets to Git
- ❌ Expose secrets in client-side code
- ❌ Share API secrets publicly
- ❌ Make direct client-to-SideShift calls
- ❌ Hardcode API keys

---

## 📞 Getting Help

### SideShift Support:
- **Email:** support@sideshift.ai
- **Website:** https://sideshift.ai/
- **API Docs:** https://sideshift.ai/api

### ShiftFlow Issues:
- **GitHub:** https://github.com/AlexD-Great/Shiftflow/issues
- **Check Logs:** Vercel Dashboard → Functions
- **Test Locally:** Run `npm run dev` and check console

---

## 🎯 Quick Checklist

Before testing SideShift features:

- [ ] SideShift account created
- [ ] API access requested and approved
- [ ] `SIDESHIFT_SECRET` obtained
- [ ] `.env.local` file created
- [ ] Environment variable added
- [ ] Development server restarted
- [ ] Vercel variables configured (for production)
- [ ] Application redeployed
- [ ] Quote API tested successfully

---

## 🚀 Next Steps

Once SideShift is configured:

1. **Test Quote Functionality**
   - Use API test page
   - Verify quotes return successfully

2. **Create Test Workflow**
   - Build a simple swap workflow
   - Test with small amounts

3. **Monitor Execution**
   - Check dashboard for workflow status
   - Review execution logs

4. **Enable Beta Testing**
   - Share with beta testers
   - Gather feedback

---

**Status:** 🔴 **API Key Required**

**Action Required:** Add `SIDESHIFT_SECRET` to environment variables

**Once configured:** 🟢 **Ready for Testing**
