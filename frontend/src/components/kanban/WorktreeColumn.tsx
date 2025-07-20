import React from 'react';
import { TaskCard } from './TaskCard';
import { Task } from './types';
import { GitBranch, Clock, CheckCircle } from 'lucide-react';

interface WorktreeColumnProps {
  worktreeName: string;
  displayName: string;
  tasks: Task[];
  onDrop: (e: React.DragEvent, worktreeName: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  activeTask?: Task | null;
  queuedTasks: Task[];
  completedTasks: Task[];
}

export function WorktreeColumn({ 
  worktreeName, 
  displayName,
  tasks, 
  onDrop, 
  onDragOver,
  activeTask,
  queuedTasks,
  completedTasks
}: WorktreeColumnProps) {
  // const totalTasks = tasks.length;
  const isCurrentWorktree = worktreeName === 'feature/task-visualization-overhaul';

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 rounded-lg min-w-80 max-w-80">
      {/* Column Header */}
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isCurrentWorktree ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className={`w-4 h-4 ${isCurrentWorktree ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
          <h3 className={`font-semibold text-sm ${isCurrentWorktree ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
            {displayName}
          </h3>
          {isCurrentWorktree && (
            <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              current
            </span>
          )}
        </div>
        
        {/* Task Status Summary */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span>{activeTask ? '1' : '0'} active</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{queuedTasks.length} queued</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{completedTasks.length} done</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div 
        className="flex-1 p-4 space-y-3 overflow-y-auto"
        onDrop={(e) => onDrop(e, worktreeName)}
        onDragOver={onDragOver}
      >
        {/* Active Task */}
        {activeTask && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              🔄 Active
            </div>
            <TaskCard 
              task={activeTask} 
              isActive={true}
            />
          </div>
        )}

        {/* Queued Tasks */}
        {queuedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              📋 Queued
            </div>
            {queuedTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task}
                isActive={false}
              />
            ))}
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
              ✅ Completed
            </div>
            {completedTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task}
                isActive={false}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks assigned</p>
            <p className="text-xs">Drag tasks here to assign to this worktree</p>
          </div>
        )}
      </div>
    </div>
  );
}