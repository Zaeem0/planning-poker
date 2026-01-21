import { test, expect } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  joinGameAsSpectator,
  navigateToGame,
  closeContexts,
} from './utils/test-helpers';

test.describe('Visual Regression Tests', () => {
  test.describe('Voting Cards', () => {
    test('should match snapshot of initial game state', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      // Wait for voting cards to be visible
      await expect(page.locator('.voting-cards-bottom')).toBeVisible();
      await page.waitForTimeout(300);

      // Take full page snapshot
      await expect(page).toHaveScreenshot('game-initial-state.png', {
        fullPage: true,
      });
    });

    test('should match snapshot with selected card', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      // Click a card to select it
      await page.click('[data-card-size="m"]');

      // Wait for selection to apply
      await expect(page.locator('.voting-card-small.selected')).toBeVisible();
      await page.waitForTimeout(300);

      // Take full page snapshot
      await expect(page).toHaveScreenshot('game-card-selected.png', {
        fullPage: true,
      });
    });

    test('should match snapshot with mixed votes (67% vs 33%)', async ({
      browser,
    }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const context3 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      const page3 = await context3.newPage();

      const gameId = generateUniqueGameId();

      // Two users vote M, one votes L (M is most common at 67%)
      await joinGameAsUser(page1, gameId, 'User1');
      await page1.click('[data-card-size="m"]');

      await joinGameAsUser(page2, gameId, 'User2');
      await page2.click('[data-card-size="m"]');

      await joinGameAsUser(page3, gameId, 'User3');
      await page3.click('[data-card-size="l"]');

      // Reveal votes
      await page1
        .locator('button:has-text("Reveal Votes")')
        .click({ force: true });

      // Wait for reveal animation and verify percentages are visible
      await expect(
        page1.locator('.voting-card-percentage').first()
      ).toBeVisible();
      await page1.waitForTimeout(1000);

      // Take full page snapshot showing mixed vote percentages
      await expect(page1).toHaveScreenshot('game-mixed-votes-67-33.png', {
        fullPage: true,
      });

      await closeContexts(context1, context2, context3);
    });

    test('should match snapshot with unanimous vote (100%)', async ({
      browser,
    }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      const gameId = generateUniqueGameId();

      // Two users join and vote for the same card (unanimous)
      await joinGameAsUser(page1, gameId, 'User1');
      await page1.click('[data-card-size="m"]');

      await joinGameAsUser(page2, gameId, 'User2');
      await page2.click('[data-card-size="m"]');

      // Reveal votes
      await page1
        .locator('button:has-text("Reveal Votes")')
        .click({ force: true });

      // Wait for reveal and verify percentages are visible
      await expect(
        page1.locator('.voting-card-percentage').first()
      ).toBeVisible();
      await page1.waitForTimeout(1000);

      // Take full page snapshot (should show large emoji, 100%, no title text)
      await expect(page1).toHaveScreenshot('game-unanimous-100.png', {
        fullPage: true,
        animations: 'disabled', // Disable wiggle animation for consistent snapshots
      });

      await closeContexts(context1, context2);
    });
  });

  test.describe('Player Cards', () => {
    test('should match snapshot with partial voting', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      const gameId = generateUniqueGameId();

      // User 1 joins and votes
      await joinGameAsUser(page1, gameId, 'User1');
      await page1.click('[data-card-size="m"]');

      // User 2 joins but doesn't vote
      await joinGameAsUser(page2, gameId, 'User2');

      // Wait for both users to be visible
      await expect(page1.locator('.player-card').nth(0)).toBeVisible();
      await expect(page1.locator('.player-card').nth(1)).toBeVisible();
      await page1.waitForTimeout(300);

      // Take full page snapshot (one voted, one not)
      await expect(page1).toHaveScreenshot('game-partial-voting.png', {
        fullPage: true,
      });

      await closeContexts(context1, context2);
    });

    test('should match snapshot after revealing votes', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      const gameId = generateUniqueGameId();

      // Both users vote
      await joinGameAsUser(page1, gameId, 'User1');
      await page1.click('[data-card-size="m"]');

      await joinGameAsUser(page2, gameId, 'User2');
      await page2.click('[data-card-size="l"]');

      // Reveal votes
      await page1
        .locator('button:has-text("Reveal Votes")')
        .click({ force: true });

      // Wait for reveal and verify percentages are visible
      await expect(
        page1.locator('.voting-card-percentage').first()
      ).toBeVisible();
      await page1.waitForTimeout(1000);

      // Take full page snapshot after reveal
      await expect(page1).toHaveScreenshot('game-votes-revealed.png', {
        fullPage: true,
      });

      await closeContexts(context1, context2);
    });
  });

  test.describe('Join Form', () => {
    test('should match snapshot of create game form with settings toggle', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);

      await expect(page.locator('.join-form')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Create Game' })
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByRole('button', { name: /Settings/ })
      ).toBeVisible();

      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('create-game-form.png', {
        fullPage: true,
      });
    });

    test('should match snapshot of create game form with expanded settings', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);

      await expect(page.locator('.join-form')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Create Game' })
      ).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /Settings/ }).click();
      await expect(page.locator('.card-set-selector')).toBeVisible();

      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('create-game-form-expanded.png', {
        fullPage: true,
      });
    });

    test('should match snapshot of join game form without card set toggle', async ({
      browser,
    }) => {
      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      const gameId = generateUniqueGameId();

      // Alice creates the game first
      await joinGameAsUser(alicePage, gameId, 'Alice');
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();
      await alicePage.waitForTimeout(500);

      // Bob navigates to the existing game
      await navigateToGame(bobPage, gameId);

      await expect(bobPage.locator('.join-form')).toBeVisible();
      await expect(
        bobPage.getByRole('heading', { name: 'Join Game' })
      ).toBeVisible({ timeout: 10000 });
      await expect(
        bobPage.getByRole('button', { name: /Settings/ })
      ).not.toBeVisible();

      await bobPage.waitForTimeout(300);

      // Take full page snapshot of join game form
      await expect(bobPage).toHaveScreenshot('join-game-form.png', {
        fullPage: true,
      });

      await closeContexts(aliceContext, bobContext);
    });

    test('should match snapshot of card editor in create form', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);

      await expect(page.locator('.join-form')).toBeVisible();
      await page.getByRole('button', { name: /Settings/ }).click();
      await expect(page.locator('.card-set-selector')).toBeVisible();
      await expect(page.locator('.card-set-editor')).toBeVisible();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('join-form-card-editor.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Edge Cases', () => {
    test('should match snapshot with spectator mode', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsSpectator(page, gameId, 'SpectatorUser');

      // Wait for game to load
      await expect(page.locator('.voting-cards-bottom')).toBeVisible();
      await page.waitForTimeout(300);

      // Take full page snapshot of spectator view
      await expect(page).toHaveScreenshot('game-spectator-mode.png', {
        fullPage: true,
      });
    });

    test('should match snapshot with no votes (empty state)', async ({
      browser,
    }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      const gameId = generateUniqueGameId();

      // Two users join but nobody votes
      await joinGameAsUser(page1, gameId, 'User1');
      await joinGameAsUser(page2, gameId, 'User2');

      // Wait for both users to be visible
      await expect(page1.locator('.player-card').nth(0)).toBeVisible();
      await expect(page1.locator('.player-card').nth(1)).toBeVisible();
      await page1.waitForTimeout(300);

      // Take full page snapshot with no votes
      await expect(page1).toHaveScreenshot('game-no-votes.png', {
        fullPage: true,
      });

      await closeContexts(context1, context2);
    });

    test('should match snapshot with edited preset game', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);

      await expect(page.locator('.join-form')).toBeVisible();
      await page.getByRole('button', { name: /Settings/ }).click();
      await expect(page.locator('.card-set-selector')).toBeVisible();

      const labelInputs = page.locator('.card-set-editor-card-label');
      await labelInputs.first().clear();
      await labelInputs.first().fill('🚀');
      await labelInputs.nth(1).clear();
      await labelInputs.nth(1).fill('🎯');

      await page.fill('input[placeholder="Enter your name"]', 'TestUser');
      await page.click('button:has-text("Create Game")');

      await expect(page.locator('.voting-cards-bottom')).toBeVisible();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('game-edited-preset.png', {
        fullPage: true,
      });
    });
  });
});
