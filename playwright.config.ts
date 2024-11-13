// import {defineConfig, devices} from "@playwright/test";
// import PlaywrightConfig from "./packages/examples/react/playwright.config";
// import {PlaywrightTestConfig} from "playwright/types/test";
//
// /**
//  * Read environment variables from file.
//  * https://github.com/motdotla/dotenv
//  */
// // require('dotenv').config();
//
// /**
//  * See https://playwright.dev/docs/test-configuration.
//  */
// export const shareConfigPlayWright:PlaywrightTestConfig={
//     webServer: [{
//         command: "npm run dev",
//         url: "http://localhost:3000",
//         reuseExistingServer: !process.env.CI,
//         stdout: "ignore",
//         stderr: "pipe"
//     }, {
//         command: "npm run b-test && npm run p-test",
//         url: "http://localhost:3000",
//         reuseExistingServer: !process.env.CI,
//         stdout: "ignore",
//         stderr: "pipe"
//     }],
//
//     fullyParallel: true,
//     forbidOnly: !!process.env.CI,
//     retries: process.env.CI ? 2 : 0,
//     workers: process.env.CI ? 1 : undefined,
//     reporter: "html",
//     use: {
//         baseURL: "http://localhost:3000",
//         headless: true,
//         ignoreHTTPSErrors: true,
//         screenshot: "only-on-failure",
//         video: "retain-on-failure",
//         extraHTTPHeaders: {},
//         trace: "on-first-retry"
//     },
//
//     /* Configure projects for major browsers */
//     projects: [
//         {
//             name: "chromium",
//             use: {...devices["Desktop Chrome"]}
//         },
//
//         {
//             name: "firefox",
//             use: {...devices["Desktop Firefox"]}
//         },
//
//         {
//             name: "webkit",
//             use: {...devices["Desktop Safari"]}
//         }
//     ]
// }
