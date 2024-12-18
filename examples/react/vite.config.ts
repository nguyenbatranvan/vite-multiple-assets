import {PluginOption, defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {DynamicPublicDirectory} from "vite-multiple-assets";

export default defineConfig({
    base: "/base/",
    resolve: {
        preserveSymlinks: true,
    },
    build: {
        rollupOptions: {
            external:['.png'],
            output: {
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',

                assetFileNames: ({name}) => {
                    if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
                        return 'assets/images/[name]-[hash][extname]';
                    }

                    if (/\.css$/.test(name ?? '')) {
                        return 'assets/css/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    },
    root: __dirname,
    server: {
        port: 3003
    },
    preview: {
        port: 3004
    },
    plugins: [
        react() as PluginOption,
        // if exclude shared-assets use ../../../shared-assets/**
        DynamicPublicDirectory([
            {
                input: "public/**",
                output: "/images/assets-a"
            },
            {
                input: "../../shared-assets/**",
                output: "shared/images",
                watch: true, // default
            }, "public/**", "{\x01,public2}/**"], {
            ssr: false,
            needTransformBaseCss: true, // because in index.css there is url of image to convert add base of vite before it
            followSymbolicLinks: true,
        }) as PluginOption,
    ],
})
