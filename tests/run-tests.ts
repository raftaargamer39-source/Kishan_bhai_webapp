/**
 * Kisan Bhai Production Automated Test Runner
 * Executes unit, integration, and security verification tests
 */

import { runAuthTests } from './auth.test.js';
import { runRbacTests } from './rbac.test.js';
import { runCropAdvisorTests } from './crop-advisor.test.js';
import { runWeatherTests } from './weather.test.js';
import { runDiseaseScannerTests } from './disease-scanner.test.js';

async function main() {
  console.log('===========================================================');
  console.log('🌱 KISAN BHAI AUTOMATED PRODUCTION TEST SUITE');
  console.log('===========================================================');

  const testSuites = [
    { name: 'Authentication & Security', runner: runAuthTests },
    { name: 'Role-Based Access & IDOR', runner: runRbacTests },
    { name: 'Crop Advisor & Financial Mathematics', runner: runCropAdvisorTests },
    { name: 'Weather Service & Agro-Advisories', runner: runWeatherTests },
    { name: 'Disease Scanner & Image Security', runner: runDiseaseScannerTests },
  ];

  let passedCount = 0;
  const startTime = Date.now();

  for (const suite of testSuites) {
    try {
      const res = await suite.runner();
      console.log(`✅ [PASS] ${suite.name}: ${res.message}`);
      passedCount++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${suite.name}: ${err.message}`);
      console.error(err);
      process.exit(1);
    }
  }

  const durationMs = Date.now() - startTime;
  console.log('===========================================================');
  console.log(`🎉 ALL ${passedCount}/${testSuites.length} TEST SUITES PASSED in ${durationMs}ms`);
  console.log('===========================================================');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
