import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { loadTasks, Task } from '../../../kanban/logic/taskLoader';
import { KanbanBoard } from './kanban/KanbanBoard';

interface TaskPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export function TaskPlanningModal({ isOpen, onClose }: TaskPlanningModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

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
            <div className="h-full overflow-auto">
              <KanbanBoard className="h-full" />
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