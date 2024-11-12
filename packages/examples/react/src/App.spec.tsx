import {expect, test as base} from "@playwright/test";

const test = base.extend({})

test.beforeEach(async ({page}) => {

    await page.goto("./");
});

test.describe('Test load multiple assets', () => {
    test('Check loaded success image', async ({page}) => {
        await expect(page.locator('[aria-label=logo-assets]')).not.toHaveJSProperty("naturalWidth", 0);
    })
    // test('Check loaded success image symlink', async ({page}) => {
    //     await expect(page.locator('[aria-label=logo-assets-symlink]')).not.toHaveJSProperty("naturalWidth", 0);
    // })
})
