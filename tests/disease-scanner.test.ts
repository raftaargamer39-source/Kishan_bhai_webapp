/**
 * Disease Scanner & Image Security Unit Tests
 * Kisan Bhai Platform
 */

import { diseaseScannerService } from '../src/server/services/DiseaseScannerService.js';

export async function runDiseaseScannerTests(): Promise<{ passed: boolean; message: string }> {
  console.log('🧪 Testing: Disease Scanner & Image Upload Security...');

  // 1. Test image validation on safe JPEG base64 payload
  const validBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const validation = diseaseScannerService.validateImage(validBase64, 'image/jpeg');

  if (!validation.valid) {
    throw new Error('Image validation failed on valid JPEG');
  }

  // 2. Test analysis output structure
  const result = await diseaseScannerService.analyzeCropImage({
    imageBase64: validBase64,
    cropHint: 'Cotton (Bt)',
    userId: 'usr_farmer_ramesh',
  });

  if (!result || !result.pathogen || !result.recommendedOrganic?.length || !result.recommendedChemical?.length) {
    throw new Error('Disease analysis output missing essential IPM remedy fields');
  }

  if (result.confidenceScore <= 0 || result.confidenceScore > 100) {
    throw new Error(`Invalid confidence score: ${result.confidenceScore}`);
  }

  // 3. Test rejection of unsupported file types
  let rejectedUnsupported = false;
  try {
    diseaseScannerService.validateImage(validBase64, 'application/x-executable');
  } catch (err: any) {
    rejectedUnsupported = true;
  }

  if (!rejectedUnsupported) {
    throw new Error('Security defect: Allowed execution/unsupported MIME upload');
  }

  return { passed: true, message: 'All Disease Scanner & Image Security tests passed.' };
}
