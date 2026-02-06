import api from '../netlify/functions/api';
import dotenv from 'dotenv';

dotenv.config();

// Mock Request class for testing since we are running in Node, not Web env totally
class MockRequest {
    method: string;
    body: any;

    constructor(method: string, body: any) {
        this.method = method;
        this.body = body;
    }

    async json() {
        return this.body;
    }
}

async function testAuth() {
    console.log('--- Testing SIGNUP ---');
    const username = `user_${Date.now()}`; // Unique username
    const signupPayload = {
        action: 'SIGNUP',
        payload: {
            username: username,
            password: 'password123',
            companyName: 'Test Corp',
            email: 'test@example.com'
        }
    };

    // @ts-ignore
    const signupReq = new MockRequest('POST', signupPayload);
    // @ts-ignore
    const signupRes = await api(signupReq);
    const signupData = await signupRes.json();
    console.log('Signup Response:', JSON.stringify(signupData, null, 2));

    if (signupData.status !== 'success') {
        console.error('Signup Failed');
        process.exit(1);
    }

    console.log('--- Testing LOGIN ---');
    const loginPayload = {
        action: 'LOGIN',
        payload: {
            username: username,
            password: 'password123'
        }
    };

    // @ts-ignore
    const loginReq = new MockRequest('POST', loginPayload);
    // @ts-ignore
    const loginRes = await api(loginReq);
    const loginData = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.status === 'success' && loginData.data.token) {
        console.log('Login Verification PASSED');
    } else {
        console.error('Login Verification FAILED');
        process.exit(1);
    }
}

testAuth();
