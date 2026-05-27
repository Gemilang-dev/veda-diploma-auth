const { test, expect } = require('@playwright/test');

/**
 * MAIN SCENARIO: END-TO-END WORKFLOW (FR-01 to FR-08)
 */
test.describe('VEDA System Full Functional Flow', () => {

    // FR-01: Admin Registration
    test('FR-01: Admin can register a new university', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.fill('input[label="Admin Username"]', 'superadmin');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button:has-text("LOGIN")');

        await page.goto('http://localhost:5173/admin/users');
        await page.click('text=Add New University');
        
        await page.fill('input[name="university_name"]', 'Test University');
        await page.fill('input[name="email"]', 'test@univ.ac.id');
        await page.fill('input[name="password"]', 'securepass123');
        await page.fill('input[name="wallet_address"]', '0x1234567890123456789012345678901234567890');
        await page.click('button:has-text("Register University")');

        await expect(page.locator('text=University registered successfully!')).toBeVisible();
    });

    // FR-02: Admin Management (Deactivate)
    test('FR-02: Admin can deactivate an existing university account', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.fill('input[label="Admin Username"]', 'superadmin');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button:has-text("LOGIN")');

        await page.goto('http://localhost:5173/admin/users');
        await page.click('button:has-text("Deactivate")');
        await expect(page.locator('text=Inactive')).toBeVisible();
    });

    // FR-03: University Login & Form Validation
    test('FR-03: Issuer can login and access the issuance form', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="university_email"]', 'admin@univ.ac.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("LOGIN")');

        await page.goto('http://localhost:5173/university/issue');
        await expect(page.locator('text=Penerbitan Ijazah Baru')).toBeVisible();
    });

    // FR-04: Deployment to Blockchain
    test('FR-04: Issuer can deploy diploma data to Sepolia Blockchain', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="university_email"]', 'admin@univ.ac.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("LOGIN")');

        await page.goto('http://localhost:5173/university/issue');
        await page.fill('input[name="student_name"]', 'SpongeBob SquarePants');
        await page.fill('input[name="student_id"]', 'NIM666');
        
        await page.click('button:has-text("SECURE & DEPLOY DIPLOMA")');
        await expect(page.locator('text=DIPLOMA SUCCESSFULLY SECURED ON BLOCKCHAIN')).toBeVisible({ timeout: 30000 });
    });

    // FR-05: QR Code Generation
    test('FR-05: System triggers automatic QR Code download upon success', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="university_email"]', 'admin@univ.ac.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("LOGIN")');

        await page.goto('http://localhost:5173/university/issue');
        await page.fill('input[name="student_name"]', 'SpongeBob SquarePants');
        await page.fill('input[name="student_id"]', 'NIM777');
        
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("SECURE & DEPLOY DIPLOMA")');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('Diploma');
    });

    // FR-06: Verification Portal Access
    test('FR-06: Public user can access the global verification portal', async ({ page }) => {
        await page.goto('http://localhost:5173/guest/verify');
        await expect(page.locator('text=Employer Verification Portal')).toBeVisible();
    });

    // FR-07: Scan/Input Hash
    test('FR-07: Public user can initiate diploma verification via scanner/hash', async ({ page }) => {
        await page.goto('http://localhost:5173/guest/verify');
        // Check for scanner active state or hash input field
        await expect(page.locator('input[placeholder*="Enter Diploma Hash"]')).toBeVisible();
    });

    // FR-08: Verification Results
    test('FR-08: System displays AUTHENTIC RECORD for valid diploma data', async ({ page }) => {
        await page.goto('http://localhost:5173/guest/verify');
        // Simulate/Input a known valid hash
        await page.fill('input[placeholder*="Enter Diploma Hash"]', '0xabc123');
        await page.click('button:has-text("Verify")');
        await expect(page.locator('text=AUTHENTIC RECORD')).toBeVisible();
    });

});
