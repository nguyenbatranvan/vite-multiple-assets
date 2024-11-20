import {defineConfig} from "@playwright/test";
import {shareConfigPlayWright} from "playwright-config/baseConfigPlayWright.ts";

export default defineConfig({
    ...shareConfigPlayWright,
    testDir: "./tests/",
});
