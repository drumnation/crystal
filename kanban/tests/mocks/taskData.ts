/**
 * Mock task data for Kanban UI tests
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: Task['status'];
  tasks: Task[];
}

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens',
    status: 'planned',
    priority: 'high',
    assignee: 'john.doe',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Create task dashboard',
    description: 'Design and implement the main task management dashboard',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'jane.smith',
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 'task-3',
    title: 'Set up database schema',
    description: 'Design and implement the database schema for task management',
    status: 'completed',
    priority: 'high',
    assignee: 'bob.wilson',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-13T16:45:00Z'
  },
  {
    id: 'task-4',
    title: 'Add drag and drop functionality',
    description: 'Implement drag and drop for task management between columns',
    status: 'planned',
    priority: 'medium',
    createdAt: '2024-01-16T11:15:00Z',
    updatedAt: '2024-01-16T11:15:00Z'
  }
];

export const emptyTasks: Task[] = [];

export const malformedTasks = [
  {
    id: 'malformed-1',
    // Missing required fields
    description: 'This task is missing a title and status',
    priority: 'invalid-priority'
  },
  {
    // Missing id
    title: 'Task without ID',
    status: 'unknown-status',
    priority: 'high'
  }
];

export const createMockKanbanColumns = (tasks: Task[]): KanbanColumn[] => {
  const plannedTasks = tasks.filter(task => task.status === 'planned');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return [
    {
      id: 'col-planned',
      title: 'Planned',
      status: 'planned',
      tasks: plannedTasks
    },
    {
      id: 'col-in-progress',
      title: 'In Progress',
      status: 'in-progress',
      tasks: inProgressTasks
    },
    {
      id: 'col-completed',
      title: 'Completed',
      status: 'completed',
      tasks: completedTasks
    }
  ];
};

export const mockSessionBridge = {
  loadTasks: async (): Promise<Task[]> => {
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockTasks;
  },
  
  loadEmptyTasks: async (): Promise<Task[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return emptyTasks;
  },
  
  loadMalformedTasks: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return malformedTasks;
  },
  
  updateTaskStatus: async (taskId: string, newStatus: Task['status']): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    return {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
  },
  
  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const now = new Date().toISOString();
    return {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
  },
  
  deleteTask: async (taskId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
  }
};