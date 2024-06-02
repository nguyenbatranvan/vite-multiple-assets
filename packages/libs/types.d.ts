import type { Options } from "fast-glob";
import type { PluginOption, ViteDevServer } from "vite";
import type { NormalizedOutputOptions } from "rollup";

// ANCHOR: extended to individual configuration on generating output
export type IAssets = string[]; // | string | (IConfigExtend & { assets: string | string[]; })[];
export type IFilesMapper = Partial<Record<string, string>>; // STUB: { baseTransformedFilePath: toAbsolutePath }

export type IMIME = Record<string, string>;

// ANCHOR: when this function return false, it exclude the files.
// ANCHOR: and if it return undefined, it would going with default.
// NOTE: string must return either absolute path or relative path in 
// NOTE: POSIX without beginning slash. It must also return forward slash.
export type FDst = (params: {
    dst: string;
    filepath: string;
    baseFile: string;
    dstFile: string; // NOTE: either absolut or non-slash on beginning path.
    assets: IAssets;
    writeBundleOptions?: NormalizedOutputOptions;
    opts: IConfig;
    viteConfig: IViteResolvedConfig;
    __files: IFilesMapper; // NOTE: internal use to modify all compiled files entirely;
                           // NOTE: user can return false and define its own compilation
}) => string | false | void;

export interface IConfigExtend extends Partial<Pick<Options, "ignore" | "dot">> {
    dst?: string | FDst;
}

export interface IConfig extends 
    IConfigExtend, 
    Partial<Pick<Options, "onlyFiles" | "onlyDirectories" | "cwd" | "markDirectories">> 
{
    __dst?: string; // NOTE: internal destination from parsing rollup write bundlers nor vite config.
    mimeTypes?: IMIME;
    ssr?: boolean;
}

export interface IParameterViteServe {
    server: ViteDevServer;
    assets: IAssets;
    options: IConfig;
    viteConfig: IViteResolvedConfig;
}

export type IViteConfig = Exclude<NonNullable<PluginOption>, false | PluginOption[] | Promise<PluginOption>>;
export type IViteResolvedConfig1 = NonNullable<IViteConfig["configResolved"]>;
// @ts-ignore
export type IViteResolvedConfig = Parameters<IViteResolvedConfig1>[0];

export interface IParameterViteServe {
    server: ViteDevServer;
    assets: string[];
    options: IConfig
}
