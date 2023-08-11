import {PluginOption, ViteDevServer} from "vite";
import {ServerMiddleWare} from "./server";
import {buildMiddleWare} from "./build";


export default function DynamicPublicDirectory(assets: string[]): PluginOption {
    return {
        configureServer(server: ViteDevServer) {
            return ServerMiddleWare(server,assets)
        },
        async writeBundle(options){
            buildMiddleWare(options,assets)
        },
        name: "dynamic assets"
    };
}
