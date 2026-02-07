# Deployment Checklist for Testing

This checklist ensures all steps are completed for a successful deployment to Netlify.

## Pre-Deployment Checklist

### 1. Repository Setup
- [x] Code is committed to GitHub
- [x] Branch is up to date with latest changes
- [x] Build succeeds locally (`npm run build`)
- [x] Preview works locally (`npm run preview`)

### 2. Environment Variables Required
The following environment variables must be configured in Netlify:

#### Required Variables:
- [ ] **DATABASE_URL**: Neon pooled connection string (port 6543)
  - Example: `postgresql://user:password@ep-xxx.region.aws.neon.tech:6543/dbname?sslmode=require`
  - Get from: Neon dashboard > Connection Details > Pooled connection
  
- [ ] **VITE_NEON_AUTH_URL**: Neon Auth endpoint URL
  - Example: `https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth`
  - Get from: Neon dashboard > Auth tab

### 3. Netlify Configuration
- [x] `netlify.toml` is present with correct settings
- [x] Functions directory configured (`netlify/functions`)
- [x] Redirects configured for SPA routing
- [x] API proxy configured for `/api/*` endpoints

### 4. Static Assets
- [x] Service worker (`sw.js`) in public folder
- [x] Manifest file (`manifest.json`) in public folder
- [x] References use absolute paths (`/sw.js`, `/manifest.json`)

## Deployment Steps

### Option A: Netlify UI Deployment

1. **Login to Netlify**
   - Go to https://netlify.com
   - Login with your account

2. **Create New Site**
   - Click "Add new site" > "Import an existing project"
   - Choose GitHub as the source
   - Select the repository: `spservicesgroupinc-blip/RFE`
   - Select the branch you want to deploy

3. **Configure Build Settings**
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `dist` (auto-detected)
   - Functions directory: `netlify/functions` (auto-detected from netlify.toml)

4. **Add Environment Variables**
   - Go to Site settings > Environment variables
   - Add `DATABASE_URL` with your Neon pooled connection string
   - Add `VITE_NEON_AUTH_URL` with your Neon Auth URL

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (typically 2-5 minutes)

### Option B: Netlify CLI Deployment

1. **Install Netlify CLI** (if not already installed)
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site** (first time only)
   ```bash
   netlify init
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set DATABASE_URL "your-connection-string"
   netlify env:set VITE_NEON_AUTH_URL "your-auth-url"
   ```

5. **Deploy**
   ```bash
   # Deploy to production
   netlify deploy --prod

   # Or deploy to preview first
   netlify deploy
   ```

## Post-Deployment Verification

### 1. Build Verification
- [ ] Build completed successfully
- [ ] No build errors in Netlify logs
- [ ] All functions deployed successfully

### 2. Site Access
- [ ] Site is accessible at Netlify URL
- [ ] Homepage loads without errors
- [ ] No console errors in browser

### 3. Static Assets
- [ ] Service worker registers successfully
- [ ] Manifest.json is accessible at `/manifest.json`
- [ ] PWA features work (if applicable)

### 4. API Functionality
- [ ] API endpoint is accessible at `/api/`
- [ ] Database connection works
- [ ] Authentication works

### 5. Authentication
- [ ] Neon Auth integration works
- [ ] Login/signup flows work
- [ ] Session management works

## Troubleshooting

### Build Fails
- Check Netlify build logs for errors
- Verify all dependencies are in `package.json`
- Ensure `npm run build` works locally

### 404 on Page Refresh
- Verify `netlify.toml` has SPA redirect rules
- Check that `[[redirects]]` rule is present

### Database Connection Issues
- Verify `DATABASE_URL` is set in Netlify environment variables
- Ensure using pooled connection string (port 6543)
- Check database is accessible from Netlify servers

### Authentication Issues
- Verify `VITE_NEON_AUTH_URL` is set correctly
- Check Neon Auth is enabled in Neon dashboard
- Verify Auth URL format matches expected pattern

### Function Errors
- Check Netlify function logs
- Verify function code is TypeScript-compatible
- Ensure database client is properly configured

## Success Criteria

The deployment is considered successful when:
- [x] Build completes without errors
- [ ] Site is accessible and loads
- [ ] All static assets load correctly
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] Authentication flow works
- [ ] No critical console errors

## Additional Resources

- [DEPLOY.md](./DEPLOY.md) - Basic deployment guide
- [NEON_AUTH_SETUP.md](./NEON_AUTH_SETUP.md) - Neon Auth setup guide
- [Netlify Documentation](https://docs.netlify.com/)
- [Neon Documentation](https://neon.tech/docs)
