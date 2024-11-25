import {defineConfig, PluginOption} from 'vite'
import vue from '@vitejs/plugin-vue'
import {DynamicPublicDirectory} from "vite-multiple-assets";

// https://vite.dev/config/
export default defineConfig({
    server: {
        port: 3003
    },
    preview: {
        port: 3004
    },
    plugins: [vue({
        template: {
            transformAssetUrls: {
                img: [''],
            }
        }
    }) as PluginOption, DynamicPublicDirectory([
        {
            input: "../../shared-assets/**",
            output: "/shared/images",
            watch: true // default
        }, "public/**", "{\x01,public2}/**"], {
        ssr: false
    }) as PluginOption]
})
