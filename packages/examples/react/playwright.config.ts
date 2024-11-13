import {defineConfig} from "@playwright/test";
import {shareConfigPlayWright} from "../../../baseConfigPlayWight";

export default defineConfig({
    ...shareConfigPlayWright,
    webServer: [{
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        stdout: "ignore",
        stderr: "pipe"
    }, {
        command: "npm run build && npm run preview",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        stdout: "ignore",
        stderr: "pipe"
    }],
    testDir: "src/",
});
