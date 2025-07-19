import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { loadTasks, Task } from '../../../kanban/logic/taskLoader';

interface TaskPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TasksByStatus {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

export function TaskPlanningModal({ isOpen, onClose }: TaskPlanningModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  const tasksByStatus: TasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    inProgress: tasks.filter(task => task.status === 'in-progress'),
    done: tasks.filter(task => task.status === 'done')
  };

  const loadTasksData = async () => {
    setLoading(true);
    setErrors([]);
    
    console.log('🔄 [TaskPlanningModal] Starting task loading...');
    
    try {
      console.log('📂 [TaskPlanningModal] Calling loadTasks() function...');
      const result = await loadTasks();
      
      console.log('📊 [TaskPlanningModal] Task loading result:', {
        success: result.success,
        taskCount: result.tasks.length,
        errorCount: result.errors.length,
        errors: result.errors
      });

      if (result.success) {
        setTasks(result.tasks);
        setErrors(result.errors); // These are warnings, not fatal errors
        setLastLoaded(new Date());
        
        console.log('✅ [TaskPlanningModal] Successfully loaded tasks:', result.tasks);
        
        // Log each task for detailed inspection
        result.tasks.forEach((task, index) => {
          console.log(`📋 [TaskPlanningModal] Task ${index + 1}:`, {
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            tags: task.tags,
            createdAt: task.createdAt,
            dueDate: task.dueDate
          });
        });

        // Log errors/warnings
        if (result.errors.length > 0) {
          console.warn('⚠️ [TaskPlanningModal] Task loading warnings:');
          result.errors.forEach((error, index) => {
            console.warn(`  ${index + 1}. ${error}`);
          });
        }
      } else {
        setErrors(result.errors);
        console.error('❌ [TaskPlanningModal] Failed to load tasks:', result.errors);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrors([errorMessage]);
      console.error('💥 [TaskPlanningModal] Unexpected error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTasksData();
    }
  }, [isOpen]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'in-progress': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex-1">
          {task.title}
        </h4>
        <div className="flex items-center space-x-2 ml-2">
          {getStatusIcon(task.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {task.description}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
        {task.assignee && (
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{task.assignee}</span>
          </div>
        )}
        
        {task.dueDate && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>{task.tags.join(', ')}</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        ID: {task.id} • Created: {formatDate(task.createdAt)}
      </div>
    </div>
  );

  const TaskColumn = ({ title, tasks, count }: { title: string; tasks: Task[]; count: number }) => (
    <div className="flex-1 min-w-0">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
          {title}
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
            {count}
          </span>
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-8">
              No {title.toLowerCase()} tasks
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Task Planning Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Testing task loader functionality • {tasks.length} tasks loaded
              {lastLoaded && ` • Last loaded: ${lastLoaded.toLocaleTimeString()}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadTasksData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4" />}
              <span>{loading ? 'Loading...' : 'Reload Tasks'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Task Loading Issues ({errors.length})
                </h4>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex space-x-6 overflow-auto">
              <TaskColumn 
                title="To Do" 
                tasks={tasksByStatus.todo} 
                count={tasksByStatus.todo.length}
              />
              <TaskColumn 
                title="In Progress" 
                tasks={tasksByStatus.inProgress} 
                count={tasksByStatus.inProgress.length}
              />
              <TaskColumn 
                title="Done" 
                tasks={tasksByStatus.done} 
                count={tasksByStatus.done.length}
              />
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="px-6 pb-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p>
            Debug: Check browser console for detailed task loading logs • 
            Files tested: /tasks/*.json • 
            IPC calls: file:list-project, file:read-project
          </p>
        </div>
      </div>
    </div>
  );
}