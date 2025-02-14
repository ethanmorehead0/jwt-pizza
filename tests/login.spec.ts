import {test, expect} from 'playwright-test-coverage';

test('home page', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);



  });
