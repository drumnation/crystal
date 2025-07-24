# Performance Optimizations for Project Collapse Issue

This document summarizes the performance optimizations applied to fix the issue where projects don't collapse when git status indicators are loading.

## Root Cause

The issue was caused by performance-related UI unresponsiveness during periods of heavy git status loading activity. Multiple sessions simultaneously loading git status caused a cascade of React component re-renders that made the UI temporarily unresponsive to user interactions, including project collapse/expand functionality.

## Solution Approach

The solution focuses on optimizing React rendering performance during git status loading periods:

1. **Throttling git status events** from backend to prevent UI flooding
2. **Optimizing component re-rendering** with memoization and selective updates
3. **Batching git status updates** to reduce render frequency
4. **Adding performance safeguards** to maintain UI responsiveness during heavy loading periods

## Changes Applied

### Backend (main/src/services/gitStatusManager.ts)

1. **Event Throttling**: Added throttling mechanism (100ms) for git status events to prevent UI flooding
2. **Batch Events**: Implemented batch emission of git status events to reduce IPC overhead
3. **Concurrent Limiting**: Limited concurrent git operations to 3 to prevent resource exhaustion
4. **Event Queue**: Added proper event queuing and processing for better performance

### Frontend Store (frontend/src/stores/sessionStore.ts)

1. **Batch Updates**: Implemented batching for git status loading state updates (50ms window)
2. **Debounced Store Updates**: Added debouncing to prevent rapid successive store updates
3. **Optimized Methods**: Modified updateSessionGitStatus and setGitStatusLoading to use batching

### Components

#### SessionListItem.tsx
1. **React.memo**: Wrapped component with memo and custom comparison function
2. **Selective Subscriptions**: Only subscribe to relevant git status loading state
3. **useCallback**: Applied to event handlers to prevent recreation
4. **Combined Effects**: Merged related useEffect hooks to reduce overhead

#### ProjectTreeView.tsx
1. **Memoized ProjectItem**: Created separate memoized component for project rendering
2. **Performance Safeguards**: Skip non-essential updates when >5 sessions loading git status
3. **Selective Sync**: Only sync sessions when essential properties change
4. **useCallback**: Applied to toggleProject and handleCreateSession

#### DraggableProjectTreeView.tsx
1. **Performance Monitoring**: Added render count tracking for debugging
2. **Conditional UI State Saving**: Skip saving during heavy git loading
3. **useCallback**: Applied to toggleProject, toggleFolder, and buildFolderTree
4. **Debounced Saves**: Optimized UI state saving mechanism

### Hooks (frontend/src/hooks/useIPCEvents.ts)

1. **Throttled Event Handlers**: Added 100ms throttling for git status events
2. **Batch Event Support**: Added handlers for batch git status events
3. **Optimized Event Processing**: Reduced frequency of store updates

### Type Definitions (frontend/src/types/electron.d.ts)

Added type definitions for new batch event handlers:
- `onGitStatusLoadingBatch`
- `onGitStatusUpdatedBatch`

## Performance Improvements

These optimizations significantly reduce the number of React re-renders during git status loading, ensuring the UI remains responsive even when multiple sessions are simultaneously fetching git status. The project collapse/expand functionality now works smoothly regardless of background git operations.

## Key Metrics

- Event throttling: 100ms (backend to frontend)
- Store update batching: 50ms window
- Concurrent git operations: Limited to 3
- Performance safeguard threshold: 5 concurrent git status loads