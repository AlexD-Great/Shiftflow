# 🔄 RESTART DEV SERVER NOW!

## ⚠️ Critical: Environment Variables Updated

I just added missing environment variables to `.env.local`:
- ✅ `NEXTAUTH_SECRET` - Required for authentication
- ✅ `NEXTAUTH_URL` - App URL
- ✅ `SIDESHIFT_AFFILIATE_ID` - SideShift integration
- ✅ `SIDESHIFT_SECRET` - API secret
- ✅ `CRON_SECRET` - Cron job protection

**These will NOT work until you restart the dev server!**

---

## 🚀 How to Restart

### In your terminal where dev server is running:

1. **Stop the server:**
   - Press `Ctrl+C` (or `Cmd+C` on Mac)
   - Wait for it to fully stop

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Wait for it to start:**
   ```
   ✓ Ready in 2.5s
   ○ Local:   http://localhost:3000
   ```

---

## 🧹 Clear Browser Data (Important!)

After restarting, clear your browser:

1. **Open DevTools** - Press `F12`
2. **Go to Application tab**
3. **Clear Storage:**
   - Click "Clear site data"
   - OR manually delete cookies for localhost:3000

4. **Refresh the page** - Press `F5`

---

## ✅ Then Test Again

1. **Open sidebar**
2. **Connect wallet** (if not connected)
3. **Sign in** - Click "Sign In with Wallet"
4. **Create workflow** - Go to `/builder`
5. **Should work now!** ✅

---

## 🔍 What to Look For

### In Terminal (Dev Server):
After you sign in, you should see:
```
[API] Session: exists user: cmit5g561000f...
[API] Creating workflow for user: cmit5g561000f...
```

### In Browser:
- ✅ No "Unauthorized" error
- ✅ "Workflow created successfully!"
- ✅ Redirects to dashboard

---

## 📊 If Still Not Working

Check these:

1. **Did you restart?** - Environment variables only load on startup
2. **Did you clear cookies?** - Old session might be cached
3. **Did you sign in again?** - New session needed after restart

---

**RESTART NOW AND TRY AGAIN!** 🔄
