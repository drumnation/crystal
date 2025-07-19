import { TaskCard } from './TaskCard';
import { Task } from './types';

interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  onDrop: (e: React.DragEvent, status: Task['status']) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export function KanbanColumn({ title, status, tasks, onDrop, onDragOver }: KanbanColumnProps) {
  const getColumnColor = (status: Task['status']) => {
    switch (status) {
      case 'planned':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      case 'in-progress':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950';
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900';
    }
  };

  return (
    <div 
      className={`flex-1 min-w-80 max-w-96 ${getColumnColor(status)} rounded-lg border-2 border-dashed transition-colors`}
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No tasks in {title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}