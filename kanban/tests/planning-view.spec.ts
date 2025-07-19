import { test, expect } from '@playwright/test';

/**
 * Kanban UI Tests - PlanningView Component
 * 
 * Tests the rendering, interaction, and state management of the PlanningView component
 * which handles the main Kanban board layout with drag-and-drop functionality.
 */

test.describe('PlanningView Component', () => {
  
  // Setup HTML page with the PlanningView component for testing
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .kanban-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
            .kanban-column { background: #f9fafb; border-radius: 8px; padding: 16px; }
            .task-card { 
              background: white; 
              border-radius: 8px; 
              padding: 16px; 
              margin-bottom: 12px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              cursor: move;
              border: 1px solid #e5e7eb;
            }
            .task-card:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .task-card.dragging { opacity: 0.5; }
            .task-count { 
              background: #e5e7eb; 
              color: #374151; 
              border-radius: 9999px; 
              padding: 4px 8px; 
              font-size: 14px; 
            }
            .priority-badge {
              font-size: 12px;
              padding: 2px 8px;
              border-radius: 9999px;
            }
            .priority-high { background: #fef2f2; color: #dc2626; }
            .priority-medium { background: #fffbeb; color: #d97706; }
            .priority-low { background: #f0fdf4; color: #16a34a; }
            .empty-column-placeholder {
              text-align: center;
              padding: 32px;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              color: #6b7280;
            }
            .loading-spinner {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 256px;
            }
            .error-message {
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 6px;
              padding: 16px;
              color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Mock task data
            const mockTasks = [
              {
                id: 'task-1',
                title: 'Implement user authentication',
                description: 'Add login and registration functionality with JWT tokens',
                status: 'planned',
                priority: 'high',
                assignee: 'john.doe',
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z'
              },
              {
                id: 'task-2',
                title: 'Create task dashboard',
                description: 'Design and implement the main task management dashboard',
                status: 'in-progress',
                priority: 'medium',
                assignee: 'jane.smith',
                createdAt: '2024-01-14T09:30:00Z',
                updatedAt: '2024-01-16T14:20:00Z'
              },
              {
                id: 'task-3',
                title: 'Set up database schema',
                description: 'Design and implement the database schema for task management',
                status: 'completed',
                priority: 'high',
                assignee: 'bob.wilson',
                createdAt: '2024-01-10T08:00:00Z',
                updatedAt: '2024-01-13T16:45:00Z'
              }
            ];

            // Create mock columns from tasks
            function createMockKanbanColumns(tasks) {
              const plannedTasks = tasks.filter(task => task.status === 'planned');
              const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
              const completedTasks = tasks.filter(task => task.status === 'completed');

              return [
                { id: 'col-planned', title: 'Planned', status: 'planned', tasks: plannedTasks },
                { id: 'col-in-progress', title: 'In Progress', status: 'in-progress', tasks: inProgressTasks },
                { id: 'col-completed', title: 'Completed', status: 'completed', tasks: completedTasks }
              ];
            }

            // PlanningView Component
            function PlanningView({ tasks = [], onTaskMove, loading = false, error = null }) {
              const [draggedTask, setDraggedTask] = React.useState(null);
              const columns = React.useMemo(() => createMockKanbanColumns(tasks), [tasks]);

              const handleDragStart = (task) => {
                setDraggedTask(task);
              };

              const handleDragEnd = () => {
                setDraggedTask(null);
              };

              const handleDrop = (e, targetStatus) => {
                e.preventDefault();
                if (draggedTask && draggedTask.status !== targetStatus) {
                  onTaskMove && onTaskMove(draggedTask.id, targetStatus);
                }
                setDraggedTask(null);
              };

              const handleDragOver = (e) => {
                e.preventDefault();
              };

              if (loading) {
                return React.createElement('div', {
                  className: 'planning-view-loading',
                  'data-testid': 'planning-view-loading'
                }, React.createElement('div', { className: 'loading-spinner' }, 'Loading tasks...'));
              }

              if (error) {
                return React.createElement('div', {
                  className: 'planning-view-error',
                  'data-testid': 'planning-view-error'
                }, React.createElement('div', { className: 'error-message' }, error));
              }

              if (tasks.length === 0) {
                return React.createElement('div', {
                  className: 'planning-view-empty',
                  'data-testid': 'planning-view-empty'
                }, React.createElement('div', { style: { textAlign: 'center', padding: '48px' } }, 'No tasks found'));
              }

              return React.createElement('div', {
                className: 'planning-view',
                'data-testid': 'planning-view'
              }, React.createElement('div', { className: 'kanban-board' },
                columns.map(column => 
                  React.createElement('div', {
                    key: column.id,
                    className: 'kanban-column',
                    'data-testid': 'kanban-column-' + column.status,
                    onDrop: (e) => handleDrop(e, column.status),
                    onDragOver: handleDragOver
                  }, [
                    React.createElement('div', { key: 'header', className: 'column-header' },
                      React.createElement('h3', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
                        column.title,
                        React.createElement('span', {
                          key: 'count',
                          className: 'task-count',
                          'data-testid': 'task-count-' + column.status
                        }, column.tasks.length)
                      ])
                    ),
                    React.createElement('div', { key: 'tasks', className: 'column-tasks' },
                      column.tasks.length === 0 ? 
                        React.createElement('div', {
                          className: 'empty-column-placeholder',
                          'data-testid': 'empty-column-' + column.status
                        }, 'Drop tasks here') :
                        column.tasks.map(task =>
                          React.createElement('div', {
                            key: task.id,
                            className: 'task-card' + (draggedTask?.id === task.id ? ' dragging' : ''),
                            'data-testid': 'task-card-' + task.id,
                            draggable: true,
                            onDragStart: () => handleDragStart(task),
                            onDragEnd: handleDragEnd
                          }, [
                            React.createElement('div', { key: 'header' }, [
                              React.createElement('h4', { key: 'title' }, task.title),
                              React.createElement('span', {
                                key: 'priority',
                                className: 'priority-badge priority-' + task.priority
                              }, task.priority)
                            ]),
                            task.description && React.createElement('p', { key: 'desc' }, task.description),
                            task.assignee && React.createElement('div', { key: 'assignee' }, 'Assigned to: ' + task.assignee)
                          ])
                        )
                    )
                  ])
                )
              ));
            }

            // Test state management
            window.testState = {
              tasks: mockTasks,
              setTasks: function(newTasks) {
                this.tasks = newTasks;
                this.render();
              },
              onTaskMove: function(taskId, newStatus) {
                const updatedTasks = this.tasks.map(task => 
                  task.id === taskId ? { ...task, status: newStatus } : task
                );
                this.setTasks(updatedTasks);
              },
              render: function() {
                ReactDOM.render(
                  React.createElement(PlanningView, {
                    tasks: this.tasks,
                    onTaskMove: this.onTaskMove.bind(this)
                  }),
                  document.getElementById('root')
                );
              }
            };

            // Initial render
            window.testState.render();
          </script>
        </body>
      </html>
    `);
  });

  test('should render PlanningView with demo tasks', async ({ page }) => {
    // Verify the main component renders
    await expect(page.locator('[data-testid="planning-view"]')).toBeVisible();
    
    // Verify all three columns are present
    await expect(page.locator('[data-testid="kanban-column-planned"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column-completed"]')).toBeVisible();
    
    // Verify column titles
    await expect(page.locator('[data-testid="kanban-column-planned"] h3')).toContainText('Planned');
    await expect(page.locator('[data-testid="kanban-column-in-progress"] h3')).toContainText('In Progress');
    await expect(page.locator('[data-testid="kanban-column-completed"] h3')).toContainText('Completed');
    
    // Verify specific tasks are rendered in correct columns
    await expect(page.locator('[data-testid="task-card-task-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-card-task-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-card-task-3"]')).toBeVisible();
    
    // Verify task content
    await expect(page.locator('[data-testid="task-card-task-1"]')).toContainText('Implement user authentication');
    await expect(page.locator('[data-testid="task-card-task-1"]')).toContainText('high');
    await expect(page.locator('[data-testid="task-card-task-1"]')).toContainText('john.doe');
  });

  test('should verify task counts in each column', async ({ page }) => {
    // Check initial task counts
    await expect(page.locator('[data-testid="task-count-planned"]')).toContainText('1');
    await expect(page.locator('[data-testid="task-count-in-progress"]')).toContainText('1');
    await expect(page.locator('[data-testid="task-count-completed"]')).toContainText('1');
    
    // Verify tasks are in correct columns by checking parent column
    const plannedColumn = page.locator('[data-testid="kanban-column-planned"]');
    const inProgressColumn = page.locator('[data-testid="kanban-column-in-progress"]');
    const completedColumn = page.locator('[data-testid="kanban-column-completed"]');
    
    await expect(plannedColumn.locator('[data-testid="task-card-task-1"]')).toBeVisible();
    await expect(inProgressColumn.locator('[data-testid="task-card-task-2"]')).toBeVisible();
    await expect(completedColumn.locator('[data-testid="task-card-task-3"]')).toBeVisible();
  });

  test('should handle drag and drop from Planned to In Progress', async ({ page }) => {
    // Get the task to drag and the target column
    const taskCard = page.locator('[data-testid="task-card-task-1"]');
    const targetColumn = page.locator('[data-testid="kanban-column-in-progress"]');
    
    // Verify initial state
    await expect(page.locator('[data-testid="task-count-planned"]')).toContainText('1');
    await expect(page.locator('[data-testid="task-count-in-progress"]')).toContainText('1');
    
    // Perform drag and drop
    await taskCard.dragTo(targetColumn);
    
    // Wait for the state to update
    await page.waitForTimeout(100);
    
    // Verify the task moved to the in-progress column
    await expect(page.locator('[data-testid="kanban-column-in-progress"] [data-testid="task-card-task-1"]')).toBeVisible();
    
    // Verify updated task counts
    await expect(page.locator('[data-testid="task-count-planned"]')).toContainText('0');
    await expect(page.locator('[data-testid="task-count-in-progress"]')).toContainText('2');
    
    // Verify the task is no longer in the planned column
    await expect(page.locator('[data-testid="kanban-column-planned"] [data-testid="task-card-task-1"]')).not.toBeVisible();
  });

  test('should handle empty task directory fallback', async ({ page }) => {
    // Set empty tasks
    await page.evaluate(() => {
      window.testState.setTasks([]);
    });
    
    // Verify empty state is displayed
    await expect(page.locator('[data-testid="planning-view-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="planning-view-empty"]')).toContainText('No tasks found');
    
    // Verify kanban board is not displayed
    await expect(page.locator('[data-testid="planning-view"]')).not.toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Create a loading state component
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test - Loading</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            .loading-spinner { display: flex; align-items: center; justify-content: center; height: 256px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            function PlanningView({ loading = false }) {
              if (loading) {
                return React.createElement('div', {
                  className: 'planning-view-loading',
                  'data-testid': 'planning-view-loading'
                }, React.createElement('div', { className: 'loading-spinner' }, 'Loading tasks...'));
              }
              return React.createElement('div', { 'data-testid': 'planning-view' }, 'Loaded');
            }

            ReactDOM.render(
              React.createElement(PlanningView, { loading: true }),
              document.getElementById('root')
            );
          </script>
        </body>
      </html>
    `);
    
    // Verify loading state is displayed
    await expect(page.locator('[data-testid="planning-view-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="planning-view-loading"]')).toContainText('Loading tasks...');
    
    // Verify main view is not displayed during loading
    await expect(page.locator('[data-testid="planning-view"]')).not.toBeVisible();
  });

  test('should handle error state for malformed files', async ({ page }) => {
    // Create an error state component
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test - Error</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            .error-message { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; color: #dc2626; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            function PlanningView({ error = null }) {
              if (error) {
                return React.createElement('div', {
                  className: 'planning-view-error',
                  'data-testid': 'planning-view-error'
                }, React.createElement('div', { className: 'error-message' }, error));
              }
              return React.createElement('div', { 'data-testid': 'planning-view' }, 'Loaded');
            }

            ReactDOM.render(
              React.createElement(PlanningView, { error: 'Failed to parse task data: Invalid JSON format' }),
              document.getElementById('root')
            );
          </script>
        </body>
      </html>
    `);
    
    // Verify error state is displayed
    await expect(page.locator('[data-testid="planning-view-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="planning-view-error"]')).toContainText('Failed to parse task data');
    
    // Verify main view is not displayed during error
    await expect(page.locator('[data-testid="planning-view"]')).not.toBeVisible();
  });

  test('should show empty column placeholders when columns are empty', async ({ page }) => {
    // Set tasks with only one task in completed status
    await page.evaluate(() => {
      const singleTask = [{
        id: 'task-only',
        title: 'Only task',
        status: 'completed',
        priority: 'medium'
      }];
      window.testState.setTasks(singleTask);
    });
    
    // Verify empty placeholders are shown for planned and in-progress columns
    await expect(page.locator('[data-testid="empty-column-planned"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-column-in-progress"]')).toBeVisible();
    
    // Verify the completed column has the task
    await expect(page.locator('[data-testid="kanban-column-completed"] [data-testid="task-card-task-only"]')).toBeVisible();
    
    // Verify task counts are correct
    await expect(page.locator('[data-testid="task-count-planned"]')).toContainText('0');
    await expect(page.locator('[data-testid="task-count-in-progress"]')).toContainText('0');
    await expect(page.locator('[data-testid="task-count-completed"]')).toContainText('1');
  });

  test('should maintain task data integrity during drag operations', async ({ page }) => {
    // Verify initial task data
    const initialTaskTitle = await page.locator('[data-testid="task-card-task-1"] h4').textContent();
    const initialPriority = await page.locator('[data-testid="task-card-task-1"] .priority-badge').textContent();
    
    // Perform drag operation
    const taskCard = page.locator('[data-testid="task-card-task-1"]');
    const targetColumn = page.locator('[data-testid="kanban-column-in-progress"]');
    await taskCard.dragTo(targetColumn);
    
    // Wait for operation to complete
    await page.waitForTimeout(100);
    
    // Verify task data remains intact after move
    const movedTaskTitle = await page.locator('[data-testid="kanban-column-in-progress"] [data-testid="task-card-task-1"] h4').textContent();
    const movedPriority = await page.locator('[data-testid="kanban-column-in-progress"] [data-testid="task-card-task-1"] .priority-badge').textContent();
    
    expect(movedTaskTitle).toBe(initialTaskTitle);
    expect(movedPriority).toBe(initialPriority);
  });
});