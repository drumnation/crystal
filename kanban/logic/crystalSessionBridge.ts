/**
 * Crystal Session Bridge - Future-safe connection to Crystal's session engine
 * 
 * This module provides a clean interface for Kanban planning system to interact
 * with Crystal's internal session management and Git worktree systems.
 * 
 * All functions in this module are currently stubbed for future implementation.
 */

import type { Session, CreateSessionRequest } from '../../frontend/src/types/session';
import type { Project } from '../../frontend/src/types/project';

// Re-export Crystal types for external consumption
export type { Session, CreateSessionRequest, Project };

/**
 * Git branch information for worktree management
 */
export interface GitBranchInfo {
  name: string;
  isWorktree: boolean;
  worktreePath?: string;
  lastCommit?: string;
  status: 'active' | 'stale' | 'merged';
}

/**
 * Git repository status information
 */
export interface GitStatus {
  currentBranch: string;
  hasUncommittedChanges: boolean;
  ahead: number;
  behind: number;
  worktrees: GitBranchInfo[];
}

/**
 * Task metadata for session creation
 */
export interface TaskMetadata {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  estimatedHours?: number;
  dependencies?: string[];
}

/**
 * Session launch configuration
 */
export interface SessionLaunchConfig {
  task: TaskMetadata;
  prompt?: string;
  worktreeTemplate?: string;
  projectId?: number;
  model?: string;
  permissionMode?: 'approve' | 'ignore';
  autoCommit?: boolean;
}

/**
 * Session bridge status information
 */
export interface BridgeStatus {
  isConnected: boolean;
  crystalVersion?: string;
  activeProject?: Project;
  sessionCount: number;
  lastSync: Date;
}

/**
 * Lists all active Claude Code sessions in Crystal
 * 
 * @returns Promise<Session[]> Array of active sessions with their current status
 * 
 * TODO: Implement IPC call to Crystal's session manager
 * TODO: Filter out archived sessions
 * TODO: Include real-time status updates
 */
export async function getActiveSessions(): Promise<Session[]> {
  // STUB: Return empty array for now
  return [];
}

/**
 * Legacy alias for getActiveSessions - for backward compatibility
 * @deprecated Use getActiveSessions instead
 */
export async function listActiveSessions(): Promise<Session[]> {
  return getActiveSessions();
}

/**
 * Lists all Git worktree branches in the current project
 * 
 * @param projectPath Optional path to specific project (uses active project if not provided)
 * @returns Promise<GitBranchInfo[]> Array of branch information including worktree status
 * 
 * TODO: Implement git worktree list parsing
 * TODO: Detect stale worktrees that need cleanup
 * TODO: Include commit history and branch relationships
 */
export async function getWorktrees(projectPath?: string): Promise<GitBranchInfo[]> {
  // STUB: Return empty array for now
  return [];
}

/**
 * Legacy alias for getWorktrees - for backward compatibility
 * @deprecated Use getWorktrees instead
 */
export async function listWorktreeBranches(projectPath?: string): Promise<GitBranchInfo[]> {
  return getWorktrees(projectPath);
}

/**
 * Gets the current Git status for the active project
 * 
 * @param projectPath Optional path to specific project
 * @returns Promise<GitStatus> Complete git repository status
 * 
 * TODO: Implement git status parsing
 * TODO: Include remote tracking information
 * TODO: Detect merge conflicts and rebase status
 */
export async function getGitStatus(projectPath?: string): Promise<GitStatus> {
  // STUB: Return mock data for now
  return {
    currentBranch: 'main',
    hasUncommittedChanges: false,
    ahead: 0,
    behind: 0,
    worktrees: await getWorktrees(projectPath)
  };
}

/**
 * Launches a new Claude Code session directly from task metadata
 * 
 * @param task Task metadata to launch session for
 * @returns Promise<Session> The newly created session
 * 
 * TODO: Implement IPC call to Crystal's session creation system
 * TODO: Generate intelligent prompts from task metadata
 * TODO: Auto-configure worktree naming based on task ID/title
 * TODO: Set up proper git branch relationships
 * TODO: Handle session launch failures gracefully
 */
export async function launchClaudeSession(task: TaskMetadata): Promise<Session> {
  console.log(`Launching Claude session for: ${task.title}`);
  
  // STUB: Return mock session for now
  const mockSession: Session = {
    id: `task-session-${task.id}`,
    name: `Task: ${task.title}`,
    worktreePath: `/tmp/crystal-task-${task.id}`,
    prompt: generatePromptFromTask(task),
    status: 'initializing',
    createdAt: new Date().toISOString(),
    output: [],
    jsonMessages: [],
    projectId: 1,
    isMainRepo: false,
    model: 'claude-3-5-sonnet-20241022',
    permissionMode: 'approve',
    autoCommit: false
  };
  
  return mockSession;
}

/**
 * Launches a new Claude Code session using task metadata with full configuration
 * 
 * @param config Session launch configuration with task details
 * @returns Promise<Session> The newly created session
 * 
 * TODO: Implement IPC call to Crystal's session creation system
 * TODO: Generate intelligent prompts from task metadata
 * TODO: Auto-configure worktree naming based on task ID/title
 * TODO: Set up proper git branch relationships
 * TODO: Handle session launch failures gracefully
 */
export async function launchSessionFromTask(config: SessionLaunchConfig): Promise<Session> {
  const { task, prompt, worktreeTemplate, projectId, model, permissionMode, autoCommit } = config;
  
  console.log(`Launching Claude session for: ${task.title}`);
  
  // STUB: Return mock session for now
  const mockSession: Session = {
    id: `task-session-${task.id}`,
    name: `Task: ${task.title}`,
    worktreePath: `/tmp/crystal-task-${task.id}`,
    prompt: prompt || generatePromptFromTask(task),
    status: 'initializing',
    createdAt: new Date().toISOString(),
    output: [],
    jsonMessages: [],
    projectId: projectId || 1,
    isMainRepo: false,
    model: model || 'claude-3-5-sonnet-20241022',
    permissionMode: permissionMode || 'approve',
    autoCommit: autoCommit || false
  };
  
  return mockSession;
}

/**
 * Syncs session status with Kanban task status
 * 
 * @param sessionId Crystal session ID
 * @param taskId Kanban task ID
 * @returns Promise<void>
 * 
 * TODO: Implement bidirectional sync between session status and task status
 * TODO: Handle session completion -> task completion
 * TODO: Handle session errors -> task blocking
 * TODO: Update task progress based on session activity
 */
export async function syncSessionWithTask(sessionId: string, taskId: string): Promise<void> {
  // STUB: Log for now
  console.log(`TODO: Sync session ${sessionId} with task ${taskId}`);
}

/**
 * Gets the current bridge connection status
 * 
 * @returns Promise<BridgeStatus> Connection and system status
 * 
 * TODO: Implement health check with Crystal's main process
 * TODO: Verify IPC communication is working
 * TODO: Check Crystal database accessibility
 * TODO: Monitor session manager availability
 */
export async function getBridgeStatus(): Promise<BridgeStatus> {
  // STUB: Return mock status for now
  return {
    isConnected: false, // Will be true when bridge is implemented
    crystalVersion: '1.0.0',
    sessionCount: 1,
    lastSync: new Date()
  };
}

/**
 * Helper function to generate intelligent prompts from task metadata
 * 
 * @param task Task metadata to convert to prompt
 * @returns string Generated prompt text
 * 
 * TODO: Implement smart prompt generation based on task type
 * TODO: Include context from task dependencies
 * TODO: Add project-specific prompt templates
 * TODO: Consider task priority and estimated complexity
 */
function generatePromptFromTask(task: TaskMetadata): string {
  const { title, description, priority, tags, dependencies } = task;
  
  let prompt = `Task: ${title}\n\nDescription: ${description}`;
  
  if (priority && priority !== 'medium') {
    prompt += `\n\nPriority: ${priority}`;
  }
  
  if (tags && tags.length > 0) {
    prompt += `\n\nTags: ${tags.join(', ')}`;
  }
  
  if (dependencies && dependencies.length > 0) {
    prompt += `\n\nDependencies: This task depends on: ${dependencies.join(', ')}`;
  }
  
  prompt += '\n\nPlease help me implement this task step by step.';
  
  return prompt;
}

/**
 * Utility function to check if a session belongs to a specific task
 * 
 * @param session Session to check
 * @param taskId Task ID to match against
 * @returns boolean True if session is associated with the task
 * 
 * TODO: Implement proper session-task relationship tracking
 * TODO: Store task metadata in session database
 * TODO: Support multiple sessions per task
 */
export function isSessionForTask(session: Session, taskId: string): boolean {
  // STUB: Simple string matching for now
  return session.id.includes(taskId) || session.name.includes(taskId);
}

/**
 * Utility function to extract task ID from session
 * 
 * @param session Session to extract task ID from
 * @returns string | null Task ID if found, null otherwise
 * 
 * TODO: Implement proper task ID storage in session metadata
 * TODO: Support task ID extraction from various naming patterns
 */
export function getTaskIdFromSession(session: Session): string | null {
  // STUB: Simple regex extraction for now
  const match = session.id.match(/task-session-(.+)$/);
  return match ? match[1] : null;
}

/**
 * Type guard to check if an object is a valid Session
 * 
 * @param obj Object to check
 * @returns boolean True if object is a valid Session
 */
export function isValidSession(obj: any): obj is Session {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.worktreePath === 'string' &&
    typeof obj.prompt === 'string' &&
    ['initializing', 'ready', 'running', 'waiting', 'stopped', 'completed_unviewed', 'error'].includes(obj.status)
  );
}

/**
 * Type guard to check if an object is valid TaskMetadata
 * 
 * @param obj Object to check
 * @returns boolean True if object is valid TaskMetadata
 */
export function isValidTaskMetadata(obj: any): obj is TaskMetadata {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    ['low', 'medium', 'high', 'urgent'].includes(obj.priority)
  );
}