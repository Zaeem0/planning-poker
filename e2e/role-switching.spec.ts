import { test, expect } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  joinGameAsSpectator,
  selectVoteCard,
  waitForPlayerCount,
  closeContexts,
} from './utils/test-helpers';

test.describe('Role Switching', () => {
  test('should allow player to switch to spectator', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsUser(page, gameId, 'Alice');

    // Verify Alice is a player initially
    await expect(page.getByText('Alice(you)')).toBeVisible();
    await expect(page.getByText('(spectator)')).not.toBeVisible();

    // Click the role toggle button
    const roleToggleButton = page.locator('.role-toggle-button');
    await expect(roleToggleButton).toBeVisible();
    await roleToggleButton.click();

    // Verify Alice is now a spectator
    await expect(page.getByText('(spectator)')).toBeVisible();

    // Verify the role toggle button shows player icon (🎮)
    await expect(roleToggleButton).toHaveText('🎮');
  });

  test('should allow spectator to switch to player', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsSpectator(page, gameId, 'Bob');

    // Verify Bob is a spectator initially
    await expect(page.getByText('Bob(you)')).toBeVisible();
    await expect(page.getByText('(spectator)')).toBeVisible();

    // Click the role toggle button
    const roleToggleButton = page.locator('.role-toggle-button');
    await expect(roleToggleButton).toBeVisible();
    await expect(roleToggleButton).toHaveText('🎮');
    await roleToggleButton.click();

    // Verify Bob is now a player
    await expect(page.getByText('(spectator)')).not.toBeVisible();

    // Verify the role toggle button shows spectator icon (👁️)
    await expect(roleToggleButton).toHaveText('👁️');
  });

  test('should clear vote when switching from player to spectator', async ({
    browser,
  }) => {
    const gameId = generateUniqueGameId();

    const aliceContext = await browser.newContext();
    const bobContext = await browser.newContext();
    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();

    await joinGameAsUser(alicePage, gameId, 'Alice');
    await joinGameAsUser(bobPage, gameId, 'Bob');

    await waitForPlayerCount(alicePage, 2);
    await waitForPlayerCount(bobPage, 2);

    // Alice votes
    await selectVoteCard(alicePage, 'm');
    const voteCard = alicePage.locator('[data-card-size="m"]');
    await expect(voteCard).toHaveClass(/selected/);

    // Bob should see Alice has voted
    await expect(bobPage.locator('.player-card-voted')).toHaveCount(1);

    // Alice switches to spectator
    const roleToggleButton = alicePage.locator('.role-toggle-button');
    await roleToggleButton.click();

    // Verify Alice's vote is cleared
    await expect(voteCard).not.toHaveClass(/selected/);

    // Bob should see no votes
    await expect(bobPage.locator('.player-card-voted')).toHaveCount(0);

    await closeContexts(aliceContext, bobContext);
  });

  test('should sync role change across all users', async ({ browser }) => {
    const gameId = generateUniqueGameId();

    const aliceContext = await browser.newContext();
    const bobContext = await browser.newContext();
    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();

    await joinGameAsUser(alicePage, gameId, 'Alice');
    await joinGameAsUser(bobPage, gameId, 'Bob');

    await waitForPlayerCount(alicePage, 2);
    await waitForPlayerCount(bobPage, 2);

    // Alice switches to spectator
    const roleToggleButton = alicePage.locator('.role-toggle-button');
    await roleToggleButton.click();

    // Bob should see Alice as spectator
    await expect(bobPage.getByText('Alice')).toBeVisible();
    await expect(bobPage.getByText('(spectator)')).toBeVisible();

    // Alice switches back to player
    await roleToggleButton.click();

    // Bob should see Alice as player again (no spectator label)
    const spectatorLabels = bobPage.locator('.player-spectator');
    await expect(spectatorLabels).toHaveCount(0);

    await closeContexts(aliceContext, bobContext);
  });

  test('should allow voting after switching from spectator to player', async ({
    page,
  }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsSpectator(page, gameId, 'Charlie');

    // Switch to player
    const roleToggleButton = page.locator('.role-toggle-button');
    await roleToggleButton.click();

    // Verify can vote
    await selectVoteCard(page, 'l');
    const voteCard = page.locator('[data-card-size="l"]');
    await expect(voteCard).toHaveClass(/selected/);
  });

  test('should not allow voting as spectator', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsSpectator(page, gameId, 'Dave');

    // Verify voting hint is not shown for spectators
    await expect(page.locator('.voting-hint')).not.toBeVisible();

    // Verify voting cards container has spectator-mode class
    await expect(page.locator('.voting-cards-bottom')).toHaveClass(
      /spectator-mode/
    );

    // Verify voting cards are not clickable (pointer-events: none)
    const votingCard = page.locator('[data-card-size="m"]');
    await expect(votingCard).not.toHaveClass(/selected/);
  });

  test('spectator should see voting progress', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsSpectator(page, gameId, 'Eve');

    const tableMessage = page.locator('.table-message');
    await expect(tableMessage).toHaveText('Watching the game');
  });
});
