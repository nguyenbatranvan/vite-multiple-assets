import {defineConfig, devices} from "@playwright/test";
import {shareConfigPlayWright} from "../../../baseConfigPlayWight";
export default defineConfig({
    ...shareConfigPlayWright,


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
            },
            {
                command: "npm run build && npm run preview",
                url: "http://localhost:3004",
                reuseExistingServer: !process.env.CI,
                stdout: "ignore",
                stderr: "pipe"
            }
        ],
    testDir: "./tests/",
});
