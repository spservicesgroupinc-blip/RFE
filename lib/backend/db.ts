import { neon } from '@neondatabase/serverless';

/**
 * Backend database client for server-side operations
 * This should only be used in server-side code (e.g., API routes, server actions)
 * Never expose the DATABASE_URL to the client
 */

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon serverless client
export const sql = neon(databaseUrl);

/**
 * Helper function to get user by session token
 * This assumes Neon Auth is properly configured
 */
export async function getUserFromSession(sessionToken: string) {
  try {
    const result = await sql`
      SELECT u.id, u.name, u.email, u.emailVerified, u.image, u.createdAt, u.updatedAt
      FROM user u
      INNER JOIN session s ON s.userId = u.id
      WHERE s.token = ${sessionToken}
      AND s.expiresAt > NOW()
    `;
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching user from session:', error);
    return null;
  }
}

/**
 * Helper function to verify user has access to a company
 * For multi-tenant applications
 */
export async function verifyCompanyAccess(userId: string, companyId: string) {
  try {
    const result = await sql`
      SELECT 1
      FROM users
      WHERE id = ${userId}
      AND company_id = ${companyId}
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error('Error verifying company access:', error);
    return false;
  }
}

export default sql;
