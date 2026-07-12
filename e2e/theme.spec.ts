import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('theme toggle, orange/white brand styling, and accessibility compliance', async ({ page }) => {
  await page.goto('/');

  const getBgColor = async () => {
    return page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
  };

  // 1. Verify default background is white (Light mode)
  expect(await getBgColor()).toBe('rgb(255, 255, 255)');

  // 2. Verify that primary accent color is orange (#ff6b00) in root
  const accentColor = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  });
  expect(accentColor).toBe('#ff6b00');

  // 3. Verify the SOS button has the pulse animation
  const sosButton = page.locator('.sos-button');
  await expect(sosButton).toBeVisible();
  const animationName = await sosButton.evaluate((el) => {
    return window.getComputedStyle(el).animationName;
  });
  expect(animationName).toContain('pulse');

  // 4. Run accessibility checks for default Light mode
  const a11yLight = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(a11yLight.violations).toEqual([]);

  // 5. Toggle to Dark theme and verify background becomes dark gray
  const darkToggle = page.getByRole('button', { name: 'Dark', exact: true });
  await darkToggle.click();
  expect(await getBgColor()).toBe('rgb(18, 18, 18)');

  // 6. Run accessibility checks for Dark mode
  const a11yDark = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(a11yDark.violations).toEqual([]);

  // 7. Toggle to High Contrast theme and verify background becomes pure black
  const hcToggle = page.getByRole('button', { name: 'High Contrast', exact: true });
  await hcToggle.click();
  expect(await getBgColor()).toBe('rgb(0, 0, 0)');

  // 8. Run accessibility checks for High Contrast mode
  const a11yHc = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(a11yHc.violations).toEqual([]);
});
