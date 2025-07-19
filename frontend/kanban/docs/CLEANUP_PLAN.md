# Root Directory Cleanup Plan

## Current Situation
We've added 27 files to the root directory during the Kanban implementation. This needs to be cleaned up before pushing to maintain clean separation from upstream.

## Files to Reorganize

### 1. Documentation Files → `/kanban/docs/`
- BUTTON_VALIDATION_COMPLETE.md
- FINAL_VERIFICATION_REPORT.md
- IMPLEMENTATION_CONFIRMATION.md
- ISSUE_RESOLUTION.md
- KANBAN_IMPLEMENTATION.md
- KANBAN_TESTING_CHECKLIST.md (our new file)
- KANBAN_VALIDATION_REPORT.md
- KANBAN_VERIFICATION.md
- MASTER_PLAN.md
- MERGE_AND_BOOTSTRAP.md
- MERGE_COMMANDS.md
- PHASE_2_RECURSIVE_ORCHESTRATION.md
- POST_MERGE_VALIDATION_CHECKLIST.md
- RECURSION_MAINTENANCE_FLOW.md
- TASK_LOADER_TEST_RESULTS.md
- TEST_KANBAN.md
- VALIDATION_SUMMARY.md

### 2. Test Files → `/kanban/tests/manual/`
- kanban-test.html
- test-broken-board.html
- validate-tests.html
- simple-test-runner.js
- test_button.js
- test-feature-flag.js
- test-task-loader.js
- validate_implementation.js
- validate-syntax.js

### 3. Config Files → Keep in root (required)
- .env.example (this might be needed in root)
- pnpm-lock.yaml (must stay in root)

### 4. Utility Scripts → `/kanban/scripts/`
- check-merge-branches.sh
- merge-worktree-branches.sh
- CLEANUP_PLAN.md (this file - move to kanban/docs/)

## Cleanup Commands

```bash
# Create new directories
mkdir -p kanban/docs
mkdir -p kanban/tests/manual
mkdir -p kanban/scripts

# Move documentation
mv BUTTON_VALIDATION_COMPLETE.md FINAL_VERIFICATION_REPORT.md IMPLEMENTATION_CONFIRMATION.md ISSUE_RESOLUTION.md KANBAN_IMPLEMENTATION.md KANBAN_TESTING_CHECKLIST.md KANBAN_VALIDATION_REPORT.md KANBAN_VERIFICATION.md MASTER_PLAN.md MERGE_AND_BOOTSTRAP.md MERGE_COMMANDS.md PHASE_2_RECURSIVE_ORCHESTRATION.md POST_MERGE_VALIDATION_CHECKLIST.md RECURSION_MAINTENANCE_FLOW.md TASK_LOADER_TEST_RESULTS.md TEST_KANBAN.md VALIDATION_SUMMARY.md kanban/docs/

# Move test files
mv kanban-test.html test-broken-board.html validate-tests.html simple-test-runner.js test_button.js test-feature-flag.js test-task-loader.js validate_implementation.js validate-syntax.js kanban/tests/manual/

# Move utility scripts
mv check-merge-branches.sh merge-worktree-branches.sh kanban/scripts/

# Move this cleanup plan
mv CLEANUP_PLAN.md kanban/docs/

# Update any references in the code if needed
```

## Files to Keep in Root
- .env.example (standard practice)
- pnpm-lock.yaml (required by pnpm)
- All original Crystal files

## After Cleanup
The root directory will be much cleaner and only contain:
- Original Crystal files
- Standard config files (.env.example)
- Package manager files (pnpm-lock.yaml)

This makes it much easier to:
1. Merge upstream changes
2. Maintain the project
3. Understand the codebase structure