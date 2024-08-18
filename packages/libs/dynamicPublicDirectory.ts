import {IConfig} from "./types";
import {ViteDevServer} from "vite";
import {ServerMiddleWare} from "./server";
import {buildMiddleWare} from "./build";

export function DynamicPublicDirectory(assets: string[], opts: IConfig = {}): any {
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