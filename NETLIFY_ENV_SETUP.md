# CRITICAL: Netlify Environment Variable Setup

## ⚠️ REQUIRED FOR DEPLOYMENT TO WORK ⚠️

The application will show a **blank screen** on Netlify if these environment variables are not set correctly.

## Steps to Configure Netlify

### 1. Go to Netlify Dashboard
- Navigate to your site in [Netlify Dashboard](https://app.netlify.com/)
- Go to: **Site configuration** → **Environment variables**

### 2. Add Required Environment Variables

#### Variable 1: VITE_NEON_AUTH_URL (CRITICAL - APP WON'T WORK WITHOUT THIS)
```
Key:   VITE_NEON_AUTH_URL
Value: https://ep-wispy-night-aiwx2id1.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth
Scopes: All scopes (Production, Deploy Previews, Branch deploys)
```

#### Variable 2: NETLIFY_DATABASE_URL (Auto-populated by Netlify-Neon integration)
```
Key:   NETLIFY_DATABASE_URL
Value: [Your pooled connection string from Neon - port 6543]
Scopes: All scopes (Production, Deploy Previews, Branch deploys)
```

**Note**: If you've connected your Neon project through the Netlify Neon integration, `NETLIFY_DATABASE_URL` should already be set automatically. You only need to manually add `VITE_NEON_AUTH_URL`.

### 3. Trigger a New Deployment

After adding the environment variables, you **MUST** trigger a new deployment:
- Go to **Deploys** tab
- Click **Trigger deploy** → **Clear cache and deploy site**

**Important**: Environment variables are only available during the build process. Adding them after a build has completed won't help - you need to rebuild.

## Verification

After the deployment completes:

1. **Check Build Logs**
   - Open the deploy logs in Netlify
   - Look for any errors related to environment variables
   - The build should complete successfully

2. **Test the Live Site**
   - Visit your Netlify URL
   - You should see the application UI, not a blank screen
   - Try to sign in or sign up
   - If auth works, the configuration is correct!

3. **Browser Console**
   - Open browser developer tools (F12)
   - Check the Console tab for any errors
   - If you see "Configuration Error", the environment variable wasn't set correctly

## Troubleshooting

### Still seeing a blank screen?
1. Verify `VITE_NEON_AUTH_URL` is set in Netlify environment variables
2. Make sure you triggered a **new deployment** after adding the variable
3. Check the deploy logs for build errors
4. Check browser console for JavaScript errors

### Configuration Error page instead of app?
- This is actually better than a blank screen! It means the fix is working
- The error page will tell you exactly what's missing
- Double-check the `VITE_NEON_AUTH_URL` value matches exactly:
  ```
  https://ep-wispy-night-aiwx2id1.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth
  ```

### Auth not working?
1. Verify the Auth URL is correct (copy-paste from above)
2. Make sure database migration was run (see DEPLOY.md)
3. Check that Neon Auth tables exist in your database

## Security Notes

- ✅ The Auth URL is safe to expose publicly (it's used in client-side code)
- ❌ Never commit database credentials to Git
- ❌ Never commit the actual `.env` file (it's in .gitignore)
- ✅ Use `.env.example` as a template for documentation

## Quick Reference

Your project's Neon Auth configuration:
- **Auth URL**: `https://ep-wispy-night-aiwx2id1.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth`
- **JWKS URL**: `https://ep-wispy-night-aiwx2id1.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth/.well-known/jw`
- **Project Endpoint**: `ep-wispy-night-aiwx2id1`
- **Region**: `us-east-1`
- **Database**: `neondb`
