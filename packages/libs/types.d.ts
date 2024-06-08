import type { Options } from "fast-glob";
import type { PluginOption, ViteDevServer } from "vite";
import type { NormalizedOutputOptions } from "rollup";

/**
 * Examples:
 * - `/a/b/c/d/**` + `/a/b/c/d/efg.txt` -> `efg.txt`
 * - Set basepath: `/a/b/{\x01,c}/d/**` + `/a/b/c/d/efg.txt` -> `c/d/efg.txt`
 * ```ts
 * DynamicPublicDirectory(["/a/b/c/d/**", "/a/b/{\x01,c}/d/**"])
 * ```
 * ANCHOR: extended to individual configuration on generating output\
 * NOTE: for blank pattern on `{,filename}` assumed include everything by fast-glob. To fix it, use forbidden name or ascii (else than null).
 *       For example `\x01`, `CON`, `NUL`, please see [this answer](https://stackoverflow.com/a/31976060).
 */
export type IAssets = string[]; // | string | (IConfigExtend & { assets: string | string[]; })[];
export type IFilesMapper = Partial<Record<string, string>>; // STUB: { baseTransformedFilePath: toAbsolutePath }

export type IMIME = Record<string, string>;

/**
 * Return destination of files individually relative to output dir. 
 * For example, if `viteConfig?.build.outDir` is set to `dist`, then
 * - when `dst == undefined`, then file would be stored inside `viteConfig.build.outDir` or `writeBundleOptions?.dir` or `dist/`
 * - when `dst == "./foo/bar"`, then file stored in `${viteConfig.build.outDir}/foo/bar/`
 * - ```({dstFile}) => `.cache/${dstFile}` ```, then file stored in `${viteConfig.build.outDir}/.cache/`. NOTICE! no slash at beginning
 * - This also can ```({dstFile}) => `../.static/${dstFile}` ``` which store file in `${viteConfig.root}/.static/`, the same level as `viteConfig.build.outDir`
 * - `() => false`, then the file would be excluded. Good for complex ignoring files
 * - , then file is manually named, and current built-in naming would be ignored. Good for complex use-case or need massive modification
 * ```ts
 * ({
 *   {__dst, ...opts}, __files, // muttable
 *   dstFile, filepath, baseFile, // useful params to use
 * }) => {
 *   __files["new-no/existing/file.png"] = "/home/me/Pictures/image.png"
 *   return false;
 * }
 * ```
 * - `() => undefined`, then it would going with default
 * 
 * **NOTE:** string must return either absolute path or relative path in POSIX without beginning slash. It must also return forward slash.\
 * NOTE: the default actually put inside `__dst` not `viteConfig?.build.outDir` \
 * NOTE: Please ALWAYS use posix slash, rather than win32 backslash
 */
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
