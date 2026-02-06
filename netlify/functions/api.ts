import { sql } from "../../database/client";

export default async (req: Request) => {
    // CORS handling for local dev or cross-origin if needed
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const body = await req.json();
        const { action, payload } = body;

        console.log(`[API] Processing action: ${action}`);

        let data;

        // TODO: Add proper Authentication middleware here to extract company_id 
        // and enforce multi-tenancy.

        switch (action) {
            case 'TEST':
                // neon sql tag returns array of rows directly
                const result = await sql`SELECT NOW() as time`;
                data = result[0];
                break;

            // Example: Fetch Estimates
            // case 'FETCH_ESTIMATES':
            //    const { companyId } = payload;
            //    // Tagged template automatically handles parameters securely
            //    const records = await sql`SELECT * FROM estimates WHERE company_id = ${companyId}`;
            //    data = records;
            //    break;

            default:
                return new Response(JSON.stringify({ status: 'error', message: `Unknown action: ${action}` }), {
                    headers: { "Content-Type": "application/json" }
                });
        }

        return new Response(JSON.stringify({ status: 'success', data }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ status: 'error', message: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/*"
};
