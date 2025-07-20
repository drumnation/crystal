import { test, expect } from '@playwright/test';

test.describe('Kanban Worktree Columns', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Close welcome dialog if present
    const getStartedButton = page.locator('button:has-text("Get Started")');
    if (await getStartedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await getStartedButton.click();
    }
    
    // Wait for sidebar to be visible
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
  });

  test('Should display worktree-based column headers instead of status columns', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Take a debug screenshot to see what's displayed
    await page.screenshot({ path: 'test-results/debug-after-open.png', fullPage: true });
    
    // Log all visible text to understand what's on the page
    const allText = await page.locator('body').textContent();
    console.log('Page content after opening planning dashboard:', allText?.substring(0, 500));
    
    // Verify that OLD status-based columns are NOT present
    await expect(page.locator('text="Planned"')).not.toBeVisible();
    await expect(page.locator('text="In Progress"')).not.toBeVisible();
    await expect(page.locator('text="Complete"')).not.toBeVisible();
    
    // Verify that NEW worktree-based columns ARE present
    // These should match the mock data we created (with display name transformations)
    const expectedWorktrees = [
      'task-visualization-overhaul',
      'claude-prompt-strategy', 
      'Test: kanban-ui-tests',
      'env-orchestration',
      'Main Branch'
    ];
    
    for (const worktree of expectedWorktrees) {
      const columnHeader = page.locator(`text="${worktree}"`).first();
      await expect(columnHeader).toBeVisible();
    }
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/kanban-worktree-columns.png',
      fullPage: true 
    });
  });

  test('Should highlight current worktree column', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Find the current worktree column (should be highlighted)
    const currentWorktreeColumn = page.locator(':has-text("task-visualization-overhaul")').first();
    await expect(currentWorktreeColumn).toBeVisible();
    
    // Verify it has the "current" badge
    const currentBadge = page.locator('text="current"');
    await expect(currentBadge).toBeVisible();
    
    // Verify the column has visual highlighting (blue background)
    const columnWithHighlight = page.locator('.bg-blue-50, .dark\\:bg-blue-900\\/20').first();
    await expect(columnWithHighlight).toBeVisible();
  });

  test('Should display task counts per worktree column', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Verify task count indicators are present
    await expect(page.locator('text=/\\d+ active/')).toBeVisible();
    await expect(page.locator('text=/\\d+ queued/')).toBeVisible();
    await expect(page.locator('text=/\\d+ done/')).toBeVisible();
    
    // Verify specific counts for current worktree (based on mock data)
    const currentWorktreeSection = page.locator(':has-text("task-visualization-overhaul")').first();
    await expect(currentWorktreeSection.locator('text="1 active"')).toBeVisible();
    await expect(currentWorktreeSection.locator('text=/[12] queued/')).toBeVisible();
    await expect(currentWorktreeSection.locator('text="1 done"')).toBeVisible();
  });

  test('Should organize tasks within each worktree by execution status', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Verify section headers within columns
    await expect(page.locator('text="🔄 Active"')).toBeVisible();
    await expect(page.locator('text="📋 Queued"')).toBeVisible();
    await expect(page.locator('text="✅ Completed"')).toBeVisible();
    
    // Verify at least one active task exists (should be highlighted)
    const activeTaskCard = page.locator('.border-amber-400, .dark\\:border-amber-500').first();
    await expect(activeTaskCard).toBeVisible();
  });

  test('Should display git branch icons in column headers', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Verify git branch icons are present (using SVG or Lucide icons)
    const branchIcons = page.locator('svg[data-lucide="git-branch"], .lucide-git-branch');
    await expect(branchIcons.first()).toBeVisible();
    
    // Should have multiple branch icons (one per column)
    const iconCount = await branchIcons.count();
    expect(iconCount).toBeGreaterThan(1);
  });

  test('Should show project information in header', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Verify project indicator shows project info
    await expect(page.locator('text="Project:"')).toBeVisible();
    await expect(page.locator('text=/Tasks: \\d+/')).toBeVisible();
    await expect(page.locator('text=/Worktrees: \\d+/')).toBeVisible();
  });

  test('Should verify no old status columns remain', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Ensure old column headers are completely gone
    const bannedColumnNames = [
      'To Do',
      'Planned', 
      'In Progress',
      'Done',
      'Complete',
      'Completed'
    ];
    
    for (const bannedName of bannedColumnNames) {
      // Check that these don't appear as column headers
      const columnHeader = page.locator(`h3:has-text("${bannedName}"), h2:has-text("${bannedName}")`);
      await expect(columnHeader).not.toBeVisible();
    }
  });

  test('Should handle empty worktree columns gracefully', async ({ page }) => {
    // Open the Task Planning Dashboard via the sidebar button
    const planningButton = page.locator('button[title*="Task Planning Dashboard"]');
    await planningButton.click();
    
    // Wait for Kanban board to load
    await page.waitForSelector('.kanban-board, [data-testid="kanban-board"], h1:has-text("Planning Board"), h2:has-text("Task Planning Dashboard")', { timeout: 10000 });
    
    // Look for empty state messaging in columns without tasks
    const emptyStateText = page.locator('text="No tasks assigned"');
    if (await emptyStateText.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.locator('text="Drag tasks here to assign to this worktree"')).toBeVisible();
    }
  });

  test('Should show worktree branch in sidebar footer', async ({ page }) => {
    // Wait for sidebar to load
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
    
    // Verify current branch is displayed in sidebar footer  
    const branchDisplay = page.locator('text="📝 feature/task-visualization-overhaul"');
    await expect(branchDisplay).toBeVisible();
    
    // Verify it's in the footer area
    const sidebarFooter = page.locator('[data-testid="sidebar"] >> text="feature/task-visualization-overhaul"');
    await expect(sidebarFooter).toBeVisible();
  });
});