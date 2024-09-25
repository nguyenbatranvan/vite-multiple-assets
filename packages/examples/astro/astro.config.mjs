import {defineConfig} from 'astro/config';
import {astroMultipleAssets} from "vite-multiple-assets";

const assets = ['public2/**'];
// https://astro.build/config
export default defineConfig({
    integrations: [
        astroMultipleAssets(assets)
    ],
});
