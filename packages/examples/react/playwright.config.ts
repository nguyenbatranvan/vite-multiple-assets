import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3003",
        headless: true,
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        extraHTTPHeaders: {},
        trace: "on-first-retry"
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chromium",
            use: {...devices["Desktop Chrome"]}
        },

        {
            name: "firefox",
            use: {...devices["Desktop Firefox"]}
        },

        {
            name: "webkit",
            use: {...devices["Desktop Safari"]}
        }
    ],
    webServer:
        [
            {
                command: "npm run dev",
                url: "http://localhost:3003",
                reuseExistingServer: !process.env.CI,
                stdout: "ignore",
                stderr: "pipe"
            }
        ],
    testDir: "src/",
});
