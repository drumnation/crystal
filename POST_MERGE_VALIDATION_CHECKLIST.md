# ✅ Post-Merge Validation Checklist

## Purpose
Confirm that all **worktrees are properly merged** and the result is a unified, runnable system with full recursive Planning tab functionality.

## ✅ 1. Run Merge Commands (from `MERGE_COMMANDS.md`)

Ensure all validated branches are merged into `main`:

```bash
git checkout main
git pull origin main

git merge feature/kanban-planning-mode --no-ff -m "Merge kanban planning mode"
git merge feature/task-loader --no-ff -m "Merge task loader" 
git merge feature/session-bridge --no-ff -m "Merge session bridge"
git merge feature/sample-task-runner --no-ff -m "Merge sample task runner"
git merge test/kanban-ui-tests --no-ff -m "Merge Kanban UI tests"
git merge feature/validate-kanban-system --no-ff -m "Merge validation system"
```

## ✅ 2. Delete or Archive Worktrees

Use this to confirm all worktrees have been collapsed into `main`:

```bash
git worktree list
# prune old ones if needed
git worktree remove worktrees/feature/kanban-planning-mode
git worktree remove worktrees/feature/task-loader
git worktree remove worktrees/feature/session-bridge
git worktree remove worktrees/feature/sample-task-runner
git worktree remove worktrees/test/kanban-ui-tests
# Keep validate-kanban-system for documentation
```

## ✅ 3. Rebuild from Main

Reinstall and build the now-merged project:

```bash
pnpm install
pnpm build
```

If memory issues occur, use:

```bash
NODE_OPTIONS="--max-old-space-size=8192" pnpm build
```

## ✅ 4. Validate App Launch

Run the unified app with the Kanban feature enabled:

```bash
ENABLE_KANBAN=true pnpm electron-dev
```

**Expected results**:
* Electron app opens successfully
* Planning tab appears in sidebar
* All 17+ task cards are visible
* No console errors during load

## ✅ 5. Run End-to-End Tests

Confirm system-level integrity:

```bash
pnpm test:e2e
# or if using Playwright
pnpm exec playwright test
```

## ✅ 6. Check Task Files and Behavior

Validate that:
* `tasks/` folder includes 17+ files
* Each task card displays properly in Planning tab
* "Launch Claude" buttons trigger sessions as expected
* Adaptive planning task shells resolve properly
* Drag-and-drop between columns works

## ✅ 7. Test Recursive Features

**Critical validation**:
1. **Click "Launch Claude"** on any task card
2. **Verify Claude session starts** with task context
3. **Confirm task metadata** is injected into session
4. **Test session output** appears in Crystal interface

## 🎯 Success Criteria

**System is ready for recursive orchestration when**:
- ✅ All feature branches merged successfully
- ✅ App builds and launches without errors  
- ✅ Planning tab shows all task cards
- ✅ Claude sessions launch from task cards
- ✅ Task context injection works
- ✅ End-to-end tests pass

## 🚀 Next Step: Recursive Planning

Once validation passes:
1. **Navigate to Planning tab**
2. **Select a Phase 2 task** (like WorktreeEnvManager)
3. **Launch Claude session** 
4. **Watch recursive orchestration begin**

The system will now coordinate its own development using the tool it just built! 🌀🤖✨

## 📊 Task File Inventory

Expected task files in `/tasks/`:
- 7 Phase 1 validation tasks
- 7 Phase 2 orchestration tasks  
- 3 bootstrap/validation tasks
- 1 template file
- **Total: 18 files**