# Testing Guide for Neon Migration

This guide provides step-by-step instructions for testing the migrated RFE application.

## Setup for Testing

### 1. Environment Setup
Ensure you have the following environment variables set:
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth
```

### 2. Database Setup
Run the schema migration if you haven't already:
```bash
psql "$DATABASE_URL" -f database/schema-with-auth.sql
```

### 3. Start Development Server
```bash
npm install
npm run dev
```

The app should be available at http://localhost:3000

## Test Scenarios

### Authentication Tests

#### Test 1: Sign Up with Email/Password
1. Navigate to the app
2. Click "Sign In" → "Sign Up"
3. Enter email, password, and confirm password
4. Submit the form
5. **Expected**: User is created and signed in automatically
6. **Verify**: User sees the dashboard, not an error

#### Test 2: Sign In with Email/Password  
1. Sign out if logged in
2. Navigate to sign-in page
3. Enter existing email and password
4. Click "Sign In"
5. **Expected**: User is signed in and redirected to dashboard
6. **Verify**: Dashboard loads with user's company name in header

#### Test 3: OAuth Sign In (if configured)
1. Sign out if logged in
2. Click "Sign in with Google" or "Sign in with GitHub"
3. Complete OAuth flow
4. **Expected**: User is signed in via OAuth provider
5. **Verify**: User information is displayed in dashboard

#### Test 4: Sign Out
1. Click user profile in header
2. Click "Logout"
3. **Expected**: User is signed out and redirected to sign-in page
4. **Verify**: Accessing protected routes redirects to sign-in

### Data Sync Tests

#### Test 5: Initial Data Load
1. Sign in with a user account
2. **Expected**: App shows loading indicator while syncing
3. **Verify**: 
   - App data loads from database
   - Company profile is populated
   - No console errors

#### Test 6: Create Customer
1. Navigate to Customers section
2. Click "Add Customer"
3. Fill in customer details
4. Save customer
5. **Expected**: Customer is saved to database
6. **Verify**:
   - Customer appears in list immediately
   - Refresh page → customer still appears (persisted)

#### Test 7: Create Estimate
1. Navigate to Calculator
2. Enter building dimensions
3. Select customer
4. Click "Save Estimate"
5. **Expected**: Estimate is saved to database
6. **Verify**:
   - Estimate appears in dashboard
   - Refresh page → estimate still appears

#### Test 8: Update Inventory
1. Navigate to Warehouse
2. Change foam set quantities
3. **Expected**: Changes auto-sync to database
4. **Verify**:
   - Sync indicator shows "Syncing..." then "Synced"
   - Refresh page → quantities are persisted

#### Test 9: Create Work Order
1. Open an estimate
2. Click "Create Work Order"
3. Confirm action
4. **Expected**: 
   - Estimate status changes to "Work Order"
   - Inventory is deducted
5. **Verify**:
   - Work order appears in dashboard
   - Inventory reflects deduction

### Multi-Tenant Tests

#### Test 10: Data Isolation
1. Sign in as User A
2. Create a customer "Test Customer A"
3. Sign out
4. Sign in as User B (different company)
5. Navigate to Customers
6. **Expected**: "Test Customer A" is NOT visible to User B
7. **Verify**: Each company only sees their own data

#### Test 11: Company Information
1. Sign in
2. Check header/profile section
3. **Expected**: Correct company name is displayed
4. **Verify**: Company information matches what's in database

### Crew Dashboard Tests

#### Test 12: Crew Access
1. Ensure a company has crew_pin set in database
2. Sign in with crew role (if crew auth is implemented)
3. **Expected**: Crew dashboard is displayed
4. **Verify**:
   - Only work orders in "In Progress" status shown
   - Can view job details
   - Can complete jobs

#### Test 13: Complete Job
1. Access crew dashboard
2. Select a work order
3. Enter actuals (materials used, hours)
4. Click "Complete Job"
5. **Expected**: Job is marked complete in database
6. **Verify**:
   - Job no longer appears in crew dashboard
   - Admin can see completed status

### Edge Cases

#### Test 14: Offline Mode
1. Sign in
2. Disconnect from internet
3. Try to perform actions
4. **Expected**: App shows offline indicator
5. **Verify**: Local changes are cached (if implemented)

#### Test 15: Session Expiry
1. Sign in
2. Wait for session to expire (or manually expire in database)
3. Try to perform an action
4. **Expected**: App detects expired session
5. **Verify**: User is redirected to sign-in

#### Test 16: Concurrent Edits
1. Sign in on two different browsers/devices
2. Edit the same data on both
3. **Expected**: Last write wins (or conflict resolution)
4. **Verify**: Data consistency is maintained

## Common Issues and Solutions

### Issue: "Unauthorized" errors
**Solution**: Check that:
- Neon Auth URL is correctly configured
- Session token is being sent with requests
- Database has proper foreign key relationships

### Issue: Data not syncing
**Solution**: Check that:
- DATABASE_URL is using pooled connection (port 6543)
- Backend API is running
- Browser console for network errors

### Issue: Cannot sign in
**Solution**: Check that:
- Auth is enabled in Neon Console
- Email/password are correct
- OAuth providers are configured (if using OAuth)

### Issue: "Session expired" on every action
**Solution**: Check that:
- Session expiry is set appropriately in Neon Auth config
- System time is accurate

## Performance Tests

### Load Test: Multiple Users
1. Create multiple user accounts
2. Have all users sign in simultaneously
3. Perform various actions
4. **Expected**: No degradation in performance
5. **Verify**: Response times remain acceptable

### Load Test: Large Dataset
1. Create 100+ customers, estimates, etc.
2. Load dashboard
3. **Expected**: Dashboard loads within reasonable time
4. **Verify**: Pagination works if implemented

## Security Tests

### Test 17: SQL Injection
1. Try entering SQL in form fields
2. **Expected**: App sanitizes input
3. **Verify**: No SQL errors, no data leakage

### Test 18: XSS Protection
1. Try entering `<script>alert('xss')</script>` in text fields
2. **Expected**: Script is escaped
3. **Verify**: No alert popup appears

### Test 19: Session Token Security
1. Sign in
2. Inspect network requests
3. **Expected**: Session tokens in Authorization header, not URLs
4. **Verify**: Tokens are not exposed in logs

## Automated Testing (Future)

Consider adding:
- Unit tests for hooks and utilities
- Integration tests for API endpoints
- E2E tests with Playwright or Cypress
- Performance tests with k6 or Artillery

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console errors
5. Network tab screenshots
6. Environment (local dev vs production)

## Success Criteria

Migration is complete when:
- ✅ All authentication flows work
- ✅ Data syncs bidirectionally
- ✅ Multi-tenant isolation is verified
- ✅ No console errors in normal operation
- ✅ Build completes without errors
- ✅ Performance is acceptable
- ✅ Security tests pass
