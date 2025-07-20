/**
 * Task loader for Crystal's kanban feature
 * Reads and validates task metadata from .json files in the /tasks directory
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done' | 'planned' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  branch?: string;            // Git branch/worktree assignment
}

interface TaskFile {
  fileName: string;
  content: any;
  error?: string;
}

interface LoadTasksResponse {
  success: boolean;
  tasks: Task[];
  errors: string[];
}

/**
 * Validates if an object conforms to the Task interface
 */
function isValidTask(obj: any): obj is Task {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Required fields
  if (typeof obj.id !== 'string' || !obj.id.trim()) {
    return false;
  }

  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    return false;
  }

  // Support both old and new status formats
  if (!['todo', 'in-progress', 'done', 'planned', 'completed'].includes(obj.status)) {
    return false;
  }

  if (!['low', 'medium', 'high'].includes(obj.priority)) {
    return false;
  }

  if (typeof obj.createdAt !== 'string' || !obj.createdAt.trim()) {
    return false;
  }

  if (typeof obj.updatedAt !== 'string' || !obj.updatedAt.trim()) {
    return false;
  }

  // Optional fields validation
  if (obj.description !== undefined && typeof obj.description !== 'string') {
    return false;
  }

  if (obj.assignee !== undefined && typeof obj.assignee !== 'string') {
    return false;
  }

  if (obj.dueDate !== undefined && typeof obj.dueDate !== 'string') {
    return false;
  }

  if (obj.tags !== undefined && (!Array.isArray(obj.tags) || !obj.tags.every((tag: any) => typeof tag === 'string'))) {
    return false;
  }

  return true;
}

/**
 * Load and validate tasks from the /tasks directory
 * Uses Crystal's IPC pattern to safely read files from the project root
 */
export async function loadTasks(projectId?: number): Promise<LoadTasksResponse> {
  const tasks: Task[] = [];
  const errors: string[] = [];

  try {
    // Check if electronAPI is available (we're in the renderer process)
    if (typeof window === 'undefined' || !window.electronAPI) {
      throw new Error('electronAPI not available - must run in Electron renderer process');
    }

    // Get the current active project if projectId not provided
    let currentProjectId = projectId;
    if (!currentProjectId) {
      const activeProjectResponse = await window.electronAPI.projects.getActive();
      if (!activeProjectResponse.success || !activeProjectResponse.data) {
        return {
          success: false,
          tasks: [],
          errors: ['No active project found. Please select a project first.']
        };
      }
      currentProjectId = activeProjectResponse.data.id;
    }

    // First, try to list files in the tasks directory
    const listResponse = await window.electronAPI.file.listProject(currentProjectId, 'tasks');

    if (!listResponse.success) {
      // If the tasks directory doesn't exist, that's not an error - just return empty
      if (listResponse.error?.includes('no such file') || listResponse.error?.includes('ENOENT')) {
        return {
          success: true,
          tasks: [],
          errors: ['Tasks directory not found - create /tasks directory with .json files']
        };
      }
      
      errors.push(`Failed to list tasks directory: ${listResponse.error}`);
      return { success: false, tasks: [], errors };
    }

    const files = listResponse.files || [];
    const jsonFiles = files.filter((file: any) => 
      !file.isDirectory && 
      file.name.toLowerCase().endsWith('.json')
    );

    if (jsonFiles.length === 0) {
      return {
        success: true,
        tasks: [],
        errors: ['No .json task files found in /tasks directory']
      };
    }

    // Read each JSON file
    const taskFiles: TaskFile[] = [];
    
    for (const file of jsonFiles) {
      try {
        const readResponse = await window.electronAPI.file.readProject(currentProjectId, `tasks/${file.name}`);

        if (!readResponse.success) {
          errors.push(`Failed to read ${file.name}: ${readResponse.error}`);
          continue;
        }

        taskFiles.push({
          fileName: file.name,
          content: readResponse.content
        });
      } catch (error) {
        errors.push(`Error reading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Parse and validate each file
    for (const taskFile of taskFiles) {
      try {
        let parsedContent;
        
        try {
          parsedContent = JSON.parse(taskFile.content);
        } catch (jsonError) {
          errors.push(`Invalid JSON in ${taskFile.fileName}: ${jsonError instanceof Error ? jsonError.message : 'Parse error'}`);
          continue;
        }

        // Handle both single task objects and arrays of tasks
        const tasksToProcess = Array.isArray(parsedContent) ? parsedContent : [parsedContent];

        for (const [index, taskData] of tasksToProcess.entries()) {
          if (isValidTask(taskData)) {
            // Check for duplicate IDs
            if (tasks.some(existing => existing.id === taskData.id)) {
              errors.push(`Duplicate task ID '${taskData.id}' found in ${taskFile.fileName}${Array.isArray(parsedContent) ? ` (index ${index})` : ''}`);
              continue;
            }
            
            tasks.push(taskData);
          } else {
            errors.push(`Invalid task data in ${taskFile.fileName}${Array.isArray(parsedContent) ? ` (index ${index})` : ''}: missing required fields or invalid values`);
          }
        }
      } catch (error) {
        errors.push(`Error processing ${taskFile.fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      tasks: tasks.sort((a, b) => a.title.localeCompare(b.title)), // Sort by title for consistency
      errors
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      tasks: [],
      errors: [errorMessage]
    };
  }
}

/**
 * Helper function to create a sample task file for testing
 * This is just for development purposes
 */
export function createSampleTaskFile(): Task {
  return {
    id: `task-${Date.now()}`,
    title: 'Sample Task',
    description: 'This is a sample task for testing the task loader',
    status: 'todo',
    priority: 'medium',
    assignee: 'Developer',
    tags: ['sample', 'test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  };
}