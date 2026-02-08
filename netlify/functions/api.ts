import { sql, getUserFromSession as getUser } from "../../lib/backend/db";

/**
 * Helper to extract session token from Authorization header
 */
function getSessionToken(req: Request): string | null {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Get user and company from Neon Auth session
 */
async function getUserFromSession(sessionToken: string) {
    try {
        const result = await sql`
            SELECT 
                u.id as user_id,
                u.email,
                u.name,
                c.id as company_id,
                c.company_name,
                c.role,
                c.crew_pin
            FROM "user" u
            INNER JOIN session s ON s."userId" = u.id
            INNER JOIN companies c ON c.user_id = u.id
            WHERE s.token = ${sessionToken}
            AND s."expiresAt" > NOW()
        `;
        
        return result[0] || null;
    } catch (error) {
        console.error('Error fetching user from session:', error);
        return null;
    }
}

export default async (req: Request) => {
    // CORS handling for local dev or cross-origin if needed
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

        switch (action) {
            case 'TEST':
                const result = await sql`SELECT NOW() as time`;
                data = result[0];
                break;

            case 'SUBMIT_TRIAL':
                // Log trial submission to leads table
                await sql`
                    INSERT INTO leads (name, email, phone, data)
                    VALUES (${payload.name}, ${payload.email}, ${payload.phone || ''}, ${JSON.stringify(payload)})
                `;
                data = { success: true };
                break;

            case 'SYNC_DOWN':
                const sessionToken = getSessionToken(req);
                if (!sessionToken) throw new Error("Unauthorized");
                data = await handleSyncDown(sessionToken);
                break;

            case 'SYNC_UP':
                const syncToken = getSessionToken(req);
                if (!syncToken) throw new Error("Unauthorized");
                data = await handleSyncUp(payload, syncToken);
                break;

            case 'DELETE_ESTIMATE':
                const deleteToken = getSessionToken(req);
                if (!deleteToken) throw new Error("Unauthorized");
                await handleDeleteEstimate(payload, deleteToken);
                data = { success: true };
                break;

            case 'MARK_JOB_PAID':
                const paidToken = getSessionToken(req);
                if (!paidToken) throw new Error("Unauthorized");
                data = await handleMarkJobPaid(payload, paidToken);
                break;

            case 'CREATE_WORK_ORDER':
                const woToken = getSessionToken(req);
                if (!woToken) throw new Error("Unauthorized");
                data = await handleCreateWorkOrder(payload, woToken);
                break;

            case 'COMPLETE_JOB':
                const completeToken = getSessionToken(req);
                if (!completeToken) throw new Error("Unauthorized");
                data = await handleCompleteJob(payload, completeToken);
                break;

            case 'SAVE_PDF':
                // Stub for now - requires Storage (S3/R2/Blob)
                // We return a success status to prevent frontend crashes.
                console.log(`[API] SAVE_PDF called for ${payload.fileName}`);
                data = { url: "#saved-locally-only", message: "PDF Storage not yet configured" };
                break;

            case 'LOG_TIME':
                // Stub for now - requires Schema update for work_logs
                console.log(`[API] LOG_TIME called: ${JSON.stringify(payload)}`);
                data = { success: true };
                break;

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


// --- Action Handlers ---

async function handleSyncDown(sessionToken: string) {
    const user = await getUserFromSession(sessionToken);
    if (!user) throw new Error("Unauthorized");
    
    const companyId = user.company_id;

    // Fetch all data in parallel
    const [settingsRows, invRows, estRows, custRows, logRows] = await Promise.all([
        sql`SELECT * FROM settings WHERE company_id = ${companyId}`,
        sql`SELECT * FROM inventory WHERE company_id = ${companyId}`,
        sql`SELECT * FROM estimates WHERE company_id = ${companyId}`,
        sql`SELECT * FROM customers WHERE company_id = ${companyId}`,
        sql`SELECT * FROM material_logs WHERE company_id = ${companyId}`
    ]);

    // Transform Settings
    const settings: any = {};
    settingsRows.forEach((r: any) => {
        settings[r.key] = r.value;
    });

    // Transform Inventory/Warehouse
    const foamCounts = settings['warehouse_counts'] || { openCellSets: 0, closedCellSets: 0 };
    const warehouse = {
        openCellSets: foamCounts.openCellSets || 0,
        closedCellSets: foamCounts.closedCellSets || 0,
        items: invRows.map((r: any) => ({ ...r.data, id: r.id, name: r.name, quantity: r.quantity }))
    };

    // Transform Estimates
    const savedEstimates = estRows.map((r: any) => ({
        ...r.data,
        id: r.id,
        status: r.status,
        executionStatus: r.execution_status,
        totalValue: r.total_value,
        date: r.date
    }));

    // Transform Customers
    const customers = custRows.map((r: any) => ({
        ...r.data,
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status
    }));

    // Transform Logs
    const materialLogs = logRows.map((r: any) => ({
        ...r.data,
        id: r.id,
        date: r.date,
        jobId: r.job_id
    }));

    const lifetimeUsage = settings['lifetime_usage'] || { openCell: 0, closedCell: 0 };
    const equipment: any[] = [];

    return {
        ...settings,
        warehouse,
        lifetimeUsage,
        equipment,
        savedEstimates,
        customers,
        materialLogs,
        // Include user session information
        userSession: {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            company_id: user.company_id,
            company_name: user.company_name,
            role: user.role,
            crew_pin: user.crew_pin
        }
    };
}

async function handleSyncUp(payload: any, sessionToken: string) {
    const user = await getUserFromSession(sessionToken);
    if (!user) throw new Error("Unauthorized");
    
    const companyId = user.company_id;
    const { state } = payload;

    // 1. Settings (Profile, Costs, etc)
    const settingsKeys = ['companyProfile', 'yields', 'costs', 'expenses', 'jobNotes', 'purchaseOrders', 'sqFtRates', 'pricingMode', 'lifetimeUsage'];
    const settingsUpdates: any[] = [];

    settingsKeys.forEach(key => {
        if (state[key] !== undefined) {
            settingsUpdates.push({ key, value: state[key] });
        }
    });

    if (state.warehouse) {
        settingsUpdates.push({
            key: 'warehouse_counts',
            value: { openCellSets: state.warehouse.openCellSets, closedCellSets: state.warehouse.closedCellSets }
        });
    }

    if (settingsUpdates.length > 0) {
        for (const s of settingsUpdates) {
            // Upsert Settings
            await sql`
                INSERT INTO settings (company_id, key, value)
                VALUES (${companyId}, ${s.key}, ${JSON.stringify(s.value)})
                ON CONFLICT (company_id, key) 
                DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
             `;
        }
    }

    // 2. Inventory (Replace All strategy as per legacy)
    if (state.warehouse && state.warehouse.items && Array.isArray(state.warehouse.items)) {
        await sql`DELETE FROM inventory WHERE company_id = ${companyId}`;
        for (const item of state.warehouse.items) {
            await sql`
                INSERT INTO inventory (company_id, name, quantity, data)
                VALUES (${companyId}, ${item.name || "Item"}, ${item.quantity || 0}, ${JSON.stringify(item)})
             `;
        }
    }

    // 3. Customers (Replace All strategy)
    if (state.customers && Array.isArray(state.customers)) {
        await sql`DELETE FROM customers WHERE company_id = ${companyId}`;
        for (const c of state.customers) {
            await sql`
                INSERT INTO customers (company_id, name, email, status, data)
                VALUES (${companyId}, ${c.name || ""}, ${c.email || ""}, ${c.status || "Active"}, ${JSON.stringify(c)})
             `;
        }
    }

    // 4. Estimates (Reconciliation Logic)
    if (state.savedEstimates && Array.isArray(state.savedEstimates)) {
        await reconcileEstimates(companyId, state.savedEstimates);
    }

    return { synced: true };
}

async function reconcileEstimates(companyId: string, incomingEstimates: any[]) {
    console.error(`[DEBUG] Reconciling ${incomingEstimates.length} estimates for ${companyId}`);
    // Fetch existing
    const existingRows = await sql`SELECT * FROM estimates WHERE company_id = ${companyId}`;
    console.error(`[DEBUG] Found ${existingRows.length} existing estimates in DB`);

    const dbMap = new Map();
    existingRows.forEach((r: any) => {
        const obj = { ...r.data, id: r.id };
        dbMap.set(r.id, obj);
    });

    for (const incoming of incomingEstimates) {
        if (!incoming.id) {
            console.error(`[DEBUG] Skipping estimate without ID`);
            continue;
        }

        console.error(`[DEBUG] Processing estimate ${incoming.id}`);
        let finalEst = incoming;
        const existing = dbMap.get(incoming.id);

        if (existing) {
            console.error(`[DEBUG] Merging existing estimate ${incoming.id}`);
            // Merge Logic mimicking GAS
            if (existing.executionStatus === 'Completed' && incoming.executionStatus !== 'Completed') {
                finalEst.executionStatus = 'Completed';
                finalEst.actuals = existing.actuals;
            }
            if (existing.executionStatus === 'Completed' && incoming.executionStatus === 'Completed') {
                const existingDate = new Date(existing.actuals?.completionDate || 0).getTime();
                const incomingDate = new Date(incoming.actuals?.completionDate || 0).getTime();
                if (existingDate > incomingDate) finalEst.actuals = existing.actuals;
            }
            if (existing.executionStatus === 'In Progress' && incoming.executionStatus === 'Not Started') {
                finalEst.executionStatus = 'In Progress';
            }
            if (existing.status === 'Paid' && incoming.status !== 'Paid') {
                finalEst.status = 'Paid';
            }
            // Preserve server-side generated fields if missing in incoming
            if (existing.pdfLink && !incoming.pdfLink) finalEst.pdfLink = existing.pdfLink;
            if (existing.workOrderSheetUrl && !incoming.workOrderSheetUrl) finalEst.workOrderSheetUrl = existing.workOrderSheetUrl;
        }

        // Upsert
        try {
            await sql`
                INSERT INTO estimates (id, company_id, customer_id, date, status, execution_status, total_value, data)
                VALUES (
                    ${finalEst.id}, 
                    ${companyId}, 
                    NULL, 
                    ${finalEst.date ? new Date(finalEst.date) : null}, 
                    ${finalEst.status || 'Draft'}, 
                    ${finalEst.executionStatus || 'Not Started'}, 
                    ${finalEst.totalValue || 0}, 
                    ${JSON.stringify(finalEst)}
                )
                ON CONFLICT (id) DO UPDATE SET
                    date = EXCLUDED.date,
                    status = EXCLUDED.status,
                    execution_status = EXCLUDED.execution_status,
                    total_value = EXCLUDED.total_value,
                    data = EXCLUDED.data,
                    updated_at = NOW()
            `;
            console.error(`[DEBUG] Upserted estimate ${finalEst.id} successfully`);
        } catch (err: any) {
            console.error(`[DEBUG] Error upserting estimate ${finalEst.id}:`, err);
        }
    }
}

export const config = {
    path: "/api/*"
};


async function handleDeleteEstimate(p: any, sessionToken: string) {
    const user = await getUserFromSession(sessionToken);
    if (!user) throw new Error("Unauthorized");
    
    const { estimateId } = p;
    // Verify ownership
    await sql`DELETE FROM estimates WHERE id = ${estimateId} AND company_id = ${user.company_id}`;
}

async function handleMarkJobPaid(p: any, sessionToken: string) {
    const user = await getUserFromSession(sessionToken);
    if (!user) throw new Error("Unauthorized");
    
    const { estimateId } = p;

    // Fetch estimate
    const rows = await sql`SELECT * FROM estimates WHERE id = ${estimateId} AND company_id = ${user.company_id}`;
    if (rows.length === 0) throw new Error("Estimate not found");

    let est = rows[0];
    let data = est.data;

    // Update status
    data.status = 'Paid';

    await sql`
        UPDATE estimates 
        SET status = 'Paid', 
            data = ${JSON.stringify(data)},
            updated_at = NOW()
        WHERE id = ${estimateId}
    `;

    return { success: true, estimate: { ...data, id: estimateId, status: 'Paid' } };
}

async function handleCreateWorkOrder(p: any, sessionToken: string) {
    const user = await getUserFromSession(sessionToken);
    if (!user) throw new Error("Unauthorized");
    
    // Placeholder for work order creation
    return { url: "https://placeholder-work-order-url.com" };
}

async function handleCompleteJob(p: any, sessionToken: string) {
    const user = await getUserFromSession(sessionToken);
    if (!user) throw new Error("Unauthorized");
    
    const { estimateId, actuals } = p;

    const rows = await sql`SELECT * FROM estimates WHERE id = ${estimateId} AND company_id = ${user.company_id}`;
    if (rows.length === 0) throw new Error("Estimate not found");

    let est = rows[0];
    let data = est.data;

    data.executionStatus = 'Completed';
    data.actuals = actuals;

    await sql`
        UPDATE estimates 
        SET execution_status = 'Completed', 
            data = ${JSON.stringify(data)},
            updated_at = NOW()
        WHERE id = ${estimateId}
    `;

    return { success: true };
}
