import {PluginOption, ViteDevServer} from "vite";
import {ServerMiddleWare} from "./server";
import {buildMiddleWare} from "./build";
import {IMIME} from "./types";

export default function DynamicPublicDirectory(assets: string[], mime: IMIME = {}): PluginOption {
    return {
        configureServer(server: ViteDevServer) {
            return ServerMiddleWare(server, assets, mime)
        },
        async writeBundle(options) {
            buildMiddleWare(options, assets)
        },
        name: "dynamic assets"
    };
}
