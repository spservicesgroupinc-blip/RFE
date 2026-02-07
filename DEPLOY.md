# Deploy to Netlify with Neon Database

## Prerequisites
1.  **Netlify Account**
2.  **Neon Database Project** (Get the connection string)

## Deployment Steps

1.  **Push to GitHub**: Ensure your code is pushed to your repository.
2.  **Create New Site in Netlify**:
    - "Import from Git" -> Choose your repo.
    - **Build Command**: `npm run build` (Should be auto-detected from `netlify.toml`)
    - **Publish Directory**: `dist`

3.  **Environment Variables (CRITICAL)**:
    - Go to **Site Settings > Environment Variables**.
    - Add the following variables:
        - **Key**: `DATABASE_URL`
        - **Value**: Your **pooled** connection string (e.g., `postgres://user:pass@ep-cool-123.us-east-2.aws.neon.tech/neondb?sslmode=require`)
        - **Tip**: Verify it is the pooled URL (usually port 6543) to support connection pooling best practices.
        
        - **Key**: `VITE_NEON_AUTH_URL`
        - **Value**: Your Neon Auth URL (e.g., `https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth`)
        - **Tip**: Get this from your Neon project dashboard > Auth tab

4.  **Deploy**: Click "Deploy Site".

## Troubleshooting
- **404 on Refresh**: Ensure `netlify.toml` is present with the `[[redirects]]` rule.
- **Database Connection Error**: Double check your `DATABASE_URL` variable in Netlify settings.
