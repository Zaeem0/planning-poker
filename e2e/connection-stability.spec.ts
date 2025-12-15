import { test, expect } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  selectVoteCard,
  waitForPlayerCount,
  waitForDisconnectedPlayers,
  waitForAnyDisconnectedPlayer,
  disconnectSocket,
  closeContexts,
} from './utils/test-helpers';

test.describe('Connection Stability', () => {
  test.describe('Multiple Simultaneous Connections', () => {
    test('should handle 5 users joining simultaneously', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();
      const contexts = [];
      const pages = [];

      // Create 5 browser contexts simulating different users
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }

      // All users join at the same time (tests connection burst prevention)
      const joinPromises = pages.map((page, i) =>
        joinGameAsUser(page, gameId, `User${i + 1}`)
      );
      await Promise.all(joinPromises);

      // Verify all users see all 5 players
      for (const page of pages) {
        await waitForPlayerCount(page, 5);
      }

      // Verify no disconnections occurred
      for (const page of pages) {
        await expect(page.locator('.player-card-disconnected')).toHaveCount(0);
      }

      await closeContexts(...contexts);
    });

    test('should handle 10 users joining simultaneously', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();
      const contexts = [];
      const pages = [];

      // Create 10 browser contexts (closer to the 14-user scenario)
      for (let i = 0; i < 10; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }

      // All users join simultaneously
      const joinPromises = pages.map((page, i) =>
        joinGameAsUser(page, gameId, `User${i + 1}`)
      );
      await Promise.all(joinPromises);

      // Verify all users see all 10 players
      for (const page of pages) {
        await waitForPlayerCount(page, 10);
      }

      // Verify no disconnections occurred
      for (const page of pages) {
        await expect(page.locator('.player-card-disconnected')).toHaveCount(0);
      }

      await closeContexts(...contexts);
    });
  });

  test.describe('Automatic Reconnection', () => {
    test('should automatically reconnect after temporary disconnection', async ({
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

      // Manually disconnect Alice's socket
      await disconnectSocket(alicePage);

      // Bob should see Alice as disconnected
      await waitForAnyDisconnectedPlayer(bobPage);

      // Wait for automatic reconnection (should happen within a few seconds)
      await waitForDisconnectedPlayers(bobPage, 0);

      // Verify Alice reconnected successfully
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();
      await waitForPlayerCount(alicePage, 2);

      await closeContexts(aliceContext, bobContext);
    });

    test('should preserve vote after reconnection', async ({ browser }) => {
      const gameId = generateUniqueGameId();

      const context = await browser.newContext();
      const page = await context.newPage();

      await joinGameAsUser(page, gameId, 'VoteUser');
      await selectVoteCard(page, 'l');

      const voteCard = page.locator('[data-vote="l"]');
      await expect(voteCard).toHaveClass(/selected/);

      // Disconnect and wait for auto-reconnection
      await disconnectSocket(page);
      await page.waitForTimeout(3000);

      // Vote should still be selected after reconnection
      await expect(voteCard).toHaveClass(/selected/);

      await closeContexts(context);
    });
  });

  test.describe('Long Idle Periods', () => {
    test('should maintain connection during 30 second idle period', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'IdleUser');

      // Wait 30 seconds (simulating break between rounds)
      await page.waitForTimeout(30000);

      // User should still be connected
      await expect(page.getByText('IdleUser(you)')).toBeVisible();
      await expect(page.locator('.player-card-disconnected')).toHaveCount(0);
    });

    test('should maintain connection during 60 second idle period', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'LongIdleUser');

      // Wait 60 seconds (tests the 2-minute pingTimeout setting)
      await page.waitForTimeout(60000);

      // User should still be connected
      await expect(page.getByText('LongIdleUser(you)')).toBeVisible();
      await expect(page.locator('.player-card-disconnected')).toHaveCount(0);
    });
  });

  test.describe('Tab Switching', () => {
    test('should handle user tabbing away and returning', async ({
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

      // Simulate Alice tabbing away by creating a new tab and switching to it
      const newTab = await aliceContext.newPage();
      await newTab.goto('about:blank');

      // Wait 10 seconds (user is on different tab)
      await newTab.waitForTimeout(10000);

      // Switch back to game tab
      await alicePage.bringToFront();

      // Alice should still be connected
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();
      await waitForPlayerCount(alicePage, 2);
      await expect(alicePage.locator('.player-card-disconnected')).toHaveCount(
        0
      );

      await newTab.close();
      await closeContexts(aliceContext, bobContext);
    });
  });

  test.describe('Reconnection with State Sync', () => {
    test('should sync user list after reconnection', async ({ browser }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const charlieContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();
      const charliePage = await charlieContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await waitForPlayerCount(alicePage, 2);
      await waitForPlayerCount(bobPage, 2);

      // Disconnect Alice
      await disconnectSocket(alicePage);
      await waitForAnyDisconnectedPlayer(bobPage);

      // Charlie joins while Alice is disconnected
      await joinGameAsUser(charliePage, gameId, 'Charlie');
      await waitForPlayerCount(bobPage, 3);
      await waitForPlayerCount(charliePage, 3);

      // Wait for Alice to auto-reconnect
      await alicePage.waitForTimeout(3000);

      // Alice should see all 3 users after reconnection
      await waitForPlayerCount(alicePage, 3);
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();
      await expect(alicePage.getByText('Bob')).toBeVisible();
      await expect(alicePage.getByText('Charlie')).toBeVisible();

      await closeContexts(aliceContext, bobContext, charlieContext);
    });

    test('should maintain revealed state after reconnection', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await selectVoteCard(alicePage, 'm');
      await selectVoteCard(bobPage, 'l');

      // Reveal votes
      const revealButton = alicePage.locator('button:has-text("Reveal Votes")');
      await revealButton.click();

      await expect(alicePage.locator('.player-card-revealed')).toHaveCount(2);

      // Disconnect Alice and wait for auto-reconnection
      await disconnectSocket(alicePage);
      await alicePage.waitForTimeout(3000);

      // Votes should still be revealed after reconnection
      await expect(alicePage.locator('.player-card-revealed')).toHaveCount(2);

      await closeContexts(aliceContext, bobContext);
    });
  });

  test.describe('Connection Error Handling', () => {
    test('should handle multiple rapid disconnects and reconnects', async ({
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

      // Disconnect and reconnect 3 times rapidly (tests reconnection resilience)
      for (let i = 0; i < 3; i++) {
        await disconnectSocket(alicePage);
        await alicePage.waitForTimeout(2000);
      }

      // Alice should still be functional after multiple reconnects
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();
      await waitForPlayerCount(alicePage, 2);

      // Should be able to vote after reconnections
      await selectVoteCard(alicePage, 's');
      const voteCard = alicePage.locator('[data-vote="s"]');
      await expect(voteCard).toHaveClass(/selected/);

      await closeContexts(aliceContext, bobContext);
    });
  });
});
