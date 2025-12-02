import { test, expect } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  navigateToGame,
  waitForJoinFormVisible,
  closeContexts,
} from './utils/test-helpers';

test.describe('Joining a Game', () => {
  test.describe('Join Form', () => {
    test('should show join form for new user', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);

      await waitForJoinFormVisible(page);
      await expect(page.getByPlaceholder('Enter your name')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Join Game' })
      ).toBeVisible();

      await closeContexts(context);
    });

    test('should disable join button when name is empty', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      const joinButton = page.getByRole('button', { name: 'Join Game' });
      await expect(joinButton).toBeDisabled();

      await closeContexts(context);
    });

    test('should disable join button when name is only whitespace', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByPlaceholder('Enter your name').fill('   ');
      const joinButton = page.getByRole('button', { name: 'Join Game' });
      await expect(joinButton).toBeDisabled();

      await closeContexts(context);
    });

    test('should enable join button when name is entered', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByPlaceholder('Enter your name').fill('TestUser');
      const joinButton = page.getByRole('button', { name: 'Join Game' });
      await expect(joinButton).toBeEnabled();

      await closeContexts(context);
    });

    test('should join game with entered name', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      const username = 'JoinedUser';
      await page.getByPlaceholder('Enter your name').fill(username);
      await page.getByRole('button', { name: 'Join Game' }).click();

      await expect(page.locator('.game-page')).toBeVisible();
      await expect(page.getByText(`${username}(you)`)).toBeVisible();

      await closeContexts(context);
    });
  });

  test.describe('Username Validation', () => {
    test('should handle special characters in username', async ({ page }) => {
      const gameId = generateUniqueGameId();
      const specialUsername = 'User@123!';
      await joinGameAsUser(page, gameId, specialUsername);

      await expect(page.getByText(`${specialUsername}(you)`)).toBeVisible();
    });

    test('should handle unicode characters in username', async ({ page }) => {
      const gameId = generateUniqueGameId();
      const unicodeUsername = '用户🎮';
      await joinGameAsUser(page, gameId, unicodeUsername);

      await expect(page.getByText(`${unicodeUsername}(you)`)).toBeVisible();
    });

    test('should handle long username', async ({ page }) => {
      const gameId = generateUniqueGameId();
      const longUsername = 'VeryLongUsernameThatMightCauseIssues';
      await joinGameAsUser(page, gameId, longUsername);

      await expect(page.getByText(`${longUsername}(you)`)).toBeVisible();
    });
  });

  test.describe('Game ID Handling', () => {
    test('should handle game ID with hyphens and numbers', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = 'test-game-123';
      await navigateToGame(page, gameId);

      await waitForJoinFormVisible(page);

      await closeContexts(context);
    });

    test('should handle new game and show join form', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);

      await waitForJoinFormVisible(page);
      await expect(page.getByPlaceholder('Enter your name')).toBeVisible();

      await closeContexts(context);
    });
  });
});

