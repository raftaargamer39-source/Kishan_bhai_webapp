/**
 * Role-Based Access Control & IDOR Unit Tests
 * Kisan Bhai Platform
 */

import { verifyOwnership, AuthenticatedUser } from '../src/server/middleware/auth.js';

export async function runRbacTests(): Promise<{ passed: boolean; message: string }> {
  console.log('🧪 Testing: RBAC & IDOR Protections...');

  const farmerUser: AuthenticatedUser = {
    id: 'usr_farmer_123',
    email: 'farmer@kishanbhai.in',
    role: 'FARMER',
    fullName: 'Farmer Dev',
    village: 'Anandpur',
    state: 'Gujarat',
  };

  const otherFarmerUser: AuthenticatedUser = {
    id: 'usr_farmer_999',
    email: 'other@kishanbhai.in',
    role: 'FARMER',
    fullName: 'Other Dev',
    village: 'Gondal',
    state: 'Gujarat',
  };

  const adminUser: AuthenticatedUser = {
    id: 'usr_admin_001',
    email: 'admin@kishanbhai.in',
    role: 'ADMIN',
    fullName: 'Platform Admin',
    village: 'Central',
    state: 'Delhi',
  };

  // Test 1: Farmer accesses own resource
  const canAccessOwn = verifyOwnership('usr_farmer_123', farmerUser);
  if (!canAccessOwn) {
    throw new Error('IDOR Check Failed: Farmer could not access their own resource');
  }

  // Test 2: Farmer attempts to access another farmer's resource (IDOR Attack)
  const canAccessOther = verifyOwnership('usr_farmer_999', farmerUser);
  if (canAccessOther) {
    throw new Error('IDOR Check Failed: Farmer unauthorizedly granted access to another farmer resource');
  }

  // Test 3: Admin accesses resource for governance
  const canAdminAccess = verifyOwnership('usr_farmer_123', adminUser);
  if (!canAdminAccess) {
    throw new Error('Admin Authorization Failed: Admin denied access for oversight');
  }

  return { passed: true, message: 'All RBAC & IDOR tests passed.' };
}
