import { test, expect } from '@playwright/test';

test.describe('Tutorial Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('welcome-title').waitFor({ state: 'visible' });
    await page.getByTestId('tutorial-button').click();
    await page.getByTestId('tutorial-header').waitFor({ state: 'visible' });
  });

  test('shows the first tutorial step', async ({ page }) => {
    await expect(page.getByText('The Board')).toBeVisible();
    await expect(page.getByText('A 5x5 grid of intersections')).toBeVisible();
    await expect(page.getByText('1 / 7')).toBeVisible();
  });

  test('next button advances to the next step', async ({ page }) => {
    await page.getByTestId('tutorial-next-button').click();

    // Allow transition animation
    await page.waitForTimeout(500);

    await expect(page.getByText('Meet the Kittens')).toBeVisible();
    await expect(page.getByText('2 / 7')).toBeVisible();
  });

  test('previous button is hidden on first step', async ({ page }) => {
    await expect(page.getByTestId('tutorial-prev-button')).not.toBeVisible();
  });

  test('previous button appears after advancing', async ({ page }) => {
    await page.getByTestId('tutorial-next-button').click();
    await page.waitForTimeout(500);

    await expect(page.getByTestId('tutorial-prev-button')).toBeVisible();
  });

  test('can navigate through all steps to the end', async ({ page }) => {
    // Navigate through all 7 steps
    const stepTitles = [
      'The Board',
      'Meet the Kittens',
      'Placing Sheeps',
      'Moving Pieces',
      'Kitten Captures',
      'Diagonal Rules',
      'Winning the Game',
    ];

    for (let i = 0; i < stepTitles.length; i++) {
      await expect(page.getByText(stepTitles[i])).toBeVisible();

      if (i < stepTitles.length - 1) {
        await page.getByTestId('tutorial-next-button').click();
        await page.waitForTimeout(500);
      }
    }

    // Last step should show "Start Playing!" instead of "Next"
    await expect(page.getByTestId('tutorial-start-button')).toBeVisible();
    await expect(page.getByTestId('tutorial-next-button')).not.toBeVisible();
  });

  test('"Start Playing!" on last step returns to welcome', async ({ page }) => {
    // Navigate to the last step
    for (let i = 0; i < 6; i++) {
      await page.getByTestId('tutorial-next-button').click();
      await page.waitForTimeout(500);
    }

    await page.getByTestId('tutorial-start-button').click();
    await expect(page.getByTestId('welcome-title')).toBeVisible();
  });

  test('back button returns to welcome screen', async ({ page }) => {
    await page.getByTestId('tutorial-back-button').click();
    await expect(page.getByTestId('welcome-title')).toBeVisible();
  });
});
