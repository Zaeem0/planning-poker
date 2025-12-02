import { test, expect, Page } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  selectVoteCard,
  clickRevealVotes,
  clickNewRound,
  getPersistedUserId,
  waitForPlayerCount,
  waitForDisconnectedPlayers,
  waitForAnyDisconnectedPlayer,
  waitForGamePageVisible,
  disconnectSocket,
  reopenPageInContext,
  closeContexts,
  getVoteCard,
  getPlayerCard,
} from './utils/test-helpers';

test.describe('Persistence', () => {
  test.describe('User ID', () => {
    test('should persist user ID in localStorage across page refreshes', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TestUser');

      const userIdBeforeRefresh = await getPersistedUserId(page);
      expect(userIdBeforeRefresh).toBeTruthy();
      expect(userIdBeforeRefresh).toMatch(/^user_\d+_\w+$/);

      await page.reload();
      await waitForGamePageVisible(page);

      const userIdAfterRefresh = await getPersistedUserId(page);
      expect(userIdAfterRefresh).toBe(userIdBeforeRefresh);
    });
  });

  test.describe('Username', () => {
    test('should remember username on page refresh', async ({ page }) => {
      const gameId = generateUniqueGameId();
      const username = 'PersistentUser';
      await joinGameAsUser(page, gameId, username);

      await expect(page.getByText(username)).toBeVisible();

      await page.reload();
      await waitForGamePageVisible(page);

      await expect(page.getByText(username)).toBeVisible();
      await expect(page.getByPlaceholder('Enter your name')).not.toBeVisible();
    });

    test('should not show join form after reconnection', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'ReconnectUser');

      await page.reload();
      await waitForGamePageVisible(page);

      await expect(page.locator('.join-game-form')).not.toBeVisible();
    });
  });

  test.describe('Vote', () => {
    test('should restore vote selection after page refresh', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'VoteUser');

      const mediumVoteCard = getVoteCard(page, 'm');
      await selectVoteCard(page, 'm');
      await expect(mediumVoteCard).toHaveClass(/selected/);

      await page.reload();
      await waitForGamePageVisible(page);

      await expect(mediumVoteCard).toHaveClass(/selected/);
    });

    test('should maintain hasVoted status after reconnection', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      const username = 'VotedUser';
      await joinGameAsUser(page, gameId, username);

      await selectVoteCard(page, 'l');

      const playerCard = getPlayerCard(page, username);
      const votedIndicator = playerCard.locator('.player-card-voted');
      await expect(votedIndicator).toBeVisible();

      await page.reload();
      await waitForGamePageVisible(page);

      await expect(votedIndicator).toBeVisible();
    });
  });

  test.describe('Revealed Votes', () => {
    test('should restore revealed state after close and reopen', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      let alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await selectVoteCard(alicePage, 's');
      await selectVoteCard(bobPage, 'l');

      await clickRevealVotes(alicePage);

      const getFirstRevealedCard = (page: Page) =>
        page.locator('.table-player').first().locator('.player-card-revealed');

      await expect(getFirstRevealedCard(alicePage)).toBeVisible();

      await alicePage.close();

      await waitForAnyDisconnectedPlayer(bobPage);

      alicePage = await reopenPageInContext(aliceContext, gameId);
      await expect(alicePage.getByText('Alice(you)')).toBeVisible();

      await expect(getFirstRevealedCard(alicePage)).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });

    test('should show all votes after reveal and reconnection', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      let alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await selectVoteCard(alicePage, 'm');
      await selectVoteCard(bobPage, 'xl');

      await clickRevealVotes(alicePage);

      await alicePage.close();

      await waitForAnyDisconnectedPlayer(bobPage);

      alicePage = await reopenPageInContext(aliceContext, gameId);

      const revealedCardsCount = await alicePage
        .locator('.player-card-revealed')
        .count();
      expect(revealedCardsCount).toBe(2);

      await closeContexts(aliceContext, bobContext);
    });
  });

  test.describe('New Round Reset', () => {
    test('should clear votes but preserve users after new round', async ({
      browser,
    }) => {
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

      await clickNewRound(alicePage);

      const aliceSmallCard = getVoteCard(alicePage, 's');
      const bobLargeCard = getVoteCard(bobPage, 'l');
      await expect(aliceSmallCard).not.toHaveClass(/selected/);
      await expect(bobLargeCard).not.toHaveClass(/selected/);

      await expect(alicePage.getByText('Alice')).toBeVisible();
      await expect(alicePage.getByText('Bob')).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });
  });

  test.describe('Disconnect Handling', () => {
    test('should show disconnected state for offline users', async ({
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

      // Directly disconnect socket via JavaScript - most reliable approach
      await disconnectSocket(bobPage);

      await waitForAnyDisconnectedPlayer(alicePage);

      await closeContexts(aliceContext, bobContext);
    });

    test('should maintain users after reconnection', async ({ browser }) => {
      const gameId = generateUniqueGameId();

      const aliceContext = await browser.newContext();
      const bobContext = await browser.newContext();
      const alicePage = await aliceContext.newPage();
      let bobPage = await bobContext.newPage();

      await joinGameAsUser(alicePage, gameId, 'Alice');
      await joinGameAsUser(bobPage, gameId, 'Bob');

      await waitForPlayerCount(alicePage, 2);
      await waitForPlayerCount(bobPage, 2);

      // Directly disconnect socket via JavaScript
      await disconnectSocket(bobPage);

      await waitForAnyDisconnectedPlayer(alicePage);

      // Reopen page to reconnect
      bobPage = await reopenPageInContext(bobContext, gameId);

      await waitForPlayerCount(alicePage, 2);
      await waitForDisconnectedPlayers(alicePage, 0);

      await expect(bobPage.getByText('Bob(you)')).toBeVisible();

      await closeContexts(aliceContext, bobContext);
    });
  });
});
