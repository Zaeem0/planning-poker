import { test, expect } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  selectVoteCard,
  clickRevealVotes,
  clickNewRound,
  waitForPlayerCount,
  getPlayerCard,
  getVoteCard,
  closeContexts,
} from './utils/test-helpers';

test.describe('Multi-User-Sync', () => {
  test.describe('Player Sync', () => {
    test('should sync player count when new user joins', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await waitForPlayerCount(alicePage, 1);

      await joinGameAsUser(bobPage, gameId, 'Bob');

      await waitForPlayerCount(alicePage, 2);
      await waitForPlayerCount(bobPage, 2);

      await closeContexts(aliceContext, bobContext);
    });

    test('should show existing players to late joiner', async ({ browser }) => {
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

      await joinGameAsUser(charliePage, gameId, 'Charlie');

      await waitForPlayerCount(charliePage, 3);
      await waitForPlayerCount(alicePage, 3);
      await waitForPlayerCount(bobPage, 3);

      await closeContexts(aliceContext, bobContext, charlieContext);
    });

    test('should allow multiple users with same name', async ({ browser }) => {
      const gameId = generateUniqueGameId();

      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      await joinGameAsUser(page1, gameId, 'SameName');
      await joinGameAsUser(page2, gameId, 'SameName');

      await waitForPlayerCount(page1, 2);

      const playerCount = await page1.locator('.table-player').count();
      expect(playerCount).toBe(2);

      await closeContexts(context1, context2);
    });
  });

  test.describe('Vote Sync', () => {
    test('should show vote indicator to other users when someone votes', async ({
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

      const aliceCardOnBobScreen = getPlayerCard(bobPage, 'Alice');
      await expect(
        aliceCardOnBobScreen.locator('.player-card-voted')
      ).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });

    test('should sync revealed votes across all users', async ({ browser }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await selectVoteCard(alicePage, 's');
      await selectVoteCard(bobPage, 'l');

      await clickRevealVotes(alicePage);

      await expect(bobPage.locator('.player-card-revealed')).toHaveCount(2);
      await expect(alicePage.locator('.player-card-revealed')).toHaveCount(2);

      await closeContexts(aliceContext, bobContext);
    });

    test('should show correct vote values after reveal to all users', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await selectVoteCard(alicePage, 'xs');
      await selectVoteCard(bobPage, 'xl');

      await clickRevealVotes(alicePage);

      await expect(bobPage.locator('.player-card-emoji')).toContainText([
        '🐜',
        '🦕',
      ]);

      await closeContexts(aliceContext, bobContext);
    });

    test('should show vote count during voting', async ({ browser }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await waitForPlayerCount(alicePage, 2);

      await selectVoteCard(alicePage, 'm');

      await expect(alicePage.locator('.table-message')).toContainText(
        '1 of 2 voted'
      );

      await closeContexts(aliceContext, bobContext);
    });

    test('should show all voted message when everyone voted', async ({
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

      await selectVoteCard(alicePage, 'm');
      await selectVoteCard(bobPage, 's');

      await expect(alicePage.locator('.table-message')).toContainText(
        'All voted! Ready to reveal'
      );

      await closeContexts(aliceContext, bobContext);
    });

    test('should highlight most common vote after reveal', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const charlieContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();
      const charliePage = await charlieContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');
      await joinGameAsUser(charliePage, gameId, 'Charlie');

      await selectVoteCard(alicePage, 'm');
      await selectVoteCard(bobPage, 'm');
      await selectVoteCard(charliePage, 'l');

      await clickRevealVotes(alicePage);

      await expect(getVoteCard(alicePage, 'm')).toHaveClass(/most-common/);
      await expect(getVoteCard(alicePage, 'l')).not.toHaveClass(/most-common/);

      await closeContexts(aliceContext, bobContext, charlieContext);
    });

    test('should show percentage on voting cards after reveal', async ({
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
      await selectVoteCard(bobPage, 'm');

      await clickRevealVotes(alicePage);

      const mediumCard = getVoteCard(alicePage, 'm');
      await expect(mediumCard.locator('.voting-card-percentage')).toContainText(
        '100%'
      );

      await closeContexts(aliceContext, bobContext);
    });
  });

  test.describe('New Round Sync', () => {
    test('should reset votes for all users on new round', async ({
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
      await clickRevealVotes(alicePage);

      await clickNewRound(alicePage);

      await expect(getVoteCard(alicePage, 'm')).not.toHaveClass(/selected/);
      await expect(getVoteCard(bobPage, 'l')).not.toHaveClass(/selected/);

      await expect(alicePage.locator('.player-card-revealed')).toHaveCount(0);
      await expect(bobPage.locator('.player-card-revealed')).toHaveCount(0);

      await closeContexts(aliceContext, bobContext);
    });
  });

  test.describe('Late Joiner', () => {
    test('should see existing votes state when joining mid-session', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await selectVoteCard(alicePage, 'm');

      const bobContext = await browser.newContext();
      const bobPage = await bobContext.newPage();
      await joinGameAsUser(bobPage, gameId, 'Bob');

      const aliceCardOnBobScreen = getPlayerCard(bobPage, 'Alice');
      await expect(
        aliceCardOnBobScreen.locator('.player-card-voted')
      ).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });

    test('should see revealed state when joining after reveal', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await selectVoteCard(alicePage, 's');
      await clickRevealVotes(alicePage);

      const bobContext = await browser.newContext();
      const bobPage = await bobContext.newPage();
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await expect(bobPage.locator('.player-card-revealed')).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });
  });
});
