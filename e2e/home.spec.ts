import { test, expect } from '@playwright/test';
import {
  navigateToHomePage,
  waitForJoinFormVisible,
  closeContexts,
} from './utils/test-helpers';

test.describe('Home Page', () => {
  test.describe('Layout', () => {
    test('should display title and subtitle', async ({ page }) => {
      await navigateToHomePage(page);

      await expect(page.locator('.home-title')).toHaveText('Planning Poker');
      await expect(page.locator('.home-subtitle')).toHaveText(
        'Estimate together, decide faster'
      );
    });

    test('should display create game and join game sections', async ({
      page,
    }) => {
      await navigateToHomePage(page);

      await expect(
        page.getByRole('button', { name: /create new game/i })
      ).toBeVisible();
      await expect(page.getByPlaceholder('Enter game ID')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /join game/i })
      ).toBeVisible();
    });
  });

  test.describe('Create Game', () => {
    test('should navigate to a new game when clicking create', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await navigateToHomePage(page);
      await page.getByRole('button', { name: /create new game/i }).click();

      await expect(page).toHaveURL(/\/game\/[a-z0-9-]+/);
      await waitForJoinFormVisible(page);

      await closeContexts(context);
    });

    test('should generate unique game IDs', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await navigateToHomePage(page);
      await page.getByRole('button', { name: /create new game/i }).click();
      await expect(page).toHaveURL(/\/game\/[a-z0-9-]+/);
      const firstGameUrl = page.url();

      await navigateToHomePage(page);
      await page.getByRole('button', { name: /create new game/i }).click();
      await expect(page).toHaveURL(/\/game\/[a-z0-9-]+/);
      const secondGameUrl = page.url();

      expect(firstGameUrl).not.toBe(secondGameUrl);

      await closeContexts(context);
    });
  });

  test.describe('Join Game', () => {
    test('should navigate to game when entering valid game ID', async ({
      page,
    }) => {
      await navigateToHomePage(page);

      const testGameId = 'my-test-game';
      await page.getByPlaceholder('Enter game ID').fill(testGameId);
      await page.getByRole('button', { name: /join game/i }).click();

      await expect(page).toHaveURL(`/game/${testGameId}`);
    });

    test('should disable join button when game ID is empty', async ({
      page,
    }) => {
      await navigateToHomePage(page);

      const joinButton = page.getByRole('button', { name: /join game/i });
      await expect(joinButton).toBeDisabled();
    });

    test('should enable join button when game ID is entered', async ({
      page,
    }) => {
      await navigateToHomePage(page);

      await page.getByPlaceholder('Enter game ID').fill('some-game');
      const joinButton = page.getByRole('button', { name: /join game/i });
      await expect(joinButton).toBeEnabled();
    });

    test('should trim whitespace from game ID', async ({ page }) => {
      await navigateToHomePage(page);

      await page.getByPlaceholder('Enter game ID').fill('  trimmed-game  ');
      await page.getByRole('button', { name: /join game/i }).click();

      await expect(page).toHaveURL('/game/trimmed-game');
    });
  });
});

