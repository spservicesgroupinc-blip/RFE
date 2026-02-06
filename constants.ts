
// Web App URL from Google Apps Script Deployment
export const GOOGLE_SCRIPT_URL: string ='https://script.google.com/macros/s/AKfycbz9x1x_Zzt50XQxm4aQvZKmROgzHM7Sa8eJKPUmkY9tc5XzYH8yGoQb6kWxNJ6kj5Hs/exec';

// API Provider Configuration
// Toggle PROVIDER to 'NEON' when the Node.js/Neon backend is ready.
export const API_CONFIG = {
    PROVIDER: 'GAS' as 'GAS' | 'NEON', 
    NEON_URL: 'http://localhost:3000/api', // Update this with your production Neon backend URL
};
