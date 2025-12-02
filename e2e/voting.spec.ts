import { test, expect } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  selectVoteCard,
  pressVoteKey,
  clickRevealVotes,
  clickNewRound,
  navigateToGame,
  waitForJoinFormVisible,
  getVoteCard,
  getRevealButton,
  getPlayerCard,
  closeContexts,
} from './utils/test-helpers';

test.describe('Voting', () => {
  test.describe('Card Selection', () => {
    test('should allow selecting each card size', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'VoteUser');

      const cardSizes = ['xs', 's', 'm', 'l', 'xl', 'unknown'];

      for (const size of cardSizes) {
        await selectVoteCard(page, size);
        await expect(getVoteCard(page, size)).toHaveClass(/selected/);
      }
    });

    test('should show only one card selected at a time', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'SingleSelect');

      await selectVoteCard(page, 's');
      await expect(getVoteCard(page, 's')).toHaveClass(/selected/);

      await selectVoteCard(page, 'l');
      await expect(getVoteCard(page, 'l')).toHaveClass(/selected/);
      await expect(getVoteCard(page, 's')).not.toHaveClass(/selected/);
    });

    test('should allow changing vote before reveal', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'ChangeVote');

      await selectVoteCard(page, 'xs');
      await expect(getVoteCard(page, 'xs')).toHaveClass(/selected/);

      await selectVoteCard(page, 'xl');
      await expect(getVoteCard(page, 'xl')).toHaveClass(/selected/);
      await expect(getVoteCard(page, 'xs')).not.toHaveClass(/selected/);
    });

    test('should handle rapid vote changes', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'RapidVoter');

      await selectVoteCard(page, 'xs');
      await selectVoteCard(page, 's');
      await selectVoteCard(page, 'm');
      await selectVoteCard(page, 'l');
      await selectVoteCard(page, 'xl');

      await expect(getVoteCard(page, 'xl')).toHaveClass(/selected/);
      await expect(getVoteCard(page, 'xs')).not.toHaveClass(/selected/);
    });

    test('should allow unselecting a card by clicking it again', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'UnselectUser');

      const playerCard = getPlayerCard(page, 'UnselectUser').locator(
        '.player-card'
      );

      await selectVoteCard(page, 'm');
      await expect(getVoteCard(page, 'm')).toHaveClass(/selected/);
      await expect(playerCard).toHaveClass(/player-card-voted/);

      await selectVoteCard(page, 'm');
      await expect(getVoteCard(page, 'm')).not.toHaveClass(/selected/);
      await expect(playerCard).not.toHaveClass(/player-card-voted/);
    });
  });

  test.describe('Keyboard Voting', () => {
    test('should vote with single key press for s, m, l', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'KeyboardVoter');

      await pressVoteKey(page, 's');
      await expect(getVoteCard(page, 's')).toHaveClass(/selected/);

      await pressVoteKey(page, 'm');
      await expect(getVoteCard(page, 'm')).toHaveClass(/selected/);

      await pressVoteKey(page, 'l');
      await expect(getVoteCard(page, 'l')).toHaveClass(/selected/);
    });

    test('should vote with two key press for xs and xl', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'TwoKeyVoter');

      await pressVoteKey(page, 'xs');
      await expect(getVoteCard(page, 'xs')).toHaveClass(/selected/);

      await pressVoteKey(page, 'xl');
      await expect(getVoteCard(page, 'xl')).toHaveClass(/selected/);
    });

    test('should vote unknown with ? key', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'UnknownVoter');

      await pressVoteKey(page, 'unknown');
      await expect(getVoteCard(page, 'unknown')).toHaveClass(/selected/);
    });

    test('should show vote indicator after keyboard vote', async ({ page }) => {
      const gameId = generateUniqueGameId();
      const username = 'KeyIndicator';
      await joinGameAsUser(page, gameId, username);

      await pressVoteKey(page, 'm');

      const playerCard = getPlayerCard(page, username);
      await expect(playerCard.locator('.player-card-voted')).toBeVisible();
    });

    test('should not vote when typing in username input', async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const gameId = generateUniqueGameId();
      await navigateToGame(page, gameId);
      await waitForJoinFormVisible(page);

      const usernameInput = page.getByPlaceholder('Enter your name');
      await usernameInput.focus();
      await usernameInput.pressSequentially('Sam');

      await expect(usernameInput).toHaveValue('Sam');

      await closeContexts(context);
    });
  });

  test.describe('Vote Indicators', () => {
    test('should show voted indicator after selecting a card', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      const username = 'VotedPlayer';
      await joinGameAsUser(page, gameId, username);

      await selectVoteCard(page, 'm');

      const playerCard = getPlayerCard(page, username);
      await expect(playerCard.locator('.player-card-voted')).toBeVisible();
    });

    test('should show card back before reveal', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'HiddenVote');

      await selectVoteCard(page, 'm');

      await expect(page.locator('.player-card-back')).toBeVisible();
      await expect(page.locator('.player-card-revealed')).not.toBeVisible();
    });
  });

  test.describe('Reveal Button', () => {
    test('should disable reveal button when no votes cast', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'NoVote');

      await expect(getRevealButton(page)).toBeDisabled();
    });

    test('should enable reveal button when at least one vote cast', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'HasVote');

      await selectVoteCard(page, 'm');

      await expect(getRevealButton(page)).toBeEnabled();
    });
  });

  test.describe('Vote Reveal', () => {
    test('should show vote emoji after reveal', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'RevealUser');

      await selectVoteCard(page, 'm');
      await clickRevealVotes(page);

      await expect(page.locator('.player-card-revealed')).toBeVisible();
      await expect(page.locator('.player-card-emoji')).toContainText('🐶');
    });

    test('should show new round button after reveal', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'NewRoundUser');

      await selectVoteCard(page, 's');
      await clickRevealVotes(page);

      await expect(
        page.getByRole('button', { name: /new round/i })
      ).toBeVisible();
      await expect(getRevealButton(page)).not.toBeVisible();
    });

    test('should display correct emoji for each vote size', async ({
      browser,
    }) => {
      const gameId = generateUniqueGameId();
      const context = await browser.newContext();
      const page = await context.newPage();

      await joinGameAsUser(page, gameId, 'EmojiTest');

      const voteEmojis = [
        { size: 'xs', emoji: '🐜' },
        { size: 's', emoji: '🐰' },
        { size: 'm', emoji: '🐶' },
        { size: 'l', emoji: '🦒' },
        { size: 'xl', emoji: '🦕' },
        { size: 'unknown', emoji: '❓' },
      ];

      for (const { size, emoji } of voteEmojis) {
        await selectVoteCard(page, size);
        await clickRevealVotes(page);

        await expect(page.locator('.player-card-emoji')).toContainText(emoji);

        await clickNewRound(page);
      }

      await closeContexts(context);
    });

    test('should fade cards with no votes after reveal', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'SoloVoter');

      await selectVoteCard(page, 'm');
      await clickRevealVotes(page);

      await expect(getVoteCard(page, 'm')).toHaveClass(/most-common/);
      await expect(getVoteCard(page, 's')).toHaveClass(/no-votes/);
      await expect(getVoteCard(page, 'l')).toHaveClass(/no-votes/);
    });
  });

  test.describe('Voting Disabled After Reveal', () => {
    test('should not change vote when clicking card after reveal', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'LockedVoter');

      await selectVoteCard(page, 'm');
      await clickRevealVotes(page);

      await selectVoteCard(page, 'l');

      await expect(getVoteCard(page, 'm')).toHaveClass(/most-common/);
      await expect(getVoteCard(page, 'l')).not.toHaveClass(/selected/);
    });

    test('should not change vote when pressing key after reveal', async ({
      page,
    }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'LockedKeyVoter');

      await selectVoteCard(page, 'm');
      await clickRevealVotes(page);

      await pressVoteKey(page, 'l');

      await expect(getVoteCard(page, 'm')).toHaveClass(/most-common/);
      await expect(getVoteCard(page, 'l')).not.toHaveClass(/selected/);
    });
  });

  test.describe('Table Messages', () => {
    test('should show pick cards message when no votes', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'NoVoteUser');

      await expect(page.locator('.table-message')).toContainText(
        'Pick your cards!'
      );
    });

    test('should show revealed message after reveal', async ({ page }) => {
      const gameId = generateUniqueGameId();
      await joinGameAsUser(page, gameId, 'RevealMsgUser');

      await selectVoteCard(page, 'm');
      await clickRevealVotes(page);

      await expect(page.locator('.table-message')).toContainText(
        'Votes revealed!'
      );
    });
  });
});
