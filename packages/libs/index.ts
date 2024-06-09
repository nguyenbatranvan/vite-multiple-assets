import type { PluginOption, ViteDevServer } from "vite";
import {ServerMiddleWare} from "./server";
import {buildMiddleWare} from "./build";
import type {IAssets, IConfig, IViteResolvedConfig} from "./types";
import type { NormalizedOutputOptions } from "rollup";

export function resolveInternalConfig({ opts, writeBundleOptions, viteConfig, force }: {
    opts: IConfig;
    writeBundleOptions?: NormalizedOutputOptions;
    viteConfig?: IViteResolvedConfig;
    force?: "bundle" | "vite" | boolean;
}) {
    force ??= false;
    opts ??= {};

    opts.ignore ??= [];
    opts.onlyFiles ??= true;
    opts.markDirectories ??= true;
    opts.dot ??= true;

    // STUB[epic-LEGACY-FIRST] formerly, this plugin using config from rollup instead of vite.
    // TODO[epic-LEGACY-FIRST] for modern purpose, use resolved config from vite
    if (writeBundleOptions || force == "bundle" || force == true) {
        opts.__dst ??= (typeof opts.dst == "string" ? opts.dst : undefined) ?? writeBundleOptions?.dir ?? (force ? (viteConfig?.build.outDir ?? "./dist") : undefined);
        if (!opts.__dst) throw new Error("options.dir is undefined");
        opts.dst ??= opts.__dst;
    }

    if (viteConfig || force == "vite" || force == true) {
        opts.cwd ??= viteConfig?.root ?? (force ? process.cwd() : undefined);
    }
}

export default function DynamicPublicDirectory(assets: IAssets, opts: IConfig = {}): PluginOption {
    let viteConfig: IViteResolvedConfig;

    resolveInternalConfig({ opts });

    return {
        async configureServer(server: ViteDevServer) {
            return await ServerMiddleWare({server, assets, options: opts, viteConfig})
        },
        configResolved(config) {
            viteConfig = config;
            resolveInternalConfig({ opts, viteConfig });
        },
        async writeBundle(writeBundleOptions) {
            resolveInternalConfig({ opts, viteConfig, writeBundleOptions });
            buildMiddleWare(writeBundleOptions, assets, opts, viteConfig)
        },
        name: "dynamic assets",
    };
}
