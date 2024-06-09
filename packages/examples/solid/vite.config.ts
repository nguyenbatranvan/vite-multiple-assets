import solid from "solid-start/vite";
import { type PluginOption, defineConfig } from "vite";
import DynamicPublicDirectory from "vite-multiple-assets";

export default defineConfig({
    root: __dirname,
    publicDir: false,
    plugins: [solid(),
        DynamicPublicDirectory(["../../../{\x01,shared-assets}/**", "public/**"], {
            ssr: false,
        }) as PluginOption,],
});
