import { test, expect } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  joinGameAsSpectator,
  navigateToGame,
  waitForJoinFormVisible,
  closeContexts,
} from './utils/test-helpers';

test.describe('Joining a Game', () => {
  test.describe('Join Form', () => {
    test('should show create form for new game', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);

      await waitForJoinFormVisible(page);
      await expect(page.getByPlaceholder('Enter your name')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Create Game' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Create Game' })
      ).toBeVisible();

      await closeContexts(context);
    });

    test('should disable create button when name is empty', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      const createButton = page.getByRole('button', { name: 'Create Game' });
      await expect(createButton).toBeDisabled();

      await closeContexts(context);
    });

    test('should disable create button when name is only whitespace', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByPlaceholder('Enter your name').fill('   ');
      const createButton = page.getByRole('button', { name: 'Create Game' });
      await expect(createButton).toBeDisabled();

      await closeContexts(context);
    });

    test('should enable create button when name is entered', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByPlaceholder('Enter your name').fill('TestUser');
      const createButton = page.getByRole('button', { name: 'Create Game' });
      await expect(createButton).toBeEnabled();

      await closeContexts(context);
    });

    test('should create game with entered name', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      const username = 'JoinedUser';
      await page.getByPlaceholder('Enter your name').fill(username);
      await page.getByRole('button', { name: 'Create Game' }).click();

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

  test.describe('Create Game vs Join Game', () => {
    test('should show join form when joining existing game', async ({
      browser,
    }) => {
      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      const gameId = generateUniqueGameId();

      // Alice creates the game
      await joinGameAsUser(alicePage, gameId, 'Alice');

      // Bob joins the existing game - should see "Join Game" not "Create Game"
      await navigateToGame(bobPage, gameId);
      await waitForJoinFormVisible(bobPage);
      await expect(
        bobPage.getByRole('heading', { name: 'Join Game' })
      ).toBeVisible();
      await expect(
        bobPage.getByRole('button', { name: 'Join Game' })
      ).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });

    test('should show card set toggle only when creating game', async ({
      browser,
    }) => {
      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      const gameId = generateUniqueGameId();

      // Alice sees card set toggle button when creating
      await navigateToGame(alicePage, gameId);
      await waitForJoinFormVisible(alicePage);
      await expect(
        alicePage.getByRole('heading', { name: 'Create Game' })
      ).toBeVisible({ timeout: 10000 });
      await expect(
        alicePage.getByRole('button', { name: /Settings/ })
      ).toBeVisible();

      await expect(alicePage.locator('.card-set-selector')).not.toBeVisible();

      await alicePage.getByRole('button', { name: /Settings/ }).click();
      await expect(alicePage.locator('.card-set-selector')).toBeVisible();

      await alicePage.getByPlaceholder('Enter your name').fill('Alice');
      await alicePage.getByRole('button', { name: 'Create Game' }).click();
      await expect(alicePage.locator('.game-page')).toBeVisible();
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();
      await alicePage.waitForTimeout(500);

      await navigateToGame(bobPage, gameId);
      await waitForJoinFormVisible(bobPage);
      await expect(
        bobPage.getByRole('heading', { name: 'Join Game' })
      ).toBeVisible({ timeout: 10000 });
      await expect(
        bobPage.getByRole('button', { name: /Settings/ })
      ).not.toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });

    test('should persist hasJoined status in localStorage', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      // Verify localStorage has the hasJoined flag
      const hasJoined = await page.evaluate(
        (gid) => localStorage.getItem(`hasJoined-${gid}`),
        gameId
      );
      expect(hasJoined).toBe('true');

      // After reload, should go directly to game page without showing form
      await page.reload();
      await expect(page.locator('.game-page')).toBeVisible();
      await expect(page.getByText('TestUser(you)')).toBeVisible();
    });

    test('should use game card set from existing game', async ({ browser }) => {
      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      const gameId = generateUniqueGameId();

      // Alice creates game with Fibonacci card set
      await navigateToGame(alicePage, gameId);
      await expect(alicePage.locator('.join-form')).toBeVisible();
      await expect(
        alicePage.getByRole('heading', { name: 'Create Game' })
      ).toBeVisible({ timeout: 10000 });

      await alicePage.getByRole('button', { name: /Settings/ }).click();

      // Select Fibonacci preset
      const fibButton = alicePage
        .locator('.card-set-preset-button')
        .filter({ hasText: 'Fibonacci' });
      await fibButton.click();

      await alicePage.getByPlaceholder('Enter your name').fill('Alice');
      await alicePage.getByRole('button', { name: 'Create Game' }).click();
      await expect(alicePage.locator('.game-page')).toBeVisible();
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();
      await alicePage.waitForTimeout(500);

      // Bob joins and should see Fibonacci cards (not T-Shirt default)
      await joinGameAsUser(bobPage, gameId, 'Bob');
      await expect(bobPage.getByText('Bob(you)')).toBeVisible();

      // Verify Fibonacci cards are visible (1, 2, 3, 5, 8...)
      await expect(bobPage.locator('[data-card-value="1"]')).toBeVisible();
      await expect(bobPage.locator('[data-card-value="2"]')).toBeVisible();
      await expect(bobPage.locator('[data-card-value="3"]')).toBeVisible();
      await expect(bobPage.locator('[data-card-value="5"]')).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });

    test('should allow name change when rejoining game', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();

      // First join with name "OldName"
      await joinGameAsUser(page, gameId, 'OldName');
      await expect(page.getByText('OldName(you)')).toBeVisible();

      // Clear localStorage to simulate needing to rejoin
      await page.evaluate((gid) => {
        localStorage.removeItem(`hasJoined-${gid}`);
      }, gameId);

      // Reload page - should see join form
      await page.reload();
      await expect(page.locator('.join-form')).toBeVisible();

      // Enter new name and join
      await page.getByPlaceholder('Enter your name').fill('NewName');
      await page.getByRole('button', { name: 'Join Game' }).click();

      // Should see new name
      await expect(page.locator('.game-page')).toBeVisible();
      await expect(page.getByText('NewName(you)')).toBeVisible();

      await closeContexts(context);
    });
  });

  test.describe('Game Settings', () => {
    test('should show game settings gear icon in game header', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      await expect(page.locator('.game-settings-button')).toBeVisible();
    });

    test('should open game settings dialog when clicking gear icon', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      await page.locator('.game-settings-button').click();
      await expect(page.locator('.game-settings-dialog')).toBeVisible();
      await expect(page.locator('.card-set-selector')).toBeVisible();
    });

    test('should close game settings dialog when clicking outside', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      await page.locator('.game-settings-button').click();
      await expect(page.locator('.game-settings-dialog')).toBeVisible();

      // Click outside the dialog
      await page
        .locator('.game-settings-dialog-overlay')
        .click({ position: { x: 10, y: 10 } });
      await expect(page.locator('.game-settings-dialog')).not.toBeVisible();
    });

    test('should update card set for all players when changed', async ({
      browser,
    }) => {
      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      const gameId = generateUniqueGameId();

      // Alice creates game with T-Shirt (default)
      await joinGameAsUser(alicePage, gameId, 'Alice');
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();

      // Bob joins the game
      await joinGameAsUser(bobPage, gameId, 'Bob');
      await expect(bobPage.getByText('Bob(you)')).toBeVisible();

      // Verify both see T-Shirt cards initially
      await expect(alicePage.locator('[data-card-size="xs"]')).toBeVisible();
      await expect(bobPage.locator('[data-card-size="xs"]')).toBeVisible();

      // Alice opens game settings and changes to Fibonacci
      await alicePage.locator('.game-settings-button').click();
      await expect(alicePage.locator('.game-settings-dialog')).toBeVisible();

      const fibButton = alicePage
        .locator('.card-set-preset-button')
        .filter({ hasText: 'Fibonacci' });
      await fibButton.click();

      // Click Update Settings to apply changes
      await alicePage.getByRole('button', { name: 'Update Settings' }).click();

      // Wait for dialog to close and update to propagate
      await expect(
        alicePage.locator('.game-settings-dialog')
      ).not.toBeVisible();
      await alicePage.waitForTimeout(500);

      // Verify both Alice and Bob now see Fibonacci cards
      await expect(alicePage.locator('[data-card-value="1"]')).toBeVisible();
      await expect(alicePage.locator('[data-card-value="2"]')).toBeVisible();
      await expect(bobPage.locator('[data-card-value="1"]')).toBeVisible();
      await expect(bobPage.locator('[data-card-value="2"]')).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });

    test('should clear vote when voted card is removed from settings', async ({
      browser,
    }) => {
      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      const gameId = generateUniqueGameId();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();

      await joinGameAsUser(bobPage, gameId, 'Bob');
      await expect(bobPage.getByText('Bob(you)')).toBeVisible();

      // Bob votes for the XS card
      await bobPage.locator('[data-card-size="xs"]').click();
      await expect(bobPage.locator('[data-card-size="xs"]')).toHaveClass(
        /selected/
      );

      // Verify Bob shows as voted in both views
      const aliceBobCard = alicePage
        .locator('.table-player')
        .filter({ hasText: 'Bob' });
      const bobBobCard = bobPage
        .locator('.table-player')
        .filter({ hasText: 'Bob' });
      await expect(aliceBobCard.locator('.player-card-voted')).toBeVisible();
      await expect(bobBobCard.locator('.player-card-voted')).toBeVisible();

      // Alice opens settings and removes the XS card
      await alicePage.locator('.game-settings-button').click();
      await expect(alicePage.locator('.game-settings-dialog')).toBeVisible();

      // Remove the first card (XS)
      const removeButtons = alicePage.locator('.card-set-editor-card-remove');
      await removeButtons.first().click();

      // Apply changes
      await alicePage.getByRole('button', { name: 'Update Settings' }).click();
      await expect(
        alicePage.locator('.game-settings-dialog')
      ).not.toBeVisible();
      await alicePage.waitForTimeout(500);

      // Bob's vote should be cleared - no longer shows as voted
      await expect(
        aliceBobCard.locator('.player-card-voted')
      ).not.toBeVisible();
      await expect(bobBobCard.locator('.player-card-voted')).not.toBeVisible();

      // Bob's selected card should be cleared
      await expect(bobPage.locator('.voting-card.selected')).toHaveCount(0);

      await closeContexts(aliceContext, bobContext);
    });

    test('should show editable cards for preset card sets', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByRole('button', { name: /Settings/ }).click();
      await expect(page.locator('.card-set-selector')).toBeVisible();

      await expect(page.locator('.card-set-editor')).toBeVisible();
      const labelInputs = page.locator('.card-set-editor-card-label');
      await expect(labelInputs).toHaveCount(6);
      await expect(labelInputs.first()).toHaveValue('🐜');
    });

    test('should allow editing preset card values', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByRole('button', { name: /Settings/ }).click();

      const labelInputs = page.locator('.card-set-editor-card-label');
      await expect(labelInputs.first()).toHaveValue('🐜');

      await labelInputs.first().clear();
      await labelInputs.first().fill('🚀');
      await expect(labelInputs.first()).toHaveValue('🚀');
    });

    test('should create game with edited preset cards', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByRole('button', { name: /Settings/ }).click();

      const labelInputs = page.locator('.card-set-editor-card-label');
      await labelInputs.first().clear();
      await labelInputs.first().fill('🎯');

      await page.getByPlaceholder('Enter your name').fill('TestUser');
      await page.getByRole('button', { name: 'Create Game' }).click();

      await expect(page.locator('.game-page')).toBeVisible();
      await expect(page.locator('.voting-card-emoji').first()).toContainText(
        '🎯'
      );
    });

    test('should not flash default cards when creating game with custom cards', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByRole('button', { name: /Settings/ }).click();

      const fibButton = page
        .locator('.card-set-preset-button')
        .filter({ hasText: 'Fibonacci' });
      await fibButton.click();

      await page.getByPlaceholder('Enter your name').fill('TestUser');
      await page.getByRole('button', { name: 'Create Game' }).click();

      await expect(page.locator('.game-page')).toBeVisible();
      await expect(page.locator('.voting-card-emoji').first()).toContainText(
        '1️⃣'
      );
      await expect(
        page.locator('.voting-card-emoji').first()
      ).not.toContainText('🐜');
    });

    test('should preserve edits when switching between presets', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByRole('button', { name: /Settings/ }).click();

      const labelInputs = page.locator('.card-set-editor-card-label');
      await labelInputs.first().clear();
      await labelInputs.first().fill('🌟');

      const fibButton = page
        .locator('.card-set-preset-button')
        .filter({ hasText: 'Fibonacci' });
      await fibButton.click();
      await expect(labelInputs.first()).toHaveValue('1️⃣');

      const tshirtButton = page
        .locator('.card-set-preset-button')
        .filter({ hasText: 'T-Shirts' });
      await tshirtButton.click();
      await expect(labelInputs.first()).toHaveValue('🌟');
    });

    test('should reset preset to default when clicking reset button', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByRole('button', { name: /Settings/ }).click();

      const labelInputs = page.locator('.card-set-editor-card-label');
      await expect(labelInputs.first()).toHaveValue('🐜');

      await labelInputs.first().clear();
      await labelInputs.first().fill('🚀');
      await expect(labelInputs.first()).toHaveValue('🚀');

      await page.locator('.card-set-editor-reset').click();
      await expect(labelInputs.first()).toHaveValue('🐜');
    });

    test('should allow drag and drop to reorder cards', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await page.getByRole('button', { name: /Settings/ }).click();

      const labelInputs = page.locator('.card-set-editor-card-label');
      await expect(labelInputs.first()).toHaveValue('🐜');
      await expect(labelInputs.nth(1)).toHaveValue('🐰');

      const cards = page.locator('.card-set-editor-card');
      const firstCard = cards.first();
      const secondCard = cards.nth(1);

      await firstCard.dragTo(secondCard);

      await expect(labelInputs.first()).toHaveValue('🐰');
      await expect(labelInputs.nth(1)).toHaveValue('🐜');
    });
  });

  test.describe('Spectator Mode', () => {
    test('should show spectator toggle on join form', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      await expect(page.getByText('Join as spectator')).toBeVisible();

      await closeContexts(context);
    });

    test('should join as spectator when toggle is enabled', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsSpectator(page, gameId, 'SpectatorUser');

      await expect(page.getByText('SpectatorUser(you)')).toBeVisible();
      await expect(page.getByText('(spectator)')).toBeVisible();
    });

    test('should show spectator emoji on player card', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsSpectator(page, gameId, 'SpectatorUser');

      await expect(page.locator('.player-card-spectator')).toBeVisible();
      await expect(page.locator('.player-card-spectator')).toContainText('👁️');
    });

    test('should show voting cards for spectators without hint', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsSpectator(page, gameId, 'SpectatorUser');

      await expect(page.locator('.voting-section-bottom')).toBeVisible();
      await expect(page.locator('.voting-hint')).not.toBeVisible();
    });

    test('should not allow keyboard voting for spectators', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsSpectator(page, gameId, 'SpectatorUser');

      await page.keyboard.press('m');

      await expect(
        page.locator('.player-card-spectator.player-card-voted')
      ).not.toBeVisible();
    });

    test('should not allow clicking cards for spectators', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsSpectator(page, gameId, 'SpectatorUser');

      // Verify voting cards are disabled for spectators
      const votingCard = page.locator('[data-card-size="m"]');
      await expect(votingCard).toBeDisabled();

      // Verify spectator hasn't voted
      await expect(
        page.locator('.player-card-spectator.player-card-voted')
      ).not.toBeVisible();

      // Verify no card is selected
      await expect(
        page.locator('.voting-card-small.selected')
      ).not.toBeVisible();
    });
  });
});
