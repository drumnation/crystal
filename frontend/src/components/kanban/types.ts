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
}

export interface TaskFile {
  tasks: Task[];
  version: string;
  lastModified: string;
}