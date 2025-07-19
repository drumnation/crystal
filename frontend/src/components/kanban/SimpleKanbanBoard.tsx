interface SimpleKanbanBoardProps {
  className?: string;
}

export function SimpleKanbanBoard({ className = '' }: SimpleKanbanBoardProps) {
  return (
    <div className={`h-full flex gap-6 p-6 overflow-x-auto ${className}`}>
      {/* Planned Column */}
      <div className="flex-1 min-w-80 max-w-96 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 rounded-lg border-2 border-dashed">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Planned</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
              2
            </span>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Task File Format</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Define JSON schema for tasks</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Drag and Drop Polish</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Improve interactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Column */}
      <div className="flex-1 min-w-80 max-w-96 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 rounded-lg border-2 border-dashed">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">In Progress</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
              1
            </span>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Task Persistence</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Save and load task state changes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Column */}
      <div className="flex-1 min-w-80 max-w-96 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 rounded-lg border-2 border-dashed">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Complete</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
              2
            </span>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Kanban Board UI</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">3-column layout with drag-and-drop</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Feature Flag Support</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Environment variable-based feature flag</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}