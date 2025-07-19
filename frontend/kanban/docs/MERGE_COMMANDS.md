# 🔄 Merge Commands for Bootstrap

## Execute from Main Repository

Run these commands from `/Users/dmieloch/Dev/singularityApps/forks/crystal/`:

```bash
# Switch to main branch
git switch main

# Verify we're clean
git status

# Merge validated feature branches in order
git merge feature/kanban-planning-mode --no-ff -m "Merge kanban planning mode with PlanningView component"
git merge feature/task-loader --no-ff -m "Merge task loader with JSON parsing and IPC integration"
git merge feature/session-bridge --no-ff -m "Merge session bridge with safe stubbing for future integration"
git merge feature/sample-task-runner --no-ff -m "Merge sample task runner with TaskCard component"
git merge test/kanban-ui-tests --no-ff -m "Merge Kanban UI tests with Playwright coverage"

# Test the unified system
ENABLE_KANBAN=true NODE_OPTIONS="--max-old-space-size=8192" pnpm install
ENABLE_KANBAN=true NODE_OPTIONS="--max-old-space-size=8192" pnpm build
ENABLE_KANBAN=true pnpm electron-dev
```

## Post-Merge Validation

Once merged, verify:

1. **Planning tab appears** in the UI
2. **Tasks load** from the `/tasks/` directory  
3. **Drag-and-drop works** between columns
4. **Launch Claude buttons** log task information
5. **No crashes or errors**

## Resume Recursive Planning

After successful merge and validation:

1. **Navigate to Planning tab** in Crystal
2. **See all 14 task cards** from validation work
3. **Click "Launch Claude"** on Phase 2 tasks
4. **Let the system orchestrate itself** using the live Kanban UI

## Critical Success Metric

✅ **The system can now plan its own enhancement using the tool it just built**

This achieves **minimum viable recursion** - the bootstrap is complete!