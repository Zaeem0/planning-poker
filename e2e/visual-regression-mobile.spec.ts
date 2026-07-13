import { test, expect, devices } from '@playwright/test';
import {
  generateUniqueGameId,
  joinGameAsUser,
  joinGameAsSpectator,
  navigateToGame,
  navigateToHomePage,
  closeContexts,
} from './utils/test-helpers';

// Emulate a phone viewport for every test in this file so the snapshots
// capture the responsive (mobile) layout. Names are prefixed with "mobile-"
// to keep the baselines separate from the desktop visual-regression suite.
test.use({ ...devices['Pixel 5'] });

const MOBILE = devices['Pixel 5'];

test.describe('Mobile Visual Regression Tests', () => {
  test('homepage', async ({ page }) => {
    await navigateToHomePage(page);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('mobile-homepage.png', {
      fullPage: true,
    });
  });

  test('create game form', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await navigateToGame(page, gameId);

    await expect(page.locator('.join-form')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Create Game' })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.card-set-selector')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('mobile-create-game-form.png', {
      fullPage: true,
    });
  });

  test('card editor in create form', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await navigateToGame(page, gameId);

    await expect(page.locator('.join-form')).toBeVisible();
    await expect(page.locator('.card-set-editor')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('mobile-card-editor.png', {
      fullPage: true,
    });
  });

  test('join game form (existing game)', async ({ browser }) => {
    const aliceContext = await browser.newContext({ ...MOBILE });
    const bobContext = await browser.newContext({ ...MOBILE });
    const alicePage = await aliceContext.newPage();
    const bobPage = await bobContext.newPage();
    const gameId = generateUniqueGameId();

    await joinGameAsUser(alicePage, gameId, 'Alice');
    await expect(alicePage.getByText('Alice(you)')).toBeVisible();
    await alicePage.waitForTimeout(500);

    await navigateToGame(bobPage, gameId);
    await expect(bobPage.locator('.join-form')).toBeVisible();
    await expect(
      bobPage.getByRole('heading', { name: 'Join Game' })
    ).toBeVisible({ timeout: 10000 });
    await bobPage.waitForTimeout(300);

    await expect(bobPage).toHaveScreenshot('mobile-join-game-form.png', {
      fullPage: true,
    });

    await closeContexts(aliceContext, bobContext);
  });

  test('settings modal', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsUser(page, gameId, 'TestUser');

    await page.getByRole('button', { name: 'Game settings' }).click();
    await expect(page.locator('.game-settings-dialog')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('mobile-settings-modal.png', {
      fullPage: true,
    });
  });

  test('game initial state', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsUser(page, gameId, 'TestUser');

    await expect(page.locator('.voting-cards-bottom')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('mobile-game-initial-state.png', {
      fullPage: true,
    });
  });

  test('game with selected card', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsUser(page, gameId, 'TestUser');

    await page.click('[data-card-size="m"]');
    await expect(page.locator('.voting-card-small.selected')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('mobile-game-card-selected.png', {
      fullPage: true,
    });
  });

  test('game with revealed votes', async ({ browser }) => {
    const context1 = await browser.newContext({ ...MOBILE });
    const context2 = await browser.newContext({ ...MOBILE });
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const gameId = generateUniqueGameId();

    await joinGameAsUser(page1, gameId, 'User1');
    await page1.click('[data-card-size="m"]');
    await joinGameAsUser(page2, gameId, 'User2');
    await page2.click('[data-card-size="l"]');

    await page1
      .locator('button:has-text("Reveal Votes")')
      .click({ force: true });
    await expect(
      page1.locator('.voting-card-percentage').first()
    ).toBeVisible();
    await page1.waitForTimeout(1000);

    await expect(page1).toHaveScreenshot('mobile-game-votes-revealed.png', {
      fullPage: true,
    });

    await closeContexts(context1, context2);
  });

  test('game with many players (7) revealed', async ({ browser }) => {
    const gameId = generateUniqueGameId();
    const votes = ['m', 'm', 'l', 's', 'xl', 'm', 'l'];

    const contexts = await Promise.all(
      votes.map(() => browser.newContext({ ...MOBILE }))
    );
    const pages = await Promise.all(contexts.map((ctx) => ctx.newPage()));

    // Join and vote sequentially so joins/votes are applied deterministically.
    for (let i = 0; i < pages.length; i++) {
      await joinGameAsUser(pages[i], gameId, `User${i + 1}`);
      await pages[i].click(`[data-card-size="${votes[i]}"]`);
    }

    await pages[0]
      .locator('button:has-text("Reveal Votes")')
      .click({ force: true });
    await expect(
      pages[0].locator('.voting-card-percentage').first()
    ).toBeVisible();
    await pages[0].waitForTimeout(1000);

    await expect(pages[0]).toHaveScreenshot(
      'mobile-game-many-players-revealed.png',
      {
        fullPage: true,
      }
    );

    await closeContexts(...contexts);
  });

  test('spectator mode', async ({ page }) => {
    const gameId = generateUniqueGameId();
    await joinGameAsSpectator(page, gameId, 'SpectatorUser');

    await expect(page.locator('.voting-cards-bottom')).toBeVisible();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('mobile-spectator-mode.png', {
      fullPage: true,
    });
  });
});
