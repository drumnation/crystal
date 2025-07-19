import React, { useState, useEffect } from 'react';
import { Task, KanbanColumn, createMockKanbanColumns } from '../../tests/mocks/taskData';

interface PlanningViewProps {
  tasks?: Task[];
  onTaskMove?: (taskId: string, newStatus: Task['status']) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskDelete?: (taskId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  tasks = [],
  onTaskMove,
  onTaskCreate,
  onTaskDelete,
  loading = false,
  error = null
}) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    setColumns(createMockKanbanColumns(tasks));
  }, [tasks]);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = (targetStatus: Task['status']) => {
    if (draggedTask && draggedTask.status !== targetStatus) {
      onTaskMove?.(draggedTask.id, targetStatus);
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="planning-view-loading" data-testid="planning-view-loading">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="planning-view-error" data-testid="planning-view-error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="planning-view-empty" data-testid="planning-view-empty">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first task.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planning-view" data-testid="planning-view">
      <div className="kanban-board grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="kanban-column bg-gray-50 rounded-lg p-4"
            data-testid={`kanban-column-${column.status}`}
            onDrop={() => handleDrop(column.status)}
            onDragOver={handleDragOver}
          >
            <div className="column-header mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                {column.title}
                <span 
                  className="task-count bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-sm"
                  data-testid={`task-count-${column.status}`}
                >
                  {column.tasks.length}
                </span>
              </h3>
            </div>
            
            <div className="column-tasks space-y-3">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-card bg-white rounded-lg p-4 shadow-sm border cursor-move hover:shadow-md transition-shadow ${
                    draggedTask?.id === task.id ? 'opacity-50' : ''
                  }`}
                  data-testid={`task-card-${task.id}`}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="task-header flex items-start justify-between mb-2">
                    <h4 className="task-title text-sm font-medium text-gray-900 flex-1">
                      {task.title}
                    </h4>
                    <span className={`priority-badge text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="task-description text-sm text-gray-600 mb-3">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="task-meta flex items-center justify-between text-xs text-gray-500">
                    {task.assignee && (
                      <span className="assignee">Assigned to: {task.assignee}</span>
                    )}
                    <span className="updated-at">
                      Updated: {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {onTaskDelete && (
                    <button
                      className="delete-task-btn mt-2 text-red-600 hover:text-red-800 text-xs"
                      onClick={() => onTaskDelete(task.id)}
                      data-testid={`delete-task-${task.id}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              
              {column.tasks.length === 0 && (
                <div className="empty-column-placeholder text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Drop tasks here or drag from other columns
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};