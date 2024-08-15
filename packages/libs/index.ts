import {ViteDevServer} from "vite";
import {ServerMiddleWare} from "./server";
import {buildMiddleWare} from "./build";
import {IConfig} from "./types";

function DynamicPublicDirectory(assets: string[], opts: IConfig = {}): any {
    return {
        configureServer(server: ViteDevServer) {
            return ServerMiddleWare({server, assets, options: opts})
        },
        async writeBundle(options) {
            buildMiddleWare(options, assets)
        },
        name: "dynamic assets"
    };
}

export {
    DynamicPublicDirectory,
    ServerMiddleWare
}
