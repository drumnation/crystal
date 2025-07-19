import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { Task } from '../utils/crystalSessionBridge';

interface KanbanColumn {
  id: string;
  title: string;
  status: Task['status'];
}

const COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'done', title: 'Done', status: 'done' },
];

// Sample tasks for demonstration
const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Implement Claude session launcher',
    description: 'Add a button to TaskCard.tsx that launches Claude sessions with task context',
    status: 'in_progress',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Create task management API',
    description: 'Build backend endpoints for CRUD operations on tasks',
    status: 'todo',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Design Kanban UI components',
    description: 'Create reusable components for the Kanban board interface',
    status: 'done',
    priority: 'low'
  },
  {
    id: '4',
    title: 'Add drag and drop functionality',
    description: 'Allow users to drag tasks between columns to change status',
    status: 'todo',
    priority: 'medium'
  },
];

export const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleEdit = (task: Task) => {
    // TODO: Implement task editing
    console.log('Edit task:', task);
  };

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getTasksForColumn = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getColumnColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 border-gray-300';
      case 'in_progress':
        return 'bg-blue-100 border-blue-300';
      case 'done':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="h-full p-6 bg-gray-50 dark:bg-gray-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Task Runner - Kanban Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your tasks and launch Claude sessions directly from each task card
        </p>
      </div>

      <div className="flex gap-6 h-full overflow-x-auto">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            {/* Column header */}
            <div className={`p-4 rounded-t-lg border-2 ${getColumnColor(column.status)}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {column.title}
                </h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-700">
                  {getTasksForColumn(column.status).length}
                </span>
              </div>
            </div>

            {/* Column content */}
            <div className={`p-4 border-2 border-t-0 rounded-b-lg min-h-96 ${getColumnColor(column.status)} space-y-4`}>
              {getTasksForColumn(column.status).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}

              {/* Add task button */}
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;