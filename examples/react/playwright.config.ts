import {defineConfig, devices} from "@playwright/test";
import {shareConfigPlayWright} from "../../baseConfigPlayWight";

export default defineConfig({
    ...shareConfigPlayWright,
    /* Configure projects for major browsers */
    testDir: "src/",
});
