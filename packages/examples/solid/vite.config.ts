import solid from "solid-start/vite";
import {defineConfig} from "vite";
import DynamicPublicDirectory from "vite-multiple-assets";

export default defineConfig({
    plugins: [solid(),
        DynamicPublicDirectory(["../../../shared-assets"], {
            ssr: true
        })],
});
