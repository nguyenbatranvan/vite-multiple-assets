import {defineConfig} from "@playwright/test";
import {shareConfigPlayWright} from "../../../baseConfigPlayWight";

export default defineConfig({
    ...shareConfigPlayWright,
    testDir: "./src",
});
