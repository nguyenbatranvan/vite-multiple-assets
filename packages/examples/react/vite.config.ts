import {PluginOption, defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {DynamicPublicDirectory} from "vite-multiple-assets";

export default defineConfig({
    build: {
        rollupOptions: {
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
    publicDir: false,
    server: {
        port: 3000
    },
    plugins: [
        react(),
        DynamicPublicDirectory(["../../../{\x01,shared-assets}/**"], {
            ssr: false,
        }) as PluginOption,
    ],
})
