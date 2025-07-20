import { test, expect } from '@playwright/test';

test.describe('Debug Kanban Access', () => {
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

  test('Should show available tabs and buttons', async ({ page }) => {
    // Take a screenshot first
    await page.screenshot({ 
      path: 'test-results/debug-kanban-ui.png',
      fullPage: true 
    });

    // Find all buttons and their text
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons:`);
    
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const button = buttons[i];
      try {
        const text = await button.textContent();
        const title = await button.getAttribute('title');
        console.log(`Button ${i}: text="${text}" title="${title}"`);
      } catch (e) {
        console.log(`Button ${i}: error getting text`);
      }
    }

    // Look for tabs specifically
    const tabs = await page.locator('[role="tab"], .tab, button:has-text("Output"), button:has-text("View Diff"), button:has-text("Terminal"), button:has-text("Planning")').all();
    console.log(`Found ${tabs.length} potential tabs:`);
    
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      try {
        const text = await tab.textContent();
        const isVisible = await tab.isVisible();
        console.log(`Tab ${i}: text="${text}" visible=${isVisible}`);
      } catch (e) {
        console.log(`Tab ${i}: error getting text`);
      }
    }

    // Check environment variable display if available
    const envDisplay = page.locator('text=/VITE_ENABLE_KANBAN/');
    if (await envDisplay.isVisible({ timeout: 1000 }).catch(() => false)) {
      const envText = await envDisplay.textContent();
      console.log(`Environment variable display: ${envText}`);
    }

    // Look for Planning-related text
    const planningTexts = await page.locator('text=/Planning|Kanban|Task Planning/i').all();
    console.log(`Found ${planningTexts.length} planning-related elements:`);
    
    for (let i = 0; i < planningTexts.length; i++) {
      const element = planningTexts[i];
      try {
        const text = await element.textContent();
        const isVisible = await element.isVisible();
        console.log(`Planning element ${i}: text="${text}" visible=${isVisible}`);
      } catch (e) {
        console.log(`Planning element ${i}: error getting text`);
      }
    }

    // Always pass - this is just a debug test
    expect(true).toBe(true);
  });
});