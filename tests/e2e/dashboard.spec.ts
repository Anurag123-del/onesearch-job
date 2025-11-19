import { test, expect } from '@playwright/test';

test('should display both frontend and backend engineer jobs', async ({ page }) => {
  await page.goto('/');

  // Wait for the job cards to be rendered
  await page.waitForSelector('[data-testid="job-card"]');

  // Check for the Frontend Engineer job
  await expect(page.locator('h2:has-text("Frontend Engineer")')).toBeVisible();

  // Check for the Backend Engineer job
  await expect(page.locator('h2:has-text("Backend Engineer")')).toBeVisible();
});
