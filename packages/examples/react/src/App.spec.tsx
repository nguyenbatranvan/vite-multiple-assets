import {expect, test as base} from "@playwright/test";

const test = base.extend({})

test.beforeEach(async ({page}) => {

    await page.goto("./");
});

test.describe('Test load multiple assets', () => {
    test('Check loaded success image with custom output', async ({page}) => {
        await expect(page.locator('[aria-label=logo-assets]')).not.toHaveJSProperty("naturalWidth", 0);
    })

    test('Check loaded success image base', async ({page}) => {
        await expect(page.locator('[aria-label=img-base]')).not.toHaveJSProperty("naturalWidth", 0);
    })

    test('Check loaded success image with sub-folder output', async ({page}) => {
        await expect(page.locator('[aria-label=img-output-subfolder]')).not.toHaveJSProperty("naturalWidth", 0);
    })
    test('Check loaded success image with nested sub-folder output', async ({page}) => {
        await expect(page.locator('[aria-label=img-output-nested-subfolder]')).not.toHaveJSProperty("naturalWidth", 0);
    })
    test('Check loaded success image with parent folder', async ({page}) => {
        await expect(page.locator('[aria-label=img-base-with-parent]')).not.toHaveJSProperty("naturalWidth", 0);
    })
    test('Check loaded success image symlink', async ({page}) => {
        await expect(page.locator('[aria-label=logo-assets-symlink]')).not.toHaveJSProperty("naturalWidth", 0);
    })

    test('Check load success css background-image', async ({page}) => {
        const body = await page.$('body');
        const backgroundImage = await body!.evaluate((el) =>
            window.getComputedStyle(el).getPropertyValue('background-image')
        );
        const imageUrl = backgroundImage.match(/url\("(.*)"\)/)?.[1];
        if (imageUrl) {
            const [response] = await Promise.all([
                page.waitForResponse((res) => res.url() === imageUrl && res.status() === 200),
                page.goto(imageUrl)
            ]);
            expect(response.status()).toBe(200);
        }
    })
})
