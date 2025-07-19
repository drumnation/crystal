# Kanban UI Test Suite

A comprehensive signal-driven test suite for validating Kanban UI layout, drag logic, and task rendering using Playwright.

## Overview

This test suite provides complete coverage for a Kanban board UI with the following components:
- **PlanningView**: Main kanban board component with drag-and-drop functionality
- **Task Management**: Create, update, delete, and move tasks between columns
- **Error Handling**: Graceful handling of malformed data and API failures
- **Session Bridge**: Mock integration with backend services

## Test Structure

```
kanban/tests/
├── mocks/
│   └── taskData.ts           # Mock data and session bridge
├── planning-view.spec.ts     # Core PlanningView component tests
├── kanban-error-handling.spec.ts # Error scenarios and edge cases
├── test-runner.spec.ts       # Comprehensive test suite runner
└── README.md                 # This documentation
```

## Test Categories

### 1. Core Functionality (`planning-view.spec.ts`)
- ✅ **Component Rendering**: PlanningView loads with correct layout
- ✅ **Task Display**: Tasks render in appropriate columns with metadata
- ✅ **Column Structure**: Three-column layout (Planned → In Progress → Completed)
- ✅ **Task Counts**: Accurate count display for each column
- ✅ **Drag and Drop**: Full drag-and-drop functionality between columns
- ✅ **State Management**: Task status updates and UI synchronization

### 2. Error Handling (`kanban-error-handling.spec.ts`)
- ✅ **Malformed Data**: Graceful handling of invalid task objects
- ✅ **Schema Validation**: Field validation with error messages
- ✅ **API Failures**: Session bridge connection errors and retries
- ✅ **Empty States**: Proper fallbacks for null/undefined/empty data
- ✅ **Drag Edge Cases**: Invalid drop targets and locked tasks
- ✅ **Error Boundaries**: React error boundary integration

### 3. Comprehensive Testing (`test-runner.spec.ts`)
- ✅ **Smoke Tests**: All core functionality verification
- ✅ **Coverage Reports**: Visual test coverage metrics
- ✅ **Test Scenarios**: Interactive demonstration of all test cases
- ✅ **Performance Testing**: Large dataset handling

## Key Features Tested

### Drag and Drop Logic
```typescript
// Test validates:
- Drag start/end event handling
- Visual feedback during drag operations
- Drop validation and status updates
- Invalid drop zone handling
- Task data integrity during moves
```

### Task Rendering
```typescript
// Validates:
- Task card layout and styling
- Priority badge colors and text
- Assignee information display
- Timestamp formatting
- Status-based column placement
```

### Error Boundaries
```typescript
// Tests include:
- Malformed JSON task data
- Missing required fields (id, title, status)
- Invalid enum values (status, priority)
- Null/undefined task objects
- API connection failures
- Network timeout scenarios
```

### Session Bridge Mock
```typescript
// Provides realistic mock for:
- Task loading (with success/failure scenarios)
- Task status updates
- Task creation and deletion
- Network latency simulation
- Error condition testing
```

## Running the Tests

### Prerequisites
- Node.js 22.14.0+
- pnpm 8.0.0+
- Playwright configured (already set up in Crystal)

### Execute Test Suite
```bash
# Run all Kanban UI tests
npx playwright test kanban/tests/

# Run specific test files
npx playwright test kanban/tests/planning-view.spec.ts
npx playwright test kanban/tests/kanban-error-handling.spec.ts
npx playwright test kanban/tests/test-runner.spec.ts

# Run with UI mode for debugging
npx playwright test kanban/tests/ --ui

# Run in headed mode to see browser
npx playwright test kanban/tests/ --headed
```

### Test Reports
```bash
# Generate HTML report
npx playwright show-report

# View coverage report (in test-runner.spec.ts)
npx playwright test kanban/tests/test-runner.spec.ts --headed
```

## Mock Data Structure

### Task Interface
```typescript
interface Task {
  id: string;                    // Unique identifier
  title: string;                 // Task title/name
  description: string;           // Detailed description
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;             // Optional assignee
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### Column Structure
```typescript
interface KanbanColumn {
  id: string;                    // Column identifier
  title: string;                 // Display name
  status: Task['status'];        // Corresponding task status
  tasks: Task[];                 // Tasks in this column
}
```

## Test Data Scenarios

### Normal Operation
- 3 valid tasks across all columns
- Complete task metadata
- All drag operations enabled

### Empty State
- No tasks available
- Empty state message display
- Column placeholders shown

### Malformed Data
- Tasks missing required fields
- Invalid enum values
- Mixed valid/invalid data
- Error indicators and warnings

### Large Dataset
- 20+ tasks for performance testing
- Distributed across columns
- Smooth rendering and interactions

## Component Integration

### PlanningView Props
```typescript
interface PlanningViewProps {
  tasks?: Task[];                          // Task array
  onTaskMove?: (taskId: string, newStatus: Task['status']) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskDelete?: (taskId: string) => void;
  loading?: boolean;                       // Loading state
  error?: string | null;                   // Error message
}
```

### Session Bridge Interface
```typescript
interface SessionBridge {
  loadTasks(): Promise<Task[]>;
  updateTaskStatus(taskId: string, status: Task['status']): Promise<Task>;
  createTask(taskData: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
}
```

## Validation Rules

### Required Fields
- `id`: Non-empty string
- `title`: Non-empty string  
- `status`: Valid enum value

### Optional Fields
- `description`: String or empty
- `priority`: Valid enum or defaults to 'medium'
- `assignee`: String or undefined
- `createdAt`/`updatedAt`: Valid ISO dates

### Business Rules
- Tasks cannot be moved to the same column
- Invalid tasks are filtered but not hidden
- Error states allow retry operations
- Drag operations preserve task data integrity

## Performance Considerations

### Optimizations Tested
- Large task list rendering (20+ items)
- Smooth drag and drop operations
- Efficient re-rendering on state changes
- Memory usage during extended interactions

### Performance Metrics
- Initial render: < 500ms for 20 tasks
- Drag operation: < 100ms response time
- State update: < 50ms for column changes
- Error handling: < 200ms recovery time

## Future Enhancements

### Potential Test Additions
- [ ] Keyboard navigation testing
- [ ] Accessibility (a11y) validation
- [ ] Mobile responsive behavior
- [ ] Real-time collaboration features
- [ ] Advanced filtering and search
- [ ] Task priority reordering
- [ ] Bulk operations testing

### Integration Testing
- [ ] Connection to real Crystal session management
- [ ] Git worktree integration testing
- [ ] Multi-user session handling
- [ ] File system task persistence

## Troubleshooting

### Common Issues
1. **Tests timing out**: Increase timeout in playwright.config.ts
2. **Drag operations failing**: Check for JavaScript errors in console
3. **Mock data not loading**: Verify taskData.ts exports
4. **Visual assertion failures**: Update selectors for UI changes

### Debug Mode
```bash
# Run with debug output
DEBUG=pw:api npx playwright test kanban/tests/

# Pause on failures
npx playwright test kanban/tests/ --debug

# Record test execution
npx playwright test kanban/tests/ --trace on
```

---

**Created by**: Test Systems Engineer  
**Framework**: Playwright + React 19  
**Integration**: Crystal Multi-Session Claude Code Manager  
**Purpose**: Signal-driven validation of Kanban UI components