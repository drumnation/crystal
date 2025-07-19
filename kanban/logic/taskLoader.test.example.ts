/**
 * Example usage of the task loader
 * This file demonstrates how to use the loadTasks function
 * Note: This is for demonstration only and won't run in a test environment
 * since it requires the Electron renderer process
 */

import { loadTasks, Task, createSampleTaskFile } from './taskLoader';

/**
 * Example of how to use the task loader in a React component or service
 */
export async function exampleUsage() {
  try {
    // Load tasks from the current active project
    const result = await loadTasks();
    
    if (result.success) {
      console.log(`Loaded ${result.tasks.length} tasks`);
      
      // Process the tasks
      result.tasks.forEach(task => {
        console.log(`Task: ${task.title} (${task.status}) - Priority: ${task.priority}`);
      });
      
      // Show any non-critical errors (like malformed files)
      if (result.errors.length > 0) {
        console.warn('Some issues were encountered:');
        result.errors.forEach(error => console.warn(`- ${error}`));
      }
      
      return result.tasks;
    } else {
      console.error('Failed to load tasks:', result.errors);
      return [];
    }
  } catch (error) {
    console.error('Unexpected error loading tasks:', error);
    return [];
  }
}

/**
 * Example of loading tasks from a specific project
 */
export async function loadTasksFromProject(projectId: number) {
  try {
    const result = await loadTasks(projectId);
    
    if (result.success) {
      // Filter tasks by status
      const todoTasks = result.tasks.filter(task => task.status === 'todo');
      const inProgressTasks = result.tasks.filter(task => task.status === 'in-progress');
      const doneTasks = result.tasks.filter(task => task.status === 'done');
      
      console.log(`Project ${projectId} tasks:`, {
        todo: todoTasks.length,
        inProgress: inProgressTasks.length,
        done: doneTasks.length
      });
      
      return {
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks
      };
    } else {
      throw new Error(result.errors.join(', '));
    }
  } catch (error) {
    console.error(`Failed to load tasks from project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Example of creating sample task data for development
 */
export function createSampleTask(): Task {
  return createSampleTaskFile();
}

/**
 * Type guard to check if a task is high priority and overdue
 */
export function isHighPriorityOverdue(task: Task): boolean {
  if (task.priority !== 'high') return false;
  if (!task.dueDate) return false;
  
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  
  return dueDate < now && task.status !== 'done';
}

/**
 * Example React hook usage (pseudo-code)
 */
/*
export function useTaskLoader(projectId?: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const loadProjectTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadTasks(projectId);
      setTasks(result.tasks);
      setErrors(result.errors);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Unknown error']);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectTasks();
  }, [loadProjectTasks]);

  return {
    tasks,
    loading,
    errors,
    reload: loadProjectTasks
  };
}
*/