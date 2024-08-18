import {DynamicPublicDirectory} from "./dynamicPublicDirectory";
import {ServerMiddleWare} from "./server";
import {IConfig} from "./types";

export function AstroIntegration(assets: string[], options: IConfig = {}) {
    return {
        name: "vite-multiple-assets-astro-integration",
        hooks: {
            "astro:config:setup": ({updateConfig}) => {
                updateConfig({
                    vite: {
                        plugins: [
                            DynamicPublicDirectory(assets, options)
                        ]
                    }
                })
            },
            "astro:server:setup": ({server}) => {
                const middleware = ServerMiddleWare({
                    server,
                    assets,
                    options
                })

                if (!middleware) return

                middleware()
            }
        }
    }
}
