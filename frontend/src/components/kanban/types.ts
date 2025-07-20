export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  assignee?: string;
  dueDate?: string;
  branch?: string;            // NEW: Git branch/worktree assignment
  worktreeId?: string;        // NEW: Associate with worktree (alias for branch)
  executionOrder?: number;    // NEW: Order within worktree
  promptFile?: string;        // NEW: Path to .prompt.md
  projectId?: number;         // NEW: Explicit project association
}

export interface TaskFile {
  tasks: Task[];
  version: string;
  lastModified: string;
}