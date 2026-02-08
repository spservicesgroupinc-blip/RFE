
import { API_CONFIG } from '../constants';
import { CalculatorState, EstimateRecord, UserSession } from '../types';
import { authClient } from '../lib/auth-client';

interface ApiResponse {
    status: 'success' | 'error';
    data?: any;
    message?: string;
}

/**
 * Helper for making robust fetch requests to Neon backend
 * Includes retry logic and automatic session token injection
 */
const apiRequest = async (payload: any, retries = 2): Promise<ApiResponse> => {
    if (!API_CONFIG.NEON_URL) {
        return { status: 'error', message: 'API not configured' };
    }

    try {
        // Get current session token from Neon Auth
        const session = authClient.useSession?.() ?? { data: null };
        const sessionToken = session.data?.session?.token;

        const response = await fetch(API_CONFIG.NEON_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                ...(sessionToken && { "Authorization": `Bearer ${sessionToken}` })
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        return result;
    } catch (error: any) {
        if (retries > 0) {
            console.warn(`API Request Failed, retrying... (${retries} left)`);
            await new Promise(res => setTimeout(res, 1000)); // Wait 1s before retry
            return apiRequest(payload, retries - 1);
        }
        console.error("API Request Failed:", error);
        return { status: 'error', message: error.message || "Network request failed" };
    }
};

/**
 * Fetches the full application state from Neon database
 */
export const syncDown = async (): Promise<Partial<CalculatorState> | null> => {
    const result = await apiRequest({ action: 'SYNC_DOWN', payload: {} });

    if (result.status === 'success') {
        return result.data;
    } else {
        console.error("Sync Down Error:", result.message);
        return null;
    }
};

/**
 * Pushes the full application state to Neon database
 */
export const syncUp = async (state: CalculatorState): Promise<boolean> => {
    const result = await apiRequest({ action: 'SYNC_UP', payload: { state } });
    return result.status === 'success';
};

/**
 * Marks job as paid and triggers P&L calculation on backend
 */
export const markJobPaid = async (estimateId: string): Promise<{ success: boolean, estimate?: EstimateRecord }> => {
    const result = await apiRequest({ action: 'MARK_JOB_PAID', payload: { estimateId } });
    return { success: result.status === 'success', estimate: result.data?.estimate };
};

/**
 * Creates a work order record in database
 */
export const createWorkOrderSheet = async (estimateData: EstimateRecord): Promise<string | null> => {
    const result = await apiRequest({ action: 'CREATE_WORK_ORDER', payload: { estimateData } });
    if (result.status === 'success') return result.data.url;
    console.error("Create WO Error:", result.message);
    return null;
};

/**
 * Logs crew time for a work order
 */
export const logCrewTime = async (workOrderUrl: string, startTime: string, endTime: string | null, user: string): Promise<boolean> => {
    const result = await apiRequest({ action: 'LOG_TIME', payload: { workOrderUrl, startTime, endTime, user } });
    return result.status === 'success';
};

/**
 * Marks job as complete and syncs inventory
 */
export const completeJob = async (estimateId: string, actuals: any): Promise<boolean> => {
    const result = await apiRequest({ action: 'COMPLETE_JOB', payload: { estimateId, actuals } });
    return result.status === 'success';
};

/**
 * Deletes an estimate from database
 */
export const deleteEstimate = async (estimateId: string): Promise<boolean> => {
    const result = await apiRequest({ action: 'DELETE_ESTIMATE', payload: { estimateId } });
    return result.status === 'success';
};

/**
 * Uploads a PDF to storage (placeholder for future implementation)
 */
export const savePdfToDrive = async (fileName: string, base64Data: string, estimateId: string | undefined) => {
    const result = await apiRequest({ action: 'SAVE_PDF', payload: { fileName, base64Data, estimateId } });
    return result.status === 'success' ? result.data.url : null;
};

/**
 * Submits lead for trial access
 */
export const submitTrial = async (name: string, email: string, phone: string): Promise<boolean> => {
    const result = await apiRequest({ action: 'SUBMIT_TRIAL', payload: { name, email, phone } });
    return result.status === 'success';
};
