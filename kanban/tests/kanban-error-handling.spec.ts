import { test, expect } from '@playwright/test';

/**
 * Kanban UI Tests - Error Handling and Edge Cases
 * 
 * Tests error boundaries, malformed data handling, and fallback scenarios
 * for robust Kanban UI behavior under various failure conditions.
 */

test.describe('Kanban Error Handling and Edge Cases', () => {

  test('should handle malformed task data gracefully', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test - Malformed Data</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .error-boundary { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; color: #dc2626; }
            .task-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 8px 0; }
            .kanban-column { background: #f9fafb; padding: 16px; margin: 8px; border-radius: 8px; }
            .warning-badge { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Error Boundary Component
            class ErrorBoundary extends React.Component {
              constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
              }

              static getDerivedStateFromError(error) {
                return { hasError: true, error: error.message };
              }

              componentDidCatch(error, errorInfo) {
                console.error('Kanban UI Error:', error, errorInfo);
              }

              render() {
                if (this.state.hasError) {
                  return React.createElement('div', {
                    className: 'error-boundary',
                    'data-testid': 'error-boundary'
                  }, [
                    React.createElement('h3', { key: 'title' }, 'Something went wrong'),
                    React.createElement('p', { key: 'message' }, 'Error: ' + this.state.error),
                    React.createElement('button', {
                      key: 'retry',
                      'data-testid': 'retry-button',
                      onClick: () => this.setState({ hasError: false, error: null })
                    }, 'Retry')
                  ]);
                }

                return this.props.children;
              }
            }

            // Safe Task Card Component with validation
            function SafeTaskCard({ task, onError }) {
              React.useEffect(() => {
                // Validate required fields
                if (!task.id) {
                  onError && onError('Task missing required ID field');
                  return;
                }
                if (!task.title) {
                  onError && onError('Task missing required title field');
                  return;
                }
                if (!['planned', 'in-progress', 'completed'].includes(task.status)) {
                  onError && onError('Task has invalid status: ' + task.status);
                  return;
                }
              }, [task, onError]);

              // Handle missing or invalid data
              const title = task.title || 'Untitled Task';
              const status = ['planned', 'in-progress', 'completed'].includes(task.status) ? task.status : 'planned';
              const priority = ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium';
              const hasWarnings = !task.title || !task.id || !['planned', 'in-progress', 'completed'].includes(task.status);

              return React.createElement('div', {
                className: 'task-card',
                'data-testid': 'task-card-' + (task.id || 'invalid'),
                'data-task-status': status
              }, [
                React.createElement('div', { key: 'header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' } }, [
                  React.createElement('h4', { key: 'title' }, title),
                  hasWarnings && React.createElement('span', {
                    key: 'warning',
                    className: 'warning-badge',
                    'data-testid': 'task-warning-' + (task.id || 'invalid')
                  }, 'Invalid')
                ]),
                task.description && React.createElement('p', { key: 'desc', style: { fontSize: '14px', color: '#666' } }, task.description),
                React.createElement('div', { key: 'meta', style: { fontSize: '12px', color: '#888' } }, [
                  'Priority: ' + priority,
                  task.assignee && ' | Assigned to: ' + task.assignee
                ])
              ]);
            }

            // Robust Kanban Column Component
            function RobustKanbanColumn({ title, status, tasks, onError }) {
              const [validTasks, setValidTasks] = React.useState([]);
              const [invalidTasks, setInvalidTasks] = React.useState([]);

              React.useEffect(() => {
                const valid = [];
                const invalid = [];

                tasks.forEach(task => {
                  if (task && typeof task === 'object' && task.id && task.title) {
                    valid.push(task);
                  } else {
                    invalid.push(task);
                  }
                });

                setValidTasks(valid);
                setInvalidTasks(invalid);

                if (invalid.length > 0) {
                  onError && onError('Found ' + invalid.length + ' invalid tasks in ' + title + ' column');
                }
              }, [tasks, title, onError]);

              return React.createElement('div', {
                className: 'kanban-column',
                'data-testid': 'kanban-column-' + status
              }, [
                React.createElement('h3', { key: 'title' }, title + ' (' + validTasks.length + ')'),
                invalidTasks.length > 0 && React.createElement('div', {
                  key: 'invalid-warning',
                  className: 'warning-badge',
                  'data-testid': 'invalid-tasks-warning-' + status,
                  style: { marginBottom: '8px', display: 'block' }
                }, invalidTasks.length + ' invalid tasks filtered out'),
                React.createElement('div', { key: 'tasks' },
                  validTasks.map((task, index) =>
                    React.createElement(SafeTaskCard, {
                      key: task.id || 'invalid-' + index,
                      task: task,
                      onError: onError
                    })
                  )
                )
              ]);
            }

            // Main Resilient Planning View
            function ResilientPlanningView({ tasks = [], onError }) {
              const [errors, setErrors] = React.useState([]);

              const handleError = (error) => {
                setErrors(prev => [...prev, error]);
                onError && onError(error);
              };

              const clearErrors = () => {
                setErrors([]);
              };

              // Safely categorize tasks
              const safeTasks = Array.isArray(tasks) ? tasks : [];
              const plannedTasks = safeTasks.filter(task => task && task.status === 'planned');
              const inProgressTasks = safeTasks.filter(task => task && task.status === 'in-progress');
              const completedTasks = safeTasks.filter(task => task && task.status === 'completed');

              return React.createElement('div', {
                'data-testid': 'resilient-planning-view'
              }, [
                errors.length > 0 && React.createElement('div', {
                  key: 'errors',
                  className: 'error-boundary',
                  'data-testid': 'error-summary',
                  style: { marginBottom: '16px' }
                }, [
                  React.createElement('h4', { key: 'title' }, 'Data Issues Detected:'),
                  React.createElement('ul', { key: 'list' },
                    errors.map((error, index) =>
                      React.createElement('li', { key: index }, error)
                    )
                  ),
                  React.createElement('button', {
                    key: 'clear',
                    'data-testid': 'clear-errors-button',
                    onClick: clearErrors
                  }, 'Clear Errors')
                ]),
                React.createElement('div', {
                  key: 'board',
                  style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }
                }, [
                  React.createElement(RobustKanbanColumn, {
                    key: 'planned',
                    title: 'Planned',
                    status: 'planned',
                    tasks: plannedTasks,
                    onError: handleError
                  }),
                  React.createElement(RobustKanbanColumn, {
                    key: 'in-progress',
                    title: 'In Progress',
                    status: 'in-progress',
                    tasks: inProgressTasks,
                    onError: handleError
                  }),
                  React.createElement(RobustKanbanColumn, {
                    key: 'completed',
                    title: 'Completed',
                    status: 'completed',
                    tasks: completedTasks,
                    onError: handleError
                  })
                ])
              ]);
            }

            // Test with malformed data
            const malformedData = [
              // Valid task
              { id: 'task-1', title: 'Valid Task', status: 'planned', priority: 'high' },
              // Missing ID
              { title: 'Task without ID', status: 'in-progress', priority: 'medium' },
              // Missing title
              { id: 'task-3', status: 'completed', priority: 'low' },
              // Invalid status
              { id: 'task-4', title: 'Invalid Status Task', status: 'unknown', priority: 'high' },
              // Null task
              null,
              // String instead of object
              'invalid-task-string',
              // Valid task with extra properties
              { id: 'task-5', title: 'Task with Extra Props', status: 'planned', priority: 'medium', extraProp: 'ignored' }
            ];

            ReactDOM.render(
              React.createElement(ErrorBoundary, {},
                React.createElement(ResilientPlanningView, { tasks: malformedData })
              ),
              document.getElementById('root')
            );
          </script>
        </body>
      </html>
    `);

    // Verify the component renders despite malformed data
    await expect(page.locator('[data-testid="resilient-planning-view"]')).toBeVisible();

    // Verify error summary is displayed
    await expect(page.locator('[data-testid="error-summary"]')).toBeVisible();

    // Verify that valid tasks are still displayed
    await expect(page.locator('[data-testid="task-card-task-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-card-task-5"]')).toBeVisible();

    // Verify warning indicators for invalid tasks
    await expect(page.locator('[data-testid="invalid-tasks-warning-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="invalid-tasks-warning-completed"]')).toBeVisible();

    // Verify error can be cleared
    await page.locator('[data-testid="clear-errors-button"]').click();
    await expect(page.locator('[data-testid="error-summary"]')).not.toBeVisible();
  });

  test('should handle empty or null task arrays', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test - Empty Data</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            .empty-state { text-align: center; padding: 40px; color: #666; }
            .kanban-column { background: #f9fafb; padding: 16px; margin: 8px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            function EmptyStateKanban({ tasks }) {
              // Handle various empty/null states
              if (!tasks) {
                return React.createElement('div', {
                  className: 'empty-state',
                  'data-testid': 'null-tasks-state'
                }, 'No task data available');
              }

              if (!Array.isArray(tasks)) {
                return React.createElement('div', {
                  className: 'empty-state',
                  'data-testid': 'invalid-tasks-type'
                }, 'Invalid task data format');
              }

              if (tasks.length === 0) {
                return React.createElement('div', {
                  className: 'empty-state',
                  'data-testid': 'empty-tasks-array'
                }, 'No tasks found - create your first task to get started');
              }

              // Normal kanban view
              return React.createElement('div', {
                'data-testid': 'normal-kanban-view'
              }, 'Kanban board with ' + tasks.length + ' tasks');
            }

            // Test different empty states
            window.testEmptyStates = function(stateType) {
              let testData;
              switch(stateType) {
                case 'null':
                  testData = null;
                  break;
                case 'undefined':
                  testData = undefined;
                  break;
                case 'empty-array':
                  testData = [];
                  break;
                case 'non-array':
                  testData = { not: 'an array' };
                  break;
                default:
                  testData = [{ id: 'task-1', title: 'Test Task', status: 'planned' }];
              }

              ReactDOM.render(
                React.createElement(EmptyStateKanban, { tasks: testData }),
                document.getElementById('root')
              );
            };

            // Start with null state
            window.testEmptyStates('null');
          </script>
        </body>
      </html>
    `);

    // Test null tasks
    await expect(page.locator('[data-testid="null-tasks-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="null-tasks-state"]')).toContainText('No task data available');

    // Test undefined tasks
    await page.evaluate(() => window.testEmptyStates('undefined'));
    await expect(page.locator('[data-testid="null-tasks-state"]')).toBeVisible();

    // Test empty array
    await page.evaluate(() => window.testEmptyStates('empty-array'));
    await expect(page.locator('[data-testid="empty-tasks-array"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-tasks-array"]')).toContainText('No tasks found');

    // Test non-array data
    await page.evaluate(() => window.testEmptyStates('non-array'));
    await expect(page.locator('[data-testid="invalid-tasks-type"]')).toBeVisible();

    // Test normal data
    await page.evaluate(() => window.testEmptyStates('normal'));
    await expect(page.locator('[data-testid="normal-kanban-view"]')).toBeVisible();
  });

  test('should handle API/session bridge failures', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test - API Failures</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            .error-message { background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; color: #dc2626; margin: 8px 0; }
            .retry-button { background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
            .loading-state { text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Mock session bridge with failure scenarios
            const mockSessionBridge = {
              loadTasks: async (shouldFail = false) => {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (shouldFail) {
                  throw new Error('Failed to connect to session bridge');
                }
                return [
                  { id: 'task-1', title: 'Test Task', status: 'planned', priority: 'high' }
                ];
              },
              updateTaskStatus: async (taskId, newStatus, shouldFail = false) => {
                await new Promise(resolve => setTimeout(resolve, 150));
                if (shouldFail) {
                  throw new Error('Failed to update task status');
                }
                return { id: taskId, status: newStatus };
              }
            };

            function ApiAwareKanban() {
              const [tasks, setTasks] = React.useState([]);
              const [loading, setLoading] = React.useState(false);
              const [error, setError] = React.useState(null);
              const [retryCount, setRetryCount] = React.useState(0);

              const loadTasks = async (shouldFail = false) => {
                setLoading(true);
                setError(null);
                try {
                  const loadedTasks = await mockSessionBridge.loadTasks(shouldFail);
                  setTasks(loadedTasks);
                  setRetryCount(0);
                } catch (err) {
                  setError(err.message);
                  setRetryCount(prev => prev + 1);
                } finally {
                  setLoading(false);
                }
              };

              const handleTaskMove = async (taskId, newStatus, shouldFail = false) => {
                try {
                  await mockSessionBridge.updateTaskStatus(taskId, newStatus, shouldFail);
                  setTasks(prev => prev.map(task => 
                    task.id === taskId ? { ...task, status: newStatus } : task
                  ));
                } catch (err) {
                  setError('Failed to move task: ' + err.message);
                }
              };

              React.useEffect(() => {
                loadTasks(false); // Start with successful load
              }, []);

              // Expose test functions
              React.useEffect(() => {
                window.kanbanTestUtils = {
                  triggerLoadFailure: () => loadTasks(true),
                  triggerMoveFailure: () => handleTaskMove('task-1', 'in-progress', true),
                  retryLoad: () => loadTasks(false),
                  clearError: () => setError(null)
                };
              }, []);

              if (loading) {
                return React.createElement('div', {
                  className: 'loading-state',
                  'data-testid': 'api-loading-state'
                }, 'Loading tasks from session bridge...');
              }

              return React.createElement('div', {
                'data-testid': 'api-aware-kanban'
              }, [
                error && React.createElement('div', {
                  key: 'error',
                  className: 'error-message',
                  'data-testid': 'api-error-message'
                }, [
                  React.createElement('p', { key: 'message' }, error),
                  React.createElement('p', { key: 'retry-info' }, 'Retry attempt: ' + retryCount),
                  React.createElement('button', {
                    key: 'retry',
                    className: 'retry-button',
                    'data-testid': 'retry-api-button',
                    onClick: () => window.kanbanTestUtils.retryLoad()
                  }, 'Retry'),
                  React.createElement('button', {
                    key: 'clear',
                    'data-testid': 'clear-api-error-button',
                    onClick: () => window.kanbanTestUtils.clearError(),
                    style: { marginLeft: '8px' }
                  }, 'Dismiss')
                ]),
                React.createElement('div', { key: 'content' }, [
                  React.createElement('h3', { key: 'title' }, 'Kanban Board'),
                  React.createElement('p', { key: 'info' }, 'Tasks loaded: ' + tasks.length),
                  tasks.map(task =>
                    React.createElement('div', {
                      key: task.id,
                      'data-testid': 'task-' + task.id,
                      style: { padding: '8px', border: '1px solid #ccc', margin: '4px 0' }
                    }, task.title + ' (' + task.status + ')')
                  ),
                  React.createElement('div', { key: 'test-actions', style: { marginTop: '16px' } }, [
                    React.createElement('button', {
                      key: 'trigger-load-fail',
                      'data-testid': 'trigger-load-failure',
                      onClick: () => window.kanbanTestUtils.triggerLoadFailure()
                    }, 'Trigger Load Failure'),
                    React.createElement('button', {
                      key: 'trigger-move-fail',
                      'data-testid': 'trigger-move-failure',
                      onClick: () => window.kanbanTestUtils.triggerMoveFailure(),
                      style: { marginLeft: '8px' }
                    }, 'Trigger Move Failure')
                  ])
                ])
              ]);
            }

            ReactDOM.render(
              React.createElement(ApiAwareKanban),
              document.getElementById('root')
            );
          </script>
        </body>
      </html>
    `);

    // Wait for initial load
    await expect(page.locator('[data-testid="api-aware-kanban"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-task-1"]')).toBeVisible();

    // Test load failure
    await page.locator('[data-testid="trigger-load-failure"]').click();
    await expect(page.locator('[data-testid="api-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-error-message"]')).toContainText('Failed to connect to session bridge');

    // Test retry functionality
    await page.locator('[data-testid="retry-api-button"]').click();
    await expect(page.locator('[data-testid="api-loading-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-error-message"]')).not.toBeVisible();

    // Test move failure
    await page.locator('[data-testid="trigger-move-failure"]').click();
    await expect(page.locator('[data-testid="api-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-error-message"]')).toContainText('Failed to move task');

    // Test error dismissal
    await page.locator('[data-testid="clear-api-error-button"]').click();
    await expect(page.locator('[data-testid="api-error-message"]')).not.toBeVisible();
  });

  test('should validate task schema and show validation errors', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test - Schema Validation</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            .validation-error { background: #fef2f2; border-left: 4px solid #ef4444; padding: 8px 12px; margin: 4px 0; }
            .task-card { border: 1px solid #e5e7eb; padding: 8px; margin: 4px 0; }
            .task-card.invalid { border-color: #ef4444; }
            .validation-summary { background: #fffbeb; border: 1px solid #fcd34d; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Task schema validation
            function validateTask(task) {
              const errors = [];
              const warnings = [];

              // Required fields
              if (!task) {
                return { errors: ['Task is null or undefined'], warnings: [] };
              }
              if (!task.id) errors.push('Missing required field: id');
              if (!task.title) errors.push('Missing required field: title');
              if (!task.status) errors.push('Missing required field: status');

              // Field type validation
              if (task.id && typeof task.id !== 'string') {
                errors.push('Field "id" must be a string');
              }
              if (task.title && typeof task.title !== 'string') {
                errors.push('Field "title" must be a string');
              }

              // Enum validation
              const validStatuses = ['planned', 'in-progress', 'completed'];
              if (task.status && !validStatuses.includes(task.status)) {
                errors.push('Field "status" must be one of: ' + validStatuses.join(', '));
              }

              const validPriorities = ['low', 'medium', 'high'];
              if (task.priority && !validPriorities.includes(task.priority)) {
                warnings.push('Field "priority" should be one of: ' + validPriorities.join(', '));
              }

              // Optional field validation
              if (task.assignee && typeof task.assignee !== 'string') {
                warnings.push('Field "assignee" should be a string');
              }

              // Date validation
              if (task.createdAt && isNaN(Date.parse(task.createdAt))) {
                warnings.push('Field "createdAt" is not a valid date');
              }
              if (task.updatedAt && isNaN(Date.parse(task.updatedAt))) {
                warnings.push('Field "updatedAt" is not a valid date');
              }

              return { errors, warnings };
            }

            function ValidatedTaskCard({ task, index }) {
              const validation = validateTask(task);
              const hasErrors = validation.errors.length > 0;
              const hasWarnings = validation.warnings.length > 0;

              return React.createElement('div', {
                className: 'task-card' + (hasErrors ? ' invalid' : ''),
                'data-testid': 'validated-task-' + (task?.id || 'invalid-' + index)
              }, [
                React.createElement('h4', { key: 'title' }, task?.title || 'Invalid Task'),
                hasErrors && React.createElement('div', { key: 'errors' },
                  validation.errors.map((error, i) =>
                    React.createElement('div', {
                      key: i,
                      className: 'validation-error',
                      'data-testid': 'validation-error-' + i
                    }, '❌ ' + error)
                  )
                ),
                hasWarnings && React.createElement('div', { key: 'warnings' },
                  validation.warnings.map((warning, i) =>
                    React.createElement('div', {
                      key: i,
                      style: { background: '#fffbeb', padding: '4px 8px', margin: '2px 0' },
                      'data-testid': 'validation-warning-' + i
                    }, '⚠️ ' + warning)
                  )
                )
              ]);
            }

            function SchemaValidatedKanban({ tasks }) {
              const [validationSummary, setValidationSummary] = React.useState({ totalErrors: 0, totalWarnings: 0 });

              React.useEffect(() => {
                let totalErrors = 0;
                let totalWarnings = 0;

                tasks.forEach(task => {
                  const validation = validateTask(task);
                  totalErrors += validation.errors.length;
                  totalWarnings += validation.warnings.length;
                });

                setValidationSummary({ totalErrors, totalWarnings });
              }, [tasks]);

              return React.createElement('div', {
                'data-testid': 'schema-validated-kanban'
              }, [
                (validationSummary.totalErrors > 0 || validationSummary.totalWarnings > 0) && 
                React.createElement('div', {
                  key: 'summary',
                  className: 'validation-summary',
                  'data-testid': 'validation-summary'
                }, [
                  React.createElement('h4', { key: 'title' }, 'Data Validation Summary'),
                  React.createElement('p', { key: 'stats' }, 
                    'Found ' + validationSummary.totalErrors + ' errors and ' + 
                    validationSummary.totalWarnings + ' warnings in ' + tasks.length + ' tasks'
                  )
                ]),
                React.createElement('div', { key: 'tasks' },
                  tasks.map((task, index) =>
                    React.createElement(ValidatedTaskCard, {
                      key: task?.id || 'invalid-' + index,
                      task: task,
                      index: index
                    })
                  )
                )
              ]);
            }

            // Test data with various validation issues
            const testTasks = [
              // Valid task
              { id: 'task-1', title: 'Valid Task', status: 'planned', priority: 'high' },
              // Missing required fields
              { title: 'No ID Task', status: 'in-progress' },
              { id: 'task-3', status: 'completed' }, // Missing title
              { id: 'task-4', title: 'No Status Task' }, // Missing status
              // Invalid field types
              { id: 123, title: 'Numeric ID', status: 'planned' },
              { id: 'task-6', title: ['Array', 'Title'], status: 'planned' },
              // Invalid enum values
              { id: 'task-7', title: 'Invalid Status', status: 'unknown', priority: 'urgent' },
              // Date validation issues
              { id: 'task-8', title: 'Bad Dates', status: 'planned', createdAt: 'not-a-date', updatedAt: 'also-bad' },
              // Null task
              null
            ];

            ReactDOM.render(
              React.createElement(SchemaValidatedKanban, { tasks: testTasks }),
              document.getElementById('root')
            );
          </script>
        </body>
      </html>
    `);

    // Verify validation summary appears
    await expect(page.locator('[data-testid="validation-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-summary"]')).toContainText('Found');
    await expect(page.locator('[data-testid="validation-summary"]')).toContainText('errors and');
    await expect(page.locator('[data-testid="validation-summary"]')).toContainText('warnings');

    // Verify specific validation errors are shown
    await expect(page.locator('[data-testid="validation-error-0"]')).toBeVisible();
    
    // Check for various types of validation errors
    const errorElements = await page.locator('[data-testid^="validation-error-"]').all();
    expect(errorElements.length).toBeGreaterThan(0);

    // Verify warnings are also displayed
    const warningElements = await page.locator('[data-testid^="validation-warning-"]').all();
    expect(warningElements.length).toBeGreaterThan(0);

    // Verify invalid tasks are marked visually
    await expect(page.locator('.task-card.invalid')).toHaveCount(5); // Should have multiple invalid tasks
  });
});

test.describe('Kanban Drag and Drop Edge Cases', () => {

  test('should handle drag operations with invalid targets', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kanban UI Test - Drag Edge Cases</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            .kanban-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .kanban-column { background: #f9fafb; padding: 16px; border-radius: 8px; min-height: 200px; }
            .task-card { background: white; padding: 12px; margin: 8px 0; border-radius: 6px; cursor: move; border: 1px solid #e5e7eb; }
            .task-card.dragging { opacity: 0.5; }
            .drop-zone-invalid { border: 2px dashed #ef4444; }
            .drag-feedback { position: fixed; top: 10px; right: 10px; background: #1f2937; color: white; padding: 8px 12px; border-radius: 4px; z-index: 1000; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            function AdvancedDragDropKanban() {
              const [tasks, setTasks] = React.useState([
                { id: 'task-1', title: 'Draggable Task 1', status: 'planned' },
                { id: 'task-2', title: 'Draggable Task 2', status: 'in-progress' }
              ]);
              const [draggedTask, setDraggedTask] = React.useState(null);
              const [dragFeedback, setDragFeedback] = React.useState('');
              const [invalidDropAttempts, setInvalidDropAttempts] = React.useState(0);

              const handleDragStart = (task) => {
                setDraggedTask(task);
                setDragFeedback('Dragging: ' + task.title);
              };

              const handleDragEnd = () => {
                setDraggedTask(null);
                setDragFeedback('');
              };

              const handleDrop = (e, targetStatus) => {
                e.preventDefault();
                if (!draggedTask) {
                  setInvalidDropAttempts(prev => prev + 1);
                  setDragFeedback('❌ No task being dragged');
                  return;
                }

                if (draggedTask.status === targetStatus) {
                  setDragFeedback('⚠️ Task already in ' + targetStatus);
                  return;
                }

                // Simulate some tasks that cannot be moved
                if (draggedTask.id === 'task-locked') {
                  setInvalidDropAttempts(prev => prev + 1);
                  setDragFeedback('❌ This task is locked');
                  return;
                }

                setTasks(prev => prev.map(task => 
                  task.id === draggedTask.id ? { ...task, status: targetStatus } : task
                ));
                setDragFeedback('✅ Moved to ' + targetStatus);
                setDraggedTask(null);
              };

              const handleDragOver = (e) => {
                e.preventDefault();
                if (!draggedTask) {
                  e.dataTransfer.dropEffect = 'none';
                }
              };

              const handleInvalidDrop = (e) => {
                e.preventDefault();
                setInvalidDropAttempts(prev => prev + 1);
                setDragFeedback('❌ Invalid drop zone');
                setDraggedTask(null);
              };

              const columns = [
                { id: 'planned', title: 'Planned', status: 'planned' },
                { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
                { id: 'completed', title: 'Completed', status: 'completed' }
              ];

              return React.createElement('div', {
                'data-testid': 'advanced-drag-drop-kanban'
              }, [
                dragFeedback && React.createElement('div', {
                  key: 'feedback',
                  className: 'drag-feedback',
                  'data-testid': 'drag-feedback'
                }, dragFeedback),
                
                React.createElement('div', {
                  key: 'stats',
                  style: { marginBottom: '16px' },
                  'data-testid': 'invalid-drop-counter'
                }, 'Invalid drop attempts: ' + invalidDropAttempts),

                React.createElement('div', { key: 'board', className: 'kanban-board' },
                  columns.map(column => {
                    const columnTasks = tasks.filter(task => task.status === column.status);
                    return React.createElement('div', {
                      key: column.id,
                      className: 'kanban-column',
                      'data-testid': 'drop-zone-' + column.status,
                      onDrop: (e) => handleDrop(e, column.status),
                      onDragOver: handleDragOver
                    }, [
                      React.createElement('h3', { key: 'title' }, column.title),
                      ...columnTasks.map(task =>
                        React.createElement('div', {
                          key: task.id,
                          className: 'task-card' + (draggedTask?.id === task.id ? ' dragging' : ''),
                          'data-testid': 'draggable-task-' + task.id,
                          draggable: true,
                          onDragStart: () => handleDragStart(task),
                          onDragEnd: handleDragEnd
                        }, task.title)
                      )
                    ]);
                  })
                ),

                // Invalid drop zone for testing
                React.createElement('div', {
                  key: 'invalid-zone',
                  style: { 
                    marginTop: '16px', 
                    padding: '20px', 
                    border: '2px dashed #ef4444', 
                    textAlign: 'center' 
                  },
                  'data-testid': 'invalid-drop-zone',
                  onDrop: handleInvalidDrop,
                  onDragOver: (e) => e.preventDefault()
                }, 'Invalid Drop Zone (for testing)')
              ]);
            }

            ReactDOM.render(
              React.createElement(AdvancedDragDropKanban),
              document.getElementById('root')
            );
          </script>
        </body>
      </html>
    `);

    // Test normal drag and drop
    const task1 = page.locator('[data-testid="draggable-task-task-1"]');
    const inProgressZone = page.locator('[data-testid="drop-zone-in-progress"]');
    
    await task1.dragTo(inProgressZone);
    await expect(page.locator('[data-testid="drag-feedback"]')).toContainText('✅ Moved to in-progress');

    // Test drop on invalid zone
    const task2 = page.locator('[data-testid="draggable-task-task-2"]');
    const invalidZone = page.locator('[data-testid="invalid-drop-zone"]');
    
    await task2.dragTo(invalidZone);
    await expect(page.locator('[data-testid="drag-feedback"]')).toContainText('❌ Invalid drop zone');
    await expect(page.locator('[data-testid="invalid-drop-counter"]')).toContainText('Invalid drop attempts: 1');

    // Test dropping on same column (should show warning)
    const task1InProgress = page.locator('[data-testid="drop-zone-in-progress"] [data-testid="draggable-task-task-1"]');
    await task1InProgress.dragTo(inProgressZone);
    await expect(page.locator('[data-testid="drag-feedback"]')).toContainText('⚠️ Task already in in-progress');
  });
});