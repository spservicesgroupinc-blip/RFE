/**
 * Example Backend API Handler
 * 
 * This file demonstrates how to create authenticated API endpoints
 * using Neon Auth and Neon Serverless in a Netlify Function or similar environment.
 */

import { sql, getUserFromSession } from './db';

/**
 * Example: Get all customers for the authenticated user's company
 */
export async function getCustomers(sessionToken: string) {
  // Verify session and get user
  const user = await getUserFromSession(sessionToken);
  
  if (!user) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  try {
    // Get the user's company
    const companies = await sql`
      SELECT id FROM companies WHERE user_id = ${user.id} LIMIT 1
    `;

    if (companies.length === 0) {
      return {
        error: 'Company not found',
        status: 404,
      };
    }

    const companyId = companies[0].id;

    // Get all customers for this company
    const customers = await sql`
      SELECT * FROM customers 
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
    `;

    return {
      data: customers,
      status: 200,
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}

/**
 * Example: Create a new customer
 */
export async function createCustomer(
  sessionToken: string,
  customerData: {
    name: string;
    email?: string;
    status?: string;
    data?: Record<string, any>;
  }
) {
  const user = await getUserFromSession(sessionToken);
  
  if (!user) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  try {
    const companies = await sql`
      SELECT id FROM companies WHERE user_id = ${user.id} LIMIT 1
    `;

    if (companies.length === 0) {
      return {
        error: 'Company not found',
        status: 404,
      };
    }

    const companyId = companies[0].id;

    const result = await sql`
      INSERT INTO customers (company_id, name, email, status, data)
      VALUES (
        ${companyId},
        ${customerData.name},
        ${customerData.email || null},
        ${customerData.status || 'Active'},
        ${JSON.stringify(customerData.data || {})}
      )
      RETURNING *
    `;

    return {
      data: result[0],
      status: 201,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}

/**
 * Example: Get estimates with customer information
 */
export async function getEstimatesWithCustomers(sessionToken: string) {
  const user = await getUserFromSession(sessionToken);
  
  if (!user) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  try {
    const companies = await sql`
      SELECT id FROM companies WHERE user_id = ${user.id} LIMIT 1
    `;

    if (companies.length === 0) {
      return {
        error: 'Company not found',
        status: 404,
      };
    }

    const companyId = companies[0].id;

    const estimates = await sql`
      SELECT 
        e.*,
        c.name as customer_name,
        c.email as customer_email
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      WHERE e.company_id = ${companyId}
      ORDER BY e.created_at DESC
    `;

    return {
      data: estimates,
      status: 200,
    };
  } catch (error) {
    console.error('Error fetching estimates:', error);
    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}

/**
 * Example: Update inventory quantity
 */
export async function updateInventory(
  sessionToken: string,
  itemId: string,
  quantity: number
) {
  const user = await getUserFromSession(sessionToken);
  
  if (!user) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  try {
    const companies = await sql`
      SELECT id FROM companies WHERE user_id = ${user.id} LIMIT 1
    `;

    if (companies.length === 0) {
      return {
        error: 'Company not found',
        status: 404,
      };
    }

    const companyId = companies[0].id;

    // Verify the inventory item belongs to this company
    const verification = await sql`
      SELECT id FROM inventory 
      WHERE id = ${itemId} AND company_id = ${companyId}
    `;

    if (verification.length === 0) {
      return {
        error: 'Inventory item not found or access denied',
        status: 404,
      };
    }

    const result = await sql`
      UPDATE inventory 
      SET quantity = ${quantity}
      WHERE id = ${itemId}
      RETURNING *
    `;

    return {
      data: result[0],
      status: 200,
    };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}

/**
 * Helper: Extract session token from Authorization header
 */
export function getSessionTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Example Netlify Function Handler
 * 
 * Usage in netlify/functions/api-customers.ts:
 */
/*
import { Handler } from '@netlify/functions';
import { getCustomers, createCustomer, getSessionTokenFromHeader } from '../../lib/backend/api-examples';

export const handler: Handler = async (event) => {
  const sessionToken = getSessionTokenFromHeader(event.headers.authorization);
  
  if (!sessionToken) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  if (event.httpMethod === 'GET') {
    const result = await getCustomers(sessionToken);
    return {
      statusCode: result.status,
      body: JSON.stringify(result.data || { error: result.error }),
    };
  }

  if (event.httpMethod === 'POST') {
    const customerData = JSON.parse(event.body || '{}');
    const result = await createCustomer(sessionToken, customerData);
    return {
      statusCode: result.status,
      body: JSON.stringify(result.data || { error: result.error }),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
*/
