import { useState, useEffect } from 'react';
import { WorktreeColumn } from './WorktreeColumn';
import { Task } from './types';
import { API } from '../../utils/api';
// Temporarily comment out task loader until path is fixed
// import { loadTasks } from '../../../kanban/logic/taskLoader';

interface KanbanBoardProps {
  className?: string;
}

interface WorktreeGroup {
  name: string;
  displayName: string;
  tasks: Task[];
  activeTask: Task | null;
  queuedTasks: Task[];
  completedTasks: Task[];
}

export function KanbanBoard({ className = '' }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [worktreeGroups, setWorktreeGroups] = useState<WorktreeGroup[]>([]);

  // Load active project on mount
  useEffect(() => {
    const getActiveProject = async () => {
      try {
        const response = await API.projects.getActive();
        if (response.success && response.data) {
          setActiveProjectId(response.data.id);
        } else {
          console.log('No active project found, using mock data for demo');
          setActiveProjectId(1); // Use mock project ID
        }
      } catch (error) {
        console.log('API not available (web environment), using mock data for demo');
        setActiveProjectId(1); // Use mock project ID for web/test environment
      }
    };

    getActiveProject();
  }, []);

  // Load tasks when active project changes
  useEffect(() => {
    const loadProjectTasks = async () => {
      if (!activeProjectId) return;
      
      setIsLoading(true);
      setError(null);
      
      // For now, use mock data until task loader is properly integrated
      console.log('Using mock data for worktree demonstration');
      loadFallbackTasks();
      setIsLoading(false);
    };

    loadProjectTasks();
  }, [activeProjectId]);

  // Group tasks by worktree when tasks change
  useEffect(() => {
    const groupTasksByWorktree = () => {
      // Extract unique worktrees from tasks
      const worktrees = new Set<string>();
      
      // Always include current worktree
      worktrees.add('feature/task-visualization-overhaul');
      
      // Add worktrees from tasks
      tasks.forEach(task => {
        if (task.branch) {
          worktrees.add(task.branch);
        }
      });

      // Create worktree groups
      const groups: WorktreeGroup[] = Array.from(worktrees).map(worktreeName => {
        const worktreeTasks = tasks.filter(task => 
          task.branch === worktreeName || 
          (!task.branch && worktreeName === 'feature/task-visualization-overhaul')
        );

        // Separate tasks by status within each worktree
        const activeTask = worktreeTasks.find(task => task.status === 'in-progress') || null;
        const queuedTasks = worktreeTasks.filter(task => task.status === 'planned');
        const completedTasks = worktreeTasks.filter(task => task.status === 'completed');

        // Create display name
        const displayName = worktreeName === 'main' ? 'Main Branch' :
                           worktreeName.startsWith('feature/') ? 
                           worktreeName.replace('feature/', '') :
                           worktreeName.startsWith('test/') ?
                           `Test: ${worktreeName.replace('test/', '')}` :
                           worktreeName;

        return {
          name: worktreeName,
          displayName,
          tasks: worktreeTasks,
          activeTask,
          queuedTasks,
          completedTasks
        };
      });

      // Sort groups: current worktree first, then main, then others
      groups.sort((a, b) => {
        if (a.name === 'feature/task-visualization-overhaul') return -1;
        if (b.name === 'feature/task-visualization-overhaul') return 1;
        if (a.name === 'main') return -1;
        if (b.name === 'main') return 1;
        return a.displayName.localeCompare(b.displayName);
      });

      setWorktreeGroups(groups);
    };

    groupTasksByWorktree();
  }, [tasks]);

  const loadFallbackTasks = () => {
    const mockTasks: Task[] = [
      // Current worktree tasks
      {
        id: 'task-001',
        title: 'Implement Worktree-Based Columns',
        description: 'Transform Kanban board to show one column per git worktree branch',
        status: 'in-progress',
        priority: 'high',
        createdAt: '2024-07-19T10:00:00Z',
        tags: ['kanban', 'worktree', 'ui'],
        branch: 'feature/task-visualization-overhaul'
      },
      {
        id: 'task-002',
        title: 'Add Task Drag & Drop Between Worktrees',
        description: 'Enable moving tasks between different worktree columns',
        status: 'planned',
        priority: 'medium',
        createdAt: '2024-07-19T10:15:00Z',
        tags: ['ui', 'interaction'],
        branch: 'feature/task-visualization-overhaul'
      },
      {
        id: 'task-003',
        title: 'Project-Scoped Task Loading',
        description: 'Connect the Kanban board to the active project and load tasks dynamically',
        status: 'completed',
        priority: 'high',
        createdAt: '2024-07-19T09:00:00Z',
        tags: ['kanban', 'project-scoped'],
        branch: 'feature/task-visualization-overhaul'
      },
      
      // Other worktree tasks
      {
        id: 'task-004',
        title: 'Generate Claude Prompts from Tasks',
        description: 'Create .prompt.md files that Claude can read to understand task context',
        status: 'planned',
        priority: 'high',
        createdAt: '2024-07-19T10:30:00Z',
        tags: ['prompts', 'automation', 'claude'],
        branch: 'feature/claude-prompt-strategy'
      },
      {
        id: 'task-005',
        title: 'Implement Prompt Strategy System',
        description: 'Enable Claude to receive structured task.json data: user stories, success criteria',
        status: 'planned',
        priority: 'medium',
        createdAt: '2024-07-19T10:35:00Z',
        tags: ['prompts', 'strategy'],
        branch: 'feature/claude-prompt-strategy'
      },
      
      // Testing worktree
      {
        id: 'task-006',
        title: 'Kanban UI Automated Tests',
        description: 'Create comprehensive test suite for the new worktree-based Kanban board',
        status: 'planned',
        priority: 'medium',
        createdAt: '2024-07-19T10:45:00Z',
        tags: ['testing', 'ui', 'automation'],
        branch: 'test/kanban-ui-tests'
      },
      
      // Environment management
      {
        id: 'task-007',
        title: 'Worktree Environment Setup',
        description: 'Generate unique .env files and start local servers for each worktree',
        status: 'planned',
        priority: 'low',
        createdAt: '2024-07-19T11:00:00Z',
        tags: ['env', 'devops', 'worktree'],
        branch: 'feature/env-orchestration'
      },
      
      // Main branch tasks
      {
        id: 'task-008',
        title: 'Merge All Feature Branches',
        description: 'Safely merge all validated feature branches into main',
        status: 'planned',
        priority: 'high',
        createdAt: '2024-07-19T11:15:00Z',
        tags: ['git', 'merge', 'integration'],
        branch: 'main'
      }
    ];
    setTasks(mockTasks);
  };

  // Handle task movement between worktrees
  const handleTaskMove = (taskId: string, newWorktree: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, branch: newWorktree } : task
    ));
  };

  const handleTaskDrop = (e: React.DragEvent, worktreeName: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleTaskMove(taskId, worktreeName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Listen for project changes
  useEffect(() => {
    const handleProjectChange = () => {
      // Reload active project when it changes
      const getActiveProject = async () => {
        try {
          const response = await API.projects.getActive();
          if (response.success && response.data && response.data.id !== activeProjectId) {
            setActiveProjectId(response.data.id);
          }
        } catch (error) {
          console.error('Failed to reload active project:', error);
        }
      };
      
      getActiveProject();
    };

    // Set up a periodic check for project changes
    // In a real implementation, this would use IPC events
    const interval = setInterval(handleProjectChange, 5000);
    
    return () => clearInterval(interval);
  }, [activeProjectId]);

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tasks for project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a <code>/tasks</code> directory in your project with .json files to manage tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Project indicator */}
      <div className="mb-4 px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Project:</span>
          <span className={activeProjectId ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}>
            {activeProjectId ? `ID ${activeProjectId}` : 'No active project'}
          </span>
          <span className="ml-4">Tasks: {tasks.length}</span>
          <span className="ml-4">Worktrees: {worktreeGroups.length}</span>
        </div>
      </div>
      
      {/* Worktree columns */}
      <div className="flex-1 flex gap-6 px-6 pb-6 overflow-x-auto">
        {worktreeGroups.map((group) => (
          <WorktreeColumn
            key={group.name}
            worktreeName={group.name}
            displayName={group.displayName}
            tasks={group.tasks}
            activeTask={group.activeTask}
            queuedTasks={group.queuedTasks}
            completedTasks={group.completedTasks}
            onDrop={handleTaskDrop}
            onDragOver={handleDragOver}
          />
        ))}

        {/* Empty state when no worktrees */}
        {worktreeGroups.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No tasks found</p>
              <p className="text-sm">Create tasks with branch assignments to see worktree columns</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}