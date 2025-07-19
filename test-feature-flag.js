#!/usr/bin/env node

/**
 * Feature Flag Test Script
 * Tests the ENABLE_KANBAN environment variable logic
 */

// Simulate the environment variable checks used in the components
function checkKanbanEnabled(env) {
  return env.VITE_ENABLE_KANBAN === 'true' || 
         env.ENABLE_KANBAN === 'true' ||
         env.ENABLE_KANBAN === true;
}

// Test cases
const testCases = [
  { env: { VITE_ENABLE_KANBAN: 'true' }, expected: true, description: 'VITE_ENABLE_KANBAN=true' },
  { env: { ENABLE_KANBAN: 'true' }, expected: true, description: 'ENABLE_KANBAN=true' },
  { env: { VITE_ENABLE_KANBAN: 'false' }, expected: false, description: 'VITE_ENABLE_KANBAN=false' },
  { env: { ENABLE_KANBAN: 'false' }, expected: false, description: 'ENABLE_KANBAN=false' },
  { env: {}, expected: false, description: 'No environment variables set' },
  { env: { OTHER_VAR: 'true' }, expected: false, description: 'Unrelated environment variable' },
];

console.log('🧪 Testing Kanban Feature Flag Logic\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = checkKanbanEnabled(testCase.env);
  const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${index + 1}. ${testCase.description}: ${status}`);
  console.log(`   Expected: ${testCase.expected}, Got: ${result}\n`);
  
  if (result === testCase.expected) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All feature flag tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}