/**
 * Example usage of Crystal Session Bridge
 * 
 * This file demonstrates how the Kanban system would interact with Crystal's session engine.
 */

import { 
  launchClaudeSession,
  getActiveSessions,
  getWorktrees,
  type TaskMetadata,
  type Session,
  type GitBranchInfo
} from './logic/crystalSessionBridge';

/**
 * Example task from Kanban system
 */
const exampleTask: TaskMetadata = {
  id: 'TASK-123',
  title: 'Implement user authentication',
  description: 'Add JWT-based authentication system with login/logout functionality',
  priority: 'high',
  tags: ['backend', 'security', 'auth'],
  estimatedHours: 8,
  dependencies: ['TASK-100'] // Database setup task
};

/**
 * Example: Launch a Claude session from a Kanban task
 */
async function exampleLaunchSession() {
  console.log('=== Example: Launch Session ===');
  
  try {
    // This will log: "Launching Claude session for: Implement user authentication"
    const session: Session = await launchClaudeSession(exampleTask);
    
    console.log('✅ Session created:', {
      id: session.id,
      name: session.name,
      status: session.status,
      worktreePath: session.worktreePath
    });
    
    console.log('📝 Generated prompt preview:');
    console.log(session.prompt.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ Failed to launch session:', error);
  }
}

/**
 * Example: Get all active sessions
 */
async function exampleGetActiveSessions() {
  console.log('\n=== Example: Get Active Sessions ===');
  
  try {
    const sessions: Session[] = await getActiveSessions();
    
    console.log(`📊 Found ${sessions.length} active sessions`);
    
    if (sessions.length === 0) {
      console.log('✅ No active sessions (expected in stub implementation)');
    } else {
      sessions.forEach(session => {
        console.log(`- ${session.name} (${session.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to get sessions:', error);
  }
}

/**
 * Example: Get all worktrees
 */
async function exampleGetWorktrees() {
  console.log('\n=== Example: Get Worktrees ===');
  
  try {
    const worktrees: GitBranchInfo[] = await getWorktrees();
    
    console.log(`🌳 Found ${worktrees.length} worktrees`);
    
    if (worktrees.length === 0) {
      console.log('✅ No worktrees found (expected in stub implementation)');
    } else {
      worktrees.forEach(worktree => {
        console.log(`- ${worktree.name} (${worktree.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to get worktrees:', error);
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('🚀 Crystal Session Bridge Examples\n');
  
  await exampleLaunchSession();
  await exampleGetActiveSessions();
  await exampleGetWorktrees();
  
  console.log('\n✨ All examples completed successfully!');
  console.log('\n📝 Note: This is using stubbed data. Real implementation will:');
  console.log('  - Connect to Crystal\'s IPC system');
  console.log('  - Create actual git worktrees');
  console.log('  - Launch real Claude Code instances');
  console.log('  - Sync task status with session progress');
}

// Export for external usage
export { 
  exampleTask,
  exampleLaunchSession,
  exampleGetActiveSessions,
  exampleGetWorktrees,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}