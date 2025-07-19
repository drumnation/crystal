import React from 'react';
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { CrystalSessionBridge, Task } from '../utils/crystalSessionBridge';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  const handleLaunchClaude = async () => {
    try {
      await CrystalSessionBridge.launchClaudeSession(task);
    } catch (error) {
      console.error('Failed to launch Claude session:', error);
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'todo':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return 'border-gray-300 bg-gray-50';
      case 'in_progress':
        return 'border-blue-300 bg-blue-50';
      case 'done':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()} hover:shadow-md transition-shadow duration-200`}>
      {/* Header with status icon and priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{task.status.replace('_', ' ')}</span>
        </div>
        {task.priority && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor()}`}>
            {task.priority}
          </span>
        )}
      </div>

      {/* Task title */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Task description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {/* Launch Claude button */}
        <button
          onClick={handleLaunchClaude}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex-1"
          title="Launch Claude session for this task"
        >
          <Play className="w-4 h-4" />
          Launch Claude
        </button>

        {/* Status change dropdown */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange?.(task.id, e.target.value as Task['status'])}
          className="px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          title="Change task status"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Additional actions (edit/delete) */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors duration-200"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;