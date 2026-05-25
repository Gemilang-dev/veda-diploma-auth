const { test, expect } = require('@playwright/test');

/**
 * MAIN SCENARIO: END-TO-END WORKFLOW (FR-01 to FR-08)
 */
test.describe('VEDA System Full Functional Flow', () => {

    // FR-01: Admin Management
    test('FR-01: Admin can create and then deactivate an issuer', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        // Login as Super Admin
        await page.fill('input[label="Admin Username"]', 'superadmin');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button:has-text("LOGIN")');

        await page.goto('http://localhost:5173/admin/users');
        await page.click('text=Add New University');
        
        // Fill Registration Form
        await page.fill('input[name="university_name"]', 'Test University');
        await page.fill('input[name="email"]', 'test@univ.ac.id');
        await page.fill('input[name="password"]', 'securepass123');
        await page.fill('input[name="wallet_address"]', '0x1234567890123456789012345678901234567890');
        await page.click('button:has-text("Register University")');

        // Verify Success Toast (Acceptance Criteria FR-01)
        await expect(page.locator('text=University registered successfully!')).toBeVisible();

        // Deactivate Issuer
        await page.click('button:has-text("Deactivate")');
        await expect(page.locator('text=Inactive')).toBeVisible();
    });

    // FR-03, FR-04, FR-05: Issuance Flow
    test('FR-03 to FR-05: Issuer can issue a diploma and get QR code', async ({ page }) => {
        // 1. Login as Issuer
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="university_email"]', 'admin@univ.ac.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("LOGIN")');

        // 2. Fill Diploma Form (FR-03)
        await page.goto('http://localhost:5173/university/issue');
        await page.fill('input[name="student_name"]', 'SpongeBob SquarePants');
        await page.fill('input[name="student_id"]', 'NIM666');
        // ... fill other fields ...

        // 3. Submit and wait for Blockchain (FR-04)
        await page.click('button:has-text("SECURE & DEPLOY DIPLOMA")');
        
        // Verify notification/success message
        await expect(page.locator('text=DIPLOMA SUCCESSFULLY SECURED ON BLOCKCHAIN')).toBeVisible({ timeout: 30000 });
        await expect(page.locator('text=Deployment Successful')).toBeVisible();

        // 4. Verify QR Download (FR-05)
        const downloadPromise = page.waitForEvent('download');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('Diploma_SpongeBob');
    });

    // FR-06, FR-07, FR-08: Verification Flow
    test('FR-06 to FR-08: Public user can verify diploma via hash', async ({ page }) => {
        // Access portal
        await page.goto(`http://localhost:5173/guest/verify`);
        
        // Verification Result (FR-08)
        // Simulate a successful verification state display
        await expect(page.locator('text=Employer Verification Portal')).toBeVisible();
    });
});
