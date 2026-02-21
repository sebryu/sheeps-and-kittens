import { test, expect } from '@playwright/test';

test.describe('Welcome Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to hydrate and animations to settle
    await page.getByTestId('welcome-title').waitFor({ state: 'visible' });
  });

  test('renders the title and subtitle', async ({ page }) => {
    await expect(page.getByTestId('welcome-title')).toHaveText('Sheeps & Kittens');
    await expect(page.getByText('A BaghChal Board Game')).toBeVisible();
  });

  test('shows game rules preview', async ({ page }) => {
    await expect(page.getByText('How to Play', { exact: false })).toBeVisible();
    await expect(page.getByText('20 Sheeps try to block all kittens')).toBeVisible();
    await expect(page.getByText('4 Kittens try to capture 5 sheeps')).toBeVisible();
  });

  test('shows game mode selector with "Two Players" active by default', async ({ page }) => {
    await expect(page.getByText('Game Mode')).toBeVisible();
    await expect(page.getByTestId('mode-local')).toBeVisible();
    await expect(page.getByTestId('mode-ai-kitty')).toBeVisible();
    await expect(page.getByTestId('mode-ai-sheep')).toBeVisible();
    // Default footer for local mode
    await expect(page.getByText('Two players - take turns on the same device')).toBeVisible();
  });

  test('selecting AI mode reveals difficulty selector', async ({ page }) => {
    // Difficulty should not be visible in local mode
    await expect(page.getByText('Difficulty')).not.toBeVisible();

    // Click "vs AI - You play as Sheep"
    await page.getByTestId('mode-ai-kitty').click();
    await expect(page.getByText('Difficulty')).toBeVisible();
    await expect(page.getByTestId('difficulty-easy')).toBeVisible();
    await expect(page.getByTestId('difficulty-medium')).toBeVisible();
    await expect(page.getByTestId('difficulty-hard')).toBeVisible();
  });

  test('switching back to local mode hides difficulty selector', async ({ page }) => {
    await page.getByTestId('mode-ai-kitty').click();
    await expect(page.getByText('Difficulty')).toBeVisible();

    await page.getByTestId('mode-local').click();
    await expect(page.getByText('Difficulty')).not.toBeVisible();
  });

  test('Play Game button is visible and clickable', async ({ page }) => {
    await expect(page.getByTestId('play-button')).toBeVisible();
    await expect(page.getByText('Play Game')).toBeVisible();
  });

  test('How to Play button is visible', async ({ page }) => {
    await expect(page.getByTestId('tutorial-button')).toBeVisible();
  });
});
