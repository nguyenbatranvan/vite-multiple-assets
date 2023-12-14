import solid from "solid-start/vite";
import {defineConfig} from "vite";
import DynamicPublicDirectory from "../../../libs";

export default defineConfig({
    plugins: [solid(),
        DynamicPublicDirectory(["../../../shared-assets"], {
            ssr: true
        })],
});
