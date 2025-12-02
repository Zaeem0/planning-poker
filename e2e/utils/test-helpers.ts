import { expect, Page, BrowserContext } from '@playwright/test';

export const generateUniqueGameId = () =>
  `test-game-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

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
  await page.getByRole('button', { name: 'Join Game' }).click();
  await waitForGamePageVisible(page);
  await expect(page.getByText(`${username}(you)`)).toBeVisible();
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

export async function clickRevealVotes(page: Page) {
  await page.getByRole('button', { name: /reveal/i }).click();
}

export async function clickNewRound(page: Page) {
  await page.getByRole('button', { name: /new round/i }).click();
}

export async function getPersistedUserId(page: Page): Promise<string> {
  return await page.evaluate(
    () => localStorage.getItem('planning-poker-user-id') || ''
  );
}

export async function waitForPlayerCount(page: Page, expectedCount: number) {
  await expect(page.locator('.table-player')).toHaveCount(expectedCount);
}

export async function waitForDisconnectedPlayers(
  page: Page,
  expectedCount: number
) {
  await expect
    .poll(async () => await page.locator('.player-card-disconnected').count())
    .toBe(expectedCount);
}

export async function waitForAnyDisconnectedPlayer(page: Page) {
  await expect
    .poll(async () => await page.locator('.player-card-disconnected').count())
    .toBeGreaterThan(0);
}

export async function waitForGamePageVisible(page: Page) {
  await expect(page.locator('.game-page')).toBeVisible();
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
  return page.getByRole('button', { name: /reveal/i });
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
