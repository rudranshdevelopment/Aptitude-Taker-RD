# 🔧 Vercel Environment Variables Check

## ⚠️ CRITICAL: Set These in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables:

```env
NEXTAUTH_URL=https://aptitude-taker.vercel.app
NEXTAUTH_SECRET=<your-secret-key>
DATABASE_URL=<your-database-url>
```

### ⚠️ Important Notes:

1. **NEXTAUTH_URL**:
   - ✅ Must be: `https://aptitude-taker.vercel.app`
   - ✅ Must use HTTPS (not HTTP)
   - ✅ No trailing slash
   - ❌ Wrong: `http://aptitude-taker.vercel.app`
   - ❌ Wrong: `https://aptitude-taker.vercel.app/`

2. **NEXTAUTH_SECRET**:
   - Generate with: `openssl rand -base64 32`
   - Must be the same value used everywhere
   - Should be at least 32 characters

3. **After Setting Variables**:
   - **Redeploy** your project (Vercel will auto-redeploy or you can trigger manually)
   - Wait for deployment to complete
   - Clear browser cookies
   - Test login again

## 🧪 Test Steps:

1. **Clear Browser Data**:
   - Open DevTools (F12)
   - Application → Cookies → Delete all for `aptitude-taker.vercel.app`
   - Or use Incognito/Private window

2. **Test Login**:
   - Go to: https://aptitude-taker.vercel.app/admin/login
   - Email: `rudranshdevelopment@gmail.com`
   - Password: `Vivek@142003`
   - Click "Sign In"

3. **Expected Behavior**:
   - ✅ See "Login successful" toast
   - ✅ Wait 1-2 seconds
   - ✅ Redirects to dashboard
   - ✅ Dashboard loads with stats
   - ✅ See "Login successful!" toast on dashboard
   - ❌ Should NOT redirect back to login

## 🔍 Debugging:

### Check Browser Console (F12):
- Look for: `✅ Session cookie confirmed, redirecting...`
- Check for any errors

### Check Network Tab:
- After login, check `/api/auth/session` request
- Should return 200 with user data
- Check cookies in request headers

### Check Cookies (Application Tab):
- After login, look for: `next-auth.session-token`
- Should have:
  - ✅ `Secure` flag (HTTPS)
  - ✅ `SameSite=Lax`
  - ✅ `HttpOnly` flag
  - ✅ Domain: `.vercel.app` or `aptitude-taker.vercel.app`

## 🐛 If Still Not Working:

1. **Verify Environment Variables**:
   - Go to Vercel Dashboard
   - Check all variables are set
   - **Redeploy** after setting/changing variables

2. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for NextAuth errors
   - Look for middleware errors

3. **Test Cookie Manually**:
   - After login, check if cookie exists
   - Try accessing `/api/auth/session` directly in browser
   - Should return user data if cookie is set

4. **Common Issues**:
   - ❌ `NEXTAUTH_URL` not set → Cookie won't work
   - ❌ `NEXTAUTH_URL` uses HTTP → Secure cookie fails
   - ❌ `NEXTAUTH_SECRET` mismatch → Token validation fails
   - ❌ Cookie domain mismatch → Cookie not sent with requests

