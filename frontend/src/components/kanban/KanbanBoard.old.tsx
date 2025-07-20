import { useState, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task } from './types';
import { API } from '../../utils/api';
import { loadTasks } from '../../../kanban/logic/taskLoader';

interface KanbanBoardProps {
  className?: string;
}

export function KanbanBoard({ className = '' }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load active project on mount
  useEffect(() => {
    const getActiveProject = async () => {
      try {
        const response = await API.projects.getActive();
        if (response.success && response.data) {
          setActiveProjectId(response.data.id);
        } else {
          setError('No active project found. Please select a project first.');
        }
      } catch (error) {
        console.error('Failed to get active project:', error);
        setError('Failed to get active project');
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
      
      try {
        // Use the existing task loader which is project-aware
        const result = await loadTasks(activeProjectId);
        
        if (result.success) {
          // Convert from kanban task format to frontend task format
          const convertedTasks: Task[] = result.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status === 'todo' ? 'planned' : 
                   task.status === 'done' ? 'completed' :
                   task.status === 'planned' ? 'planned' :
                   task.status === 'completed' ? 'completed' :
                   'in-progress',  // default for 'in-progress'
            priority: task.priority,
            assignee: task.assignee,
            tags: task.tags,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            dueDate: task.dueDate
          }));
          
          setTasks(convertedTasks);
          
          // Log any warnings/errors from task loading
          if (result.errors.length > 0) {
            console.warn('Task loading warnings:', result.errors);
          }
        } else {
          // If loading fails, show mock data as fallback
          console.warn('Failed to load project tasks, using fallback data:', result.errors);
          loadFallbackTasks();
        }
      } catch (error) {
        console.error('Error loading project tasks:', error);
        setError('Failed to load tasks');
        loadFallbackTasks();
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectTasks();
  }, [activeProjectId]);

  const loadFallbackTasks = () => {
    const mockTasks: Task[] = [
      {
        id: 'task-001',
        title: 'Implement Project-Scoped Kanban Board',
        description: 'Connect the Kanban board to the active project and load tasks dynamically',
        status: 'in-progress',
        priority: 'high',
        createdAt: '2024-07-19T10:00:00Z',
        tags: ['kanban', 'project-scoped']
      },
      {
        id: 'task-002', 
        title: 'Add Worktree Association',
        description: 'Associate tasks with specific git worktrees for better organization',
        status: 'planned',
        priority: 'high',
        createdAt: '2024-07-19T10:15:00Z',
        tags: ['worktree', 'git']
      },
      {
        id: 'task-003',
        title: 'Create .prompt.md Files',
        description: 'Generate Claude-readable prompt files for each task to enable recursive execution',
        status: 'planned',
        priority: 'medium',
        createdAt: '2024-07-19T10:30:00Z',
        tags: ['prompts', 'automation']
      }
    ];
    setTasks(mockTasks);
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

  const handleTaskMove = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleTaskDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleTaskMove(taskId, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const plannedTasks = tasks.filter(task => task.status === 'planned');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

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
        </div>
      </div>
      
      {/* Kanban columns */}
      <div className="flex-1 flex gap-6 px-6 pb-6 overflow-x-auto">
      <KanbanColumn
        title="Planned"
        status="planned"
        tasks={plannedTasks}
        onDrop={handleTaskDrop}
        onDragOver={handleDragOver}
      />
      <KanbanColumn
        title="In Progress"
        status="in-progress"
        tasks={inProgressTasks}
        onDrop={handleTaskDrop}
        onDragOver={handleDragOver}
      />
      <KanbanColumn
        title="Complete"
        status="completed"
        tasks={completedTasks}
        onDrop={handleTaskDrop}
        onDragOver={handleDragOver}
      />
      </div>
    </div>
  );
}