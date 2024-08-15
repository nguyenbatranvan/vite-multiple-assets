import {defineConfig} from 'astro/config';
import {DynamicPublicDirectory, ServerMiddleWare} from "vite-multiple-assets";

const assets = ['public2'];
// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [DynamicPublicDirectory(assets)]
    },
    integrations: [
        {
            name: 'test-multiple',
            hooks: {
                'astro:server:setup': (op) => {
                    ServerMiddleWare({
                        server: op.server,
                        assets
                    })()
                },
            },
        },
    ],
});
