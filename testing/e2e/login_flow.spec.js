const { test, expect } = require('@playwright/test');

/**
 * E2E TEST: Complete Login Flow
 * Scenario: User opens Home -> Navigates to Login -> Inputs Data -> Enters Dashboard
 */
test('User can login and reach university dashboard', async ({ page }) => {
    // 1. Open the main page
    await page.goto('http://localhost:5173/'); // Adjust port if necessary
    
    // Ensure page title is correct
    await expect(page).toHaveTitle(/VEDA/i);

    // 2. Click login button in navbar
    await page.click('text=LOGIN');
    
    // Ensure URL changes to /login
    await expect(page).toHaveURL(/.*login/);

    // 3. Fill login form (Example: University Admin)
    await page.fill('input[name="university_email"]', 'admin@univ.ac.id');
    await page.fill('input[type="password"]', 'password123');
    
    // 4. Click submit
    await page.click('button:has-text("LOGIN")');

    // 5. Success verification: Must be redirected to dashboard
    await expect(page).toHaveURL(/.*university\/dashboard/);
    await expect(page.locator('text=University Dashboard')).toBeVisible();
    
    // Check if summary cards are visible
    const totalDiplomas = page.locator('text=Total Diplomas Issued');
    await expect(totalDiplomas).toBeVisible();
});
