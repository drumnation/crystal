#!/usr/bin/env node

/**
 * Quick syntax validation for Kanban components
 * Checks for basic JavaScript/TypeScript syntax errors
 */

const fs = require('fs');
const path = require('path');

const componentFiles = [
  'frontend/src/components/PlanningView.tsx',
  'frontend/src/components/kanban/KanbanBoard.tsx',
  'frontend/src/components/kanban/KanbanColumn.tsx', 
  'frontend/src/components/kanban/TaskCard.tsx',
  'frontend/src/components/kanban/types.ts',
  'frontend/src/components/kanban/index.ts',
  'frontend/src/components/session/ViewTabs.tsx',
  'frontend/src/hooks/useSessionView.ts'
];

console.log('🔍 Validating Kanban component syntax...\n');

let hasErrors = false;

componentFiles.forEach((filePath, index) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`${index + 1}. ❌ MISSING: ${filePath}`);
      hasErrors = true;
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Basic checks
    const checks = [
      { name: 'Has content', test: content.trim().length > 0 },
      { name: 'Balanced braces', test: (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length },
      { name: 'Balanced parens', test: (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length },
      { name: 'No React import errors', test: !content.includes('import React,') || content.includes('import { ') }
    ];
    
    const failed = checks.filter(check => !check.test);
    
    if (failed.length === 0) {
      console.log(`${index + 1}. ✅ VALID: ${filePath}`);
    } else {
      console.log(`${index + 1}. ❌ ERRORS: ${filePath}`);
      failed.forEach(check => console.log(`   - ${check.name}`));
      hasErrors = true;
    }
    
  } catch (error) {
    console.log(`${index + 1}. ❌ ERROR: ${filePath} - ${error.message}`);
    hasErrors = true;
  }
});

console.log('\n📊 Validation Summary:');
if (hasErrors) {
  console.log('❌ Some files have issues');
  process.exit(1);
} else {
  console.log('✅ All files passed basic validation');
  process.exit(0);
}