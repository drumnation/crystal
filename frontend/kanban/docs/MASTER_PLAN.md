# 🧠 Crystal Kanban System - Master Plan

## 🎯 Core Objectives

### Phase 1: Foundation (Complete ✅)
- **Kanban UI Components**: PlanningView, KanbanBoard, TaskCard with drag-and-drop
- **Task Loading**: JSON file parsing with IPC integration and error handling
- **Session Bridge**: Safe stubbing for future Crystal session integration
- **Testing Infrastructure**: Playwright tests for UI validation
- **Validation System**: Meta-validation using task cards to test the system

### Phase 2: Orchestration (In Progress 🔄)
- **Branch Unification**: Merge all validated feature branches into main
- **Environment Management**: Dynamic .env generation and port allocation per worktree
- **UI Context Injection**: Visual identification of current feature/worktree in app header
- **Prompt Context**: Structured task.json injection into Claude session prompts
- **Test Integration**: Link test pass/fail status to task cards for quality gates
- **Recursive Coordination**: Use Kanban to manage its own Phase 2 development

### Phase 3: Adaptive Planning (Next 🚀)
- **Master Plan Integration**: Lazy evaluation of task instructions from this plan
- **Dynamic Instruction Generation**: Just-in-time task detail resolution
- **Context-Aware Sessions**: Real-time repo state + master plan injection
- **Fluid Plan Updates**: Central planning updates without task instruction rewrites

## 🌀 Adaptive Planning Model

### 1. Master Plan → Tasks Mapping
- This `MASTER_PLAN.md` serves as canonical objective source
- Task shells reference objectives without detailed instructions
- Instructions generated dynamically when sessions launch

### 2. Task Shell Pattern
```json
{
  "id": "task-dynamic-instruction-gen",
  "title": "Implement dynamic instruction generation",
  "status": "pending", 
  "masterPlanRef": "Phase 3: Adaptive Planning",
  "instruction": null
}
```

### 3. Just-In-Time Resolution
- `generateInstructionFromMasterPlan(taskId)` helper function
- Combines: master plan + current repo state + task metadata
- Runs only when Claude session starts

## 🛠️ Current Implementation Priorities

### Immediate (Bootstrap Complete)
1. **Merge Feature Branches**: Unify disconnected worktrees into main
2. **Validate Planning Tab**: Confirm Kanban UI loads all task files
3. **Test Recursive Launch**: Verify "Launch Claude" triggers sessions correctly

### Next Sprint (Orchestration)
1. **WorktreeEnvManager**: Auto-generate unique environments per branch
2. **Test Status Integration**: Show pass/fail indicators on task cards
3. **Prompt Context Injection**: Include task.json in Claude session context

### Future Sprint (Adaptive)
1. **Master Plan Integration**: Implement lazy instruction evaluation
2. **Context-Aware Planning**: Real-time plan updates without task rewrites
3. **Meta-Recursion**: Use recursion to improve recursion capabilities

## 🔄 Recursion Maintenance

### Worktree Strategy
- **Naming**: `kanban/{task-id-slug}`
- **Scope**: One worktree per active task
- **Cleanup**: Merge → prune → trigger next after completion

### Output Strategy  
- **Commits**: Include task title in commit messages
- **Files**: Store outputs in `/.generated/` or `/.session/` folders
- **Traces**: Drop `.trace.json` logs of recursive planning decisions

### Quality Gates
- Task completion requires passing tests
- Merge requires successful integration
- New tasks can spawn from within recursive sessions

## 🎪 Meta-Goal: Self-Improving Recursion

The ultimate objective is a system that:
- Uses itself to coordinate its own development
- Adapts its planning strategy based on execution feedback  
- Improves its recursive capabilities through meta-recursion
- Maintains coherent development flow across multiple AI agents

**Current State**: ✅ Minimum Viable Recursion achieved  
**Next Milestone**: 🚀 Adaptive Planning with lazy evaluation