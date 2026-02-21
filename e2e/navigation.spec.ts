import { test, expect } from '@playwright/test';

test.describe('Screen Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('welcome-title').waitFor({ state: 'visible' });
  });

  test('navigates to game screen and back', async ({ page }) => {
    await page.getByTestId('play-button').click();

    // Game screen should be visible
    await expect(page.getByTestId('game-title')).toHaveText('Sheeps & Kittens');
    await expect(page.getByTestId('game-back-button')).toBeVisible();
    await expect(page.getByTestId('phase-indicator')).toBeVisible();

    // Navigate back
    await page.getByTestId('game-back-button').click();
    await expect(page.getByTestId('welcome-title')).toBeVisible();
  });

  test('navigates to tutorial and back', async ({ page }) => {
    await page.getByTestId('tutorial-button').click();

    // Tutorial screen should be visible
    await expect(page.getByTestId('tutorial-header')).toHaveText('How to Play');
    await expect(page.getByTestId('tutorial-back-button')).toBeVisible();

    // Navigate back
    await page.getByTestId('tutorial-back-button').click();
    await expect(page.getByTestId('welcome-title')).toBeVisible();
  });

  test('starts a game in AI mode', async ({ page }) => {
    // Select AI mode (play as Sheep)
    await page.getByTestId('mode-ai-kitty').click();
    await page.getByTestId('difficulty-hard').click();
    await page.getByTestId('play-button').click();

    // Game screen should show AI labels
    await expect(page.getByTestId('game-title')).toBeVisible();
    await expect(page.getByText('Kittens (AI)')).toBeVisible();
    await expect(page.getByText('Sheeps (You)')).toBeVisible();
  });
});
