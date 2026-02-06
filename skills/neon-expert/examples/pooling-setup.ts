import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Neon serverless driver requires WebSocket for serverless environments (Edge functions)
neonConfig.webSocketConstructor = ws;

/**
 * Returns a connection pool optimized for Neon.
 * 
 * @param connectionString The 'pooled' connection string from Neon dashboard (port 6543)
 */
export const getDbPool = (connectionString: string) => {
    if (!connectionString) {
        throw new Error('DATABASE_URL is missing');
    }

    // Best practice: Use a pool for server-side logic (e.g. Next.js API routes)
    // Re-use this instance across hot reloads in dev
    const pool = new Pool({
        connectionString,
        max: 10, // Max clients in the pool
        idleTimeoutMillis: 30000
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

    return pool;
};

/**
 * Helper to distinguish Direct vs Pooled URLs
 */
export const isPooledUrl = (url: string) => {
    return url.includes('pooler') || url.includes('pgbouncer') || url.includes(':6543');
}
