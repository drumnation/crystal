# 🔁 Recursion Maintenance Flow (Post-Bootstrap)

## 👁️‍🗨️ The Real Beginning

Now that we've crossed into **minimum viable recursion**, here's how to stabilize and maintain that loop going forward:

## ✅ 1. Trigger Agent-Driven Planning

From any Planning task card:
* Hit **"Launch Claude"**
* Claude reads the `task.json`, uses internal context, and begins orchestration of subtasks or code edits
* All recursive outputs stay attached to their task session

## 🪞 2. Recursive Output Strategy

Agents should:
* **Echo the task title** in commit messages (e.g., `feat: [task-bootstrap-merge-validation] add session check`)
* **Store output files** in `/.generated/` or `/.session/` scoped folders where needed
* **Drop `.trace.json` logs** of every planning recursion they execute (e.g. what subtasks they generated)

## 📂 3. Worktree Naming Convention

To reduce cognitive load:
* Use the format: `kanban/{task-id-slug}`
  E.g., `kanban/task-bootstrap-merge-validation`

## 🧼 4. Cleanup Loop

After completing a task:
* ✅ **Mark task as complete**
* 🔀 **Merge branch** to `main` or `dev`
* 🧹 **Prune the worktree** unless long-term feature branches are needed
* 🔁 **Trigger next card's planning loop**

## 📌 Recommendations for Stabilization

### Immediate Enhancements:
* **Add `task-template.json`** file to help future authors stay consistent
* **Auto-update Planning tab** from `/tasks/` folder on each reload (if not already)
* **Auto-git-branch-creator** that reads `task.json` and spins up a worktree automatically

### Future Phase:
* **Claude-Initiated Task Creation** — agents that spawn new cards
* **Using recursion to improve recursion** 🧠🌀🧠

## 🌀 The Next Meta-Loop

Once the first recursive session is active, we begin writing the next level:

> **Using recursion to improve recursion.**

This creates an infinite enhancement loop where the system continuously optimizes its own recursive capabilities.

## 🎯 Success Metrics

**Recursion is stable when**:
- Task cards trigger predictable Claude sessions
- Outputs are properly scoped and traced
- Cleanup happens automatically after completion
- New tasks can be spawned from within recursive sessions
- The system improves its own recursive capacity

## 🚀 Ready for Live Orchestration

The Planning tab is about to become a **live orchestration command center** where:
- Each card represents an active development thread
- Claude sessions coordinate multi-branch development
- The system manages its own enhancement workflow
- Meta-recursion begins automatically

**Next step**: Light up the Planning tab and trigger the first recursive session! 🔥🌀