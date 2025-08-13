# 🔐 Secure Admin Authentication Setup

## ✅ What Was Changed

- **Removed hardcoded credentials** from admin-login.html client-side code
- **Created secure authentication API** using Netlify Functions
- **Credentials now stored safely** in Netlify environment variables
- **Enhanced security** with session tokens and server-side validation

## 🔧 Required Netlify Environment Variables

Add these environment variables in your Netlify dashboard:

1. Go to **https://app.netlify.com**
2. Select your **iamlookingforvintage** site
3. Go to **Site settings** → **Environment variables**
4. Add these two new variables:

```
Variable name: ADMIN_USERNAME
Value: admin
```

```
Variable name: ADMIN_PASSWORD  
Value: [your_secure_password]
```

## 📋 Complete Environment Variables List

After adding the admin credentials, you should have these environment variables:

```
GITHUB_TOKEN = ghp_... (existing)
GITHUB_OWNER = SamPrestoo (existing)
GITHUB_REPO = iamlookingforvintage (existing)
GITHUB_BRANCH = main (existing)
STRIPE_SECRET_KEY = sk_test_... (existing)
STRIPE_PUBLISHABLE_KEY = pk_test_... (existing)
ADMIN_USERNAME = admin (NEW)
ADMIN_PASSWORD = [your_secure_password] (NEW)
```

## 🚀 How It Works Now

1. **User enters credentials** on admin login page
2. **Credentials are sent securely** to `/.netlify/functions/admin-auth`
3. **Server validates** against environment variables
4. **Session token is generated** and returned if valid
5. **Client stores session data** for authentication state
6. **No credentials visible** in client-side code

## 🔒 Security Improvements

- ✅ **No hardcoded passwords** in client code
- ✅ **Server-side validation** using environment variables
- ✅ **Session tokens** for authentication state
- ✅ **CORS protection** limited to your domain
- ✅ **Error handling** with proper status codes

## 🧪 Testing

After setting the environment variables and deploying:

1. Go to **https://iamlookingforvintage.com/admin-login.html**
2. Use credentials: **admin** / **[your_secure_password]**
3. Should authenticate successfully and redirect to dashboard
4. **Inspect page source** - no credentials visible in code!

## 🔄 Changing Credentials

To change the admin credentials:
1. Update the environment variables in Netlify dashboard
2. **No code changes needed** - just update the env vars
3. New credentials take effect immediately after saving

## ⚠️ Important Notes

- **Redeploy required** after adding environment variables
- **Test thoroughly** before removing old authentication code
- **Consider using stronger passwords** for production
- **Monitor Netlify function logs** for authentication attempts