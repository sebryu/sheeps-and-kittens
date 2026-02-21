import { test, expect } from '@playwright/test';

test.describe('Game Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('welcome-title').waitFor({ state: 'visible' });
    // Start a local (two-player) game
    await page.getByTestId('play-button').click();
    await page.getByTestId('game-title').waitFor({ state: 'visible' });
  });

  test('shows initial game state with placement phase', async ({ page }) => {
    await expect(page.getByTestId('phase-indicator')).toContainText('Placement');
    await expect(page.getByText('0/20 placed')).toBeVisible();
    await expect(page.getByText('0/5 captured')).toBeVisible();
  });

  test('displays the 5x5 board with all cells', async ({ page }) => {
    // Board should have 25 cells (5x5)
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        await expect(page.getByTestId(`cell-${r}-${c}`)).toBeVisible();
      }
    }
  });

  test('placing a sheep updates the board', async ({ page }) => {
    // Click an empty cell to place a sheep (sheeps go first)
    // Corners (0,0), (0,4), (4,0), (4,4) have kittens, so place at (0,1)
    await page.getByTestId('cell-0-1').click();

    // After placing a sheep, the placed count should update
    await expect(page.getByText('1/20 placed')).toBeVisible();
  });

  test('alternating turns between sheep and kitten', async ({ page }) => {
    // Sheep's turn first - place a sheep
    await page.getByTestId('cell-0-1').click();
    await expect(page.getByText('1/20 placed')).toBeVisible();

    // Now it should be kitten's turn - status should mention kitten
    await expect(page.getByTestId('status-bar')).toContainText(/kitten/i);
  });

  test('restart button resets the game', async ({ page }) => {
    // Place a sheep first
    await page.getByTestId('cell-0-1').click();
    await expect(page.getByText('1/20 placed')).toBeVisible();

    // Click restart
    await page.getByTestId('restart-button').click();

    // Should be back to initial state
    await expect(page.getByText('0/20 placed')).toBeVisible();
    await expect(page.getByTestId('phase-indicator')).toContainText('Placement');
  });

  test('forfeit button is visible during gameplay', async ({ page }) => {
    await expect(page.getByTestId('forfeit-button')).toBeVisible();
  });

  test('score panel shows sheep and kitten info', async ({ page }) => {
    await expect(page.getByText('Sheeps')).toBeVisible();
    await expect(page.getByText('Kittens')).toBeVisible();
    await expect(page.getByText('VS')).toBeVisible();
  });
});
