import {defineConfig} from "@playwright/test";
import {shareConfigPlayWright} from "playwright-config/baseConfigPlayWright";
export default defineConfig({
    ...shareConfigPlayWright,
    /* Configure projects for major browsers */
    testDir: "src/",
});
