# Crystal Kanban System Testing Checklist

## 🚀 Quick Start Commands

```bash
# Run the development server
pnpm -w run dev

# Or if that fails, try:
pnpm -w run electron-dev
```

## ✅ Visual Testing Checklist

### 1. **Planning Tab**
- [ ] Planning tab appears in the sidebar
- [ ] Clicking Planning tab opens the planning view
- [ ] Planning view shows "Planning Mode Not Enabled" message if ENABLE_KANBAN is not set

### 2. **Environment Setup**
- [ ] Set `ENABLE_KANBAN=true` in `.env` file or environment
- [ ] Restart the app
- [ ] Planning tab now shows the Kanban board

### 3. **Kanban Board Features**
- [ ] Three columns visible: "Planned", "In Progress", "Complete"
- [ ] Tasks load from JSON files in `/tasks` directory
- [ ] Tasks display with:
  - [ ] Title
  - [ ] Description
  - [ ] Priority badge (high/medium/low)
  - [ ] Status icon
  - [ ] Assignee (if present)
  - [ ] Due date (if present)
  - [ ] Tags (if present)

### 4. **Drag & Drop**
- [ ] Can drag tasks between columns
- [ ] Task status updates when moved
- [ ] Visual feedback during drag operation

### 5. **Task Planning Modal**
- [ ] Press Cmd/Ctrl+P to open prompt history
- [ ] Planning button in sidebar opens task modal
- [ ] Modal shows task loading status
- [ ] "Reload Tasks" button works
- [ ] Tasks grouped by status (To Do, In Progress, Done)

### 6. **Task Loader**
- [ ] Tasks load from `/tasks/*.json` files
- [ ] Invalid JSON files show warning but don't crash
- [ ] Task validation errors display in modal

### 7. **Session Bridge**
- [ ] "Launch Claude" buttons appear on task cards (if implemented)
- [ ] Clicking launches new Crystal session with task context

### 8. **Error Handling**
- [ ] App handles missing task files gracefully
- [ ] Invalid task data shows warnings
- [ ] Network errors don't crash the app

## 📝 Console Checks

Open browser DevTools console and verify:

1. **No critical errors** (red messages)
2. **Task loading logs** appear when opening Planning view:
   ```
   🔄 [PlanningView] Starting task loading...
   📂 [PlanningView] Calling loadTasks() function...
   ✅ [PlanningView] Successfully loaded tasks: [...]
   ```

3. **Drag & drop logs** when moving tasks (if implemented)

## 🐛 Known Issues to Check

1. **Memory usage** - Monitor if app uses excessive memory
2. **Performance** - Check if UI remains responsive with many tasks
3. **Dark mode** - Verify all components work in dark theme
4. **Keyboard shortcuts** - Test Cmd/Ctrl+K for Kanban toggle

## 📊 Test Data

The following test task files should be present:
- `/tasks/crystal-kanban.json` - Main Kanban tasks
- `/tasks/sample-tasks.json` - Sample data
- `/tasks/bug-fixes.json` - Bug tracking
- `/tasks/invalid-task.json` - Error handling test
- `/tasks/malformed.json` - Malformed JSON test

## 🎯 Success Criteria

The Kanban system is working if:
1. ✅ All UI components render without errors
2. ✅ Tasks load and display correctly
3. ✅ Drag & drop functionality works (if implemented)
4. ✅ No console errors during normal operation
5. ✅ Performance remains smooth

## 🚨 If Things Don't Work

1. **Check environment variables**: Ensure `ENABLE_KANBAN=true`
2. **Check console for errors**: Look for specific error messages
3. **Verify file paths**: Ensure `/tasks` directory exists with JSON files
4. **Try incognito/private mode**: Rule out cache issues
5. **Rebuild**: Run `pnpm build:main` and restart

---

Ready to test? Run `pnpm -w run dev` and go through this checklist!