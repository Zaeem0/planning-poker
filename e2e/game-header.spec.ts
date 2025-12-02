import { test, expect } from '@playwright/test';
import { generateUniqueGameId, joinGameAsUser } from './utils/test-helpers';

test.describe('Game Header', () => {
  test.describe('Title', () => {
    test('should display game title', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      await expect(page.locator('.game-header-title')).toHaveText(
        'Planning Poker'
      );
    });
  });

  test.describe('Game ID Badge', () => {
    test('should display game ID in header', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      await expect(page.locator('.game-id-value')).toHaveText(gameId);
    });

    test('should show copy icon initially', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      await expect(page.locator('.game-id-badge svg')).toBeVisible();
    });

    test('should show check icon after clicking copy', async ({
      page,
      context,
    }) => {
      await context.grantPermissions(['clipboard-write']);

      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'CopyUser');

      await page.locator('.game-id-badge').click();

      await expect(page.locator('.game-id-badge')).toContainText(gameId);
    });
  });

  test.describe('Create New Game Button', () => {
    test('should display create new game button', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      await expect(
        page.getByRole('button', { name: /create new game/i })
      ).toBeVisible();
    });

    test('should navigate to new game from existing game', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      const originalUrl = page.url();

      await page.getByRole('button', { name: /create new game/i }).click();

      await expect(page).not.toHaveURL(originalUrl);
      await expect(page).toHaveURL(/\/game\/[a-z0-9-]+/);
    });
  });
});

