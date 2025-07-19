import { SimpleKanbanBoard } from './kanban/SimpleKanbanBoard';

interface PlanningViewProps {
  className?: string;
}

export function PlanningView({ className = '' }: PlanningViewProps) {
  // Check for ENABLE_KANBAN environment variable
  const isKanbanEnabled = import.meta.env.VITE_ENABLE_KANBAN === 'true' || 
                         import.meta.env.ENABLE_KANBAN === 'true';

  if (!isKanbanEnabled) {
    return (
      <div className={`h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Planning Mode Not Enabled
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            To enable the Planning mode with Kanban board, set the <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">ENABLE_KANBAN=true</code> environment variable.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Current: VITE_ENABLE_KANBAN = {import.meta.env.VITE_ENABLE_KANBAN || 'undefined'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-gray-50 dark:bg-gray-950 ${className}`}>
      <div className="h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Planning Board
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Organize your tasks across Planned, In Progress, and Complete columns
          </p>
        </div>
        <div className="h-full overflow-hidden">
          <SimpleKanbanBoard className="h-full" />
        </div>
      </div>
    </div>
  );
}