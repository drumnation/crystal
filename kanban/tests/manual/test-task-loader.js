const fs = require('fs');
const path = require('path');

// Simple test to verify our task files and JSON parsing without Electron

console.log('🧪 Testing Task Loader Logic (Node.js simulation)');
console.log('='.repeat(50));

const tasksDir = path.join(__dirname, 'tasks');

// Test 1: Check if tasks directory exists
console.log('\n📂 Test 1: Directory Listing');
try {
  const files = fs.readdirSync(tasksDir);
  console.log(`✅ Tasks directory found with ${files.length} files:`);
  files.forEach(file => {
    const stats = fs.statSync(path.join(tasksDir, file));
    console.log(`  - ${file} (${stats.size} bytes)`);
  });
  
  // Filter JSON files
  const jsonFiles = files.filter(file => file.toLowerCase().endsWith('.json'));
  console.log(`📋 Found ${jsonFiles.length} JSON files:`, jsonFiles);
  
  // Test 2: Read and parse each JSON file
  console.log('\n📖 Test 2: File Reading and JSON Parsing');
  const tasks = [];
  const errors = [];
  
  jsonFiles.forEach(file => {
    try {
      const filePath = path.join(tasksDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`\n📄 Reading ${file}:`);
      console.log(`  Raw content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
      
      let parsed;
      try {
        parsed = JSON.parse(content);
        console.log(`  ✅ JSON parsed successfully`);
      } catch (parseError) {
        console.log(`  ❌ JSON parse error: ${parseError.message}`);
        errors.push(`${file}: Invalid JSON - ${parseError.message}`);
        return;
      }
      
      // Handle arrays vs single objects
      const tasksToProcess = Array.isArray(parsed) ? parsed : [parsed];
      console.log(`  📊 Processing ${tasksToProcess.length} task(s)`);
      
      tasksToProcess.forEach((task, index) => {
        // Validate task structure
        const required = ['id', 'title', 'status', 'priority', 'createdAt', 'updatedAt'];
        const missing = required.filter(field => !task[field]);
        
        if (missing.length > 0) {
          const errorMsg = `Missing required fields: ${missing.join(', ')}`;
          console.log(`    ❌ Task ${index + 1}: ${errorMsg}`);
          errors.push(`${file} task ${index + 1}: ${errorMsg}`);
        } else {
          console.log(`    ✅ Task ${index + 1}: ${task.title} (${task.status}, ${task.priority})`);
          tasks.push({
            ...task,
            _source: file
          });
        }
      });
      
    } catch (readError) {
      console.log(`  ❌ File read error: ${readError.message}`);
      errors.push(`${file}: File read error - ${readError.message}`);
    }
  });
  
  // Test 3: Summary
  console.log('\n📊 Test 3: Summary');
  console.log(`✅ Valid tasks loaded: ${tasks.length}`);
  console.log(`⚠️  Errors encountered: ${errors.length}`);
  
  if (tasks.length > 0) {
    console.log('\n📋 Valid Tasks:');
    tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. [${task.status.toUpperCase()}] ${task.title}`);
      console.log(`     Priority: ${task.priority} | ID: ${task.id} | Source: ${task._source}`);
      if (task.assignee) console.log(`     Assignee: ${task.assignee}`);
      if (task.tags) console.log(`     Tags: ${task.tags.join(', ')}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors and Warnings:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  // Test 4: File system operations simulation
  console.log('\n🔍 Test 4: File System Operations (Simulating IPC)');
  console.log('This demonstrates what our IPC handlers would do:');
  
  console.log('\n🔗 file:list-project simulation:');
  console.log(`  -> Would call: electronAPI.file.listProject(projectId, 'tasks')`);
  console.log(`  -> Would return: { success: true, files: [${jsonFiles.map(f => `"${f}"`).join(', ')}] }`);
  
  console.log('\n🔗 file:read-project simulation:');
  jsonFiles.forEach(file => {
    console.log(`  -> Would call: electronAPI.file.readProject(projectId, 'tasks/${file}')`);
    try {
      const content = fs.readFileSync(path.join(tasksDir, file), 'utf-8');
      console.log(`  -> Would return: { success: true, content: "${content.substring(0, 50)}..." }`);
    } catch (error) {
      console.log(`  -> Would return: { success: false, error: "${error.message}" }`);
    }
  });
  
  console.log('\n🎯 Final Result:');
  console.log('Based on this test, the task loader would:');
  console.log(`- Load ${tasks.length} valid tasks`);
  console.log(`- Report ${errors.length} warnings/errors`);
  console.log('- Display tasks in the Planning Dashboard UI');
  console.log('- Show detailed error messages for debugging');
  
} catch (dirError) {
  console.log(`❌ Tasks directory not found: ${dirError.message}`);
  console.log('Please ensure the /tasks directory exists with JSON files.');
}

console.log('\n✨ Test completed!');
console.log('If this shows valid tasks, the Electron app should work the same way.');