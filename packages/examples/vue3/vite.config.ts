import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {DynamicPublicDirectory} from "vite-multiple-assets";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue({
        template:{
            transformAssetUrls:{
                img: [''],
            }
        }
    }), DynamicPublicDirectory(["../../../shared-assets/**"])]
})
