import {defineConfig} from 'astro/config';
import {astroMultipleAssets} from "vite-multiple-assets";

const assets = ['public2/**'];
// https://astro.build/config
export default defineConfig({
    server: {
        port: 3003
    },
    build: {
        port: 3004
    },
    integrations: [
        astroMultipleAssets(["public2/**", {
            input: "../../../{\x01,shared-assets}/**",
            output: "/shared/images",
            watch: true // default
        }])
    ],
});
