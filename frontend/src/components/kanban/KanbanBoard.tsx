import { useState, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task } from './types';

interface KanbanBoardProps {
  className?: string;
}

export function KanbanBoard({ className = '' }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Try to load tasks from /tasks/*.json files via the file system
        // In a real implementation, this would need to be done through the main process
        // For now, we'll use the embedded task data
        const response = await fetch('/tasks/crystal-kanban.json');
        if (response.ok) {
          const taskFile = await response.json();
          setTasks(taskFile.tasks || []);
        } else {
          // Fallback to mock data
          const mockTasks: Task[] = [
            {
              id: 'task-001',
              title: 'Implement Kanban Board UI',
              description: 'Create a 3-column Kanban board layout with drag-and-drop functionality',
              status: 'completed',
              priority: 'high',
              createdAt: '2024-07-19T10:00:00Z',
            },
            {
              id: 'task-002', 
              title: 'Add Feature Flag Support',
              description: 'Implement environment variable-based feature flag for enabling/disabling Kanban functionality',
              status: 'completed',
              priority: 'high',
              createdAt: '2024-07-19T10:15:00Z',
            },
            {
              id: 'task-003',
              title: 'Task File Format Specification',
              description: 'Define JSON schema and file format for storing tasks in /tasks/*.json files',
              status: 'in-progress',
              priority: 'medium',
              createdAt: '2024-07-19T10:30:00Z',
            },
            {
              id: 'task-004',
              title: 'Drag and Drop Polish',
              description: 'Improve drag and drop interactions with visual feedback and smooth animations',
              status: 'planned',
              priority: 'medium',
              createdAt: '2024-07-19T11:00:00Z',
            },
            {
              id: 'task-005',
              title: 'Task Persistence',
              description: 'Implement saving and loading of task state changes back to JSON files',
              status: 'planned',
              priority: 'high',
              createdAt: '2024-07-19T11:15:00Z',
            }
          ];
          setTasks(mockTasks);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        // Fallback to empty tasks
        setTasks([]);
      }
    };

    loadTasks();
  }, []);

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

  return (
    <div className={`h-full flex gap-6 p-6 overflow-x-auto ${className}`}>
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
  );
}