/**
 * Authentication & Security Unit Tests
 * Kisan Bhai Platform
 */

import { authService } from '../src/server/services/AuthService.js';
import { generateToken } from '../src/server/middleware/auth.js';
import jwt from 'jsonwebtoken';
import { config } from '../src/server/core/config.js';

export async function runAuthTests(): Promise<{ passed: boolean; message: string }> {
  console.log('🧪 Testing: Authentication & JWT Security...');

  // Test 1: Register User
  const testEmail = `test_farmer_${Date.now()}@kishanbhai.in`;
  const { user, token } = await authService.register({
    email: testEmail,
    fullName: 'Test Farmer Singh',
    role: 'FARMER',
    village: 'Punjabpur',
    state: 'Punjab',
    farmSizeAcres: 5.0,
  });

  if (!user || user.email !== testEmail) {
    throw new Error(`Registration failed: Expected email ${testEmail}, got ${user?.email}`);
  }

  // Test 2: Verify Token Decodability & Signature
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  if (decoded.id !== user.id || decoded.role !== 'FARMER') {
    throw new Error('JWT Verification failed: Payload mismatch');
  }

  // Test 3: Login User
  const loginRes = await authService.login({ identifier: testEmail });
  if (loginRes.user.id !== user.id) {
    throw new Error('Login failed: Did not retrieve registered user');
  }

  // Test 4: Duplicate Registration Prevention
  let caughtDuplicate = false;
  try {
    await authService.register({
      email: testEmail,
      fullName: 'Duplicate Farmer',
      role: 'FARMER',
      village: 'Punjabpur',
      state: 'Punjab',
    });
  } catch (err: any) {
    if (err.statusCode === 409 || err.code === 'AUTH_USER_EXISTS') {
      caughtDuplicate = true;
    }
  }

  if (!caughtDuplicate) {
    throw new Error('Security defect: Allowed duplicate email registration without error');
  }

  return { passed: true, message: 'All Auth & Security tests passed.' };
}
