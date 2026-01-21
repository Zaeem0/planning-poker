import { expect, Page, BrowserContext } from '@playwright/test';

export const generateUniqueGameId = () =>
  Math.random().toString(36).substring(2, 8); // 6 random characters

export async function navigateToHomePage(page: Page) {
  await page.goto('/');
  await expect(page.locator('.home-page')).toBeVisible();
}

export async function navigateToGame(page: Page, gameId: string) {
  await page.goto(`/game/${gameId}`);
}

export async function waitForJoinFormVisible(page: Page) {
  await expect(page.locator('.join-form')).toBeVisible();
}

export async function joinGameAsUser(
  page: Page,
  gameId: string,
  username: string
) {
  await navigateToGame(page, gameId);
  await page.getByPlaceholder('Enter your name').fill(username);
  // Use Create Game for new games, Join Game for existing games
  const createButton = page.getByRole('button', { name: 'Create Game' });
  const joinButton = page.getByRole('button', { name: 'Join Game' });
  if (await createButton.isVisible()) {
    await createButton.click();
  } else {
    await joinButton.click();
  }
  await waitForGamePageVisible(page);
  await expect(page.getByText(`${username}(you)`)).toBeVisible();
}

export async function joinGameAsSpectator(
  page: Page,
  gameId: string,
  username: string
) {
  await navigateToGame(page, gameId);
  await page.getByPlaceholder('Enter your name').fill(username);
  await page.getByText('Join as spectator').click();
  // Use Create Game for new games, Join Game for existing games
  const createButton = page.getByRole('button', { name: 'Create Game' });
  const joinButton = page.getByRole('button', { name: 'Join Game' });
  if (await createButton.isVisible()) {
    await createButton.click();
  } else {
    await joinButton.click();
  }
  await waitForGamePageVisible(page);
  await expect(page.getByText(`${username}(you)`)).toBeVisible();
  await expect(page.getByText('(spectator)')).toBeVisible();
}

export async function selectVoteCard(page: Page, size: string) {
  await page.locator(`[data-card-size="${size}"]`).click();
}

export async function pressVoteKey(page: Page, size: string) {
  const keyMap: Record<string, string[]> = {
    xs: ['x', 's'],
    s: ['s'],
    m: ['m'],
    l: ['l'],
    xl: ['x', 'l'],
    unknown: ['?'],
  };

  const keys = keyMap[size];
  if (!keys) throw new Error(`Unknown vote size: ${size}`);

  for (const key of keys) {
    await page.keyboard.press(key);
  }
}

export async function pressDeselectKey(
  page: Page,
  key: 'Escape' | 'Backspace'
) {
  await page.keyboard.press(key);
}

export async function clickRevealVotes(page: Page) {
  await page.getByRole('button', { name: 'Reveal Votes', exact: true }).click();
}

export async function clickNewRound(page: Page) {
  await page
    .getByRole('button', { name: 'Start New Round', exact: true })
    .click();
}

export async function getPersistedUserId(page: Page): Promise<string> {
  return await page.evaluate(
    () => localStorage.getItem('planning-poker-user-id') || ''
  );
}

export async function waitForPlayerCount(page: Page, expectedCount: number) {
  await expect(page.locator('.table-player')).toHaveCount(expectedCount);
}

export async function waitForRevealedCards(page: Page, expectedCount: number) {
  await expect(page.locator('.player-card-revealed')).toHaveCount(
    expectedCount
  );
}

export async function waitForDisconnectedPlayers(
  page: Page,
  expectedCount: number
) {
  await expect
    .poll(async () => await page.locator('.player-card-disconnected').count(), {
      timeout: 15000,
      intervals: [500, 1000, 1000],
    })
    .toBe(expectedCount);
}

export async function waitForAnyDisconnectedPlayer(page: Page) {
  await expect
    .poll(async () => await page.locator('.player-card-disconnected').count(), {
      timeout: 15000,
      intervals: [500, 1000, 1000],
    })
    .toBeGreaterThan(0);
}

export async function waitForGamePageVisible(page: Page) {
  await expect(page.locator('.game-page')).toBeVisible();
}

export async function disconnectSocket(page: Page) {
  await page.evaluate(() => {
    if (window.__TEST_SOCKET__) {
      window.__TEST_SOCKET__.disconnect();
    }
  });
}

export async function disconnectAndReconnectSocket(page: Page, delayMs = 1000) {
  await page.evaluate((delay) => {
    if (window.__TEST_SOCKET__) {
      window.__TEST_SOCKET__.disconnect();
      setTimeout(() => {
        if (window.__TEST_SOCKET__) {
          window.__TEST_SOCKET__.connect();
        }
      }, delay);
    }
  }, delayMs);
}

export async function reopenPageInContext(
  context: BrowserContext,
  gameId: string
): Promise<Page> {
  const newPage = await context.newPage();
  await newPage.goto(`/game/${gameId}`);
  await waitForGamePageVisible(newPage);
  return newPage;
}

export async function closeContexts(...contexts: BrowserContext[]) {
  for (const context of contexts) {
    await context.close();
  }
}

export async function createTwoUserSession(browser: {
  newContext: () => Promise<BrowserContext>;
}) {
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alicePage = await aliceContext.newPage();
  const bobPage = await bobContext.newPage();

  return { aliceContext, bobContext, alicePage, bobPage };
}

export function getVoteCard(page: Page, size: string) {
  return page.locator(`[data-card-size="${size}"]`);
}

export function getRevealButton(page: Page) {
  return page.getByRole('button', { name: 'Reveal Votes', exact: true });
}

export function getNewRoundButton(page: Page) {
  return page.getByRole('button', { name: /new round/i });
}

export function getPlayerCard(page: Page, username: string) {
  return page.locator('.table-player').filter({ hasText: username });
}

export function getVotedIndicator(page: Page, username: string) {
  return getPlayerCard(page, username).locator('.player-card-voted');
}

export function getRevealedCard(page: Page, username: string) {
  return getPlayerCard(page, username).locator('.player-card-revealed');
}
