import fs from "fs/promises";
import type { NormalizedOutputOptions } from "rollup";
import { isAbsolute, dirname, sep, join, resolve, } from "path";
import { relative, sep as posixSep } from "path/posix"; // NOTE: use posix for relative transformation
import mm from "micromatch";
import fg from "fast-glob";
import type { FDst, IAssets, IConfig, IFilesMapper, IViteResolvedConfig } from "./types";

// LINK https://nodejs.org/docs/latest/api/errors.html#common-system-errors
export enum ErrorCode {
    EISDIR = "EISDIR",
    ERR_FS_EISDIR = "ERR_FS_EISDIR",
}

// TODO: make JSDoc
// TODO: test against "./**", "///**", "/**", "/{,foo}/**", "/{/,foo}/**"
// TODO: test againts relative and absolute path
// TODO: realtest

/**
 * Return basepath of relative path refering glob pattern
 * - `/a/b/{\x01,c}/d/**` + `/a/b/c/d/efg.txt` -> `c/d/efg.txt`
 * - `/a/b/c/d/**` + `/a/b/c/d/efg.txt` -> `efg.txt`
 * 
 * **NOTICE:** none of the results start with slash
 */
export function destinationResolver() {
    const list: Record<string, { 
        base: string;
        glob: string;
        startGlob: number;
        isMatch: ReturnType<typeof mm.matcher>; 
    }> = {};

    const resolve: FDst = ({
        assets, dstFile,
        opts: { ignore, ...opts },
    }) => {
        for (const asset of assets) {
            // FIXME: when IAssets extended, this identifier could collapse
            if (!(asset in list)) {
                const scan = mm.scan(asset);
                list[asset] = {
                    base: scan.base,
                    glob: scan.glob,
                    startGlob: scan.input.indexOf(scan.glob),
                    isMatch: mm.matcher(asset, {
                        ignore,
                        ...opts
                    }),
                };
            }

            // FIXME[epic-skeptical]: asset base and dstFile sliced base should not-match caused by case-sensitivity OS.
            if(list[asset].isMatch(dstFile) && dstFile.slice(0, list[asset].base.length).toUpperCase() == list[asset].base.toUpperCase()) {
                dstFile = dstFile.slice(list[asset].startGlob); // REVIEW: fixed because last slash before glob is not included in base
                break;
            }
        }
        return dstFile;
    };

    return { list, resolve };
}

export const internalDestination = destinationResolver();

export async function getFiles (
    files_: IAssets = [],
    opts: IConfig = {}, 
    viteConfig: IViteResolvedConfig, 
    writeBundleOptions?: NormalizedOutputOptions
) {
    files_ = files_ || [];
    const files = await fg.glob(files_, {
        ignore: [],
        onlyFiles: true,
        onlyDirectories: false,
        markDirectories: true,
        dot: true,
        ...opts,
        absolute: false, // STUB: MUST be Relative to match as close as possible to the pattern
    });
    const mapper: IFilesMapper = {};
    for (const filepath of files) {
        // STUB: formerly to modify filepath to be relative and normalization, now leave as if for future modifying condition
        // STUB: baseFile MUST be Relative to make it easier to be sliced
        const baseFile = filepath;

        let name: ReturnType<FDst> = baseFile; // STUB: as `baseFile`, this MUST be relative

        name = internalDestination.resolve({
            filepath, baseFile, opts, viteConfig, writeBundleOptions,
            assets: files_,  
            dstFile: name, 
            dst: opts.__dst!, 
            __files: mapper, 
        });

        let _dstFile: ReturnType<FDst> = undefined;
        if(opts.dst && typeof opts.dst == "function")
            _dstFile = opts.dst({
                filepath, baseFile, opts, viteConfig, writeBundleOptions,
                assets: files_,
                dstFile: name as string,
                dst: opts.__dst!,
                __files: mapper,
            });
        if (_dstFile == false) continue;
        if (_dstFile == undefined) _dstFile = name as string;
        _dstFile = _dstFile.replaceAll(sep, posixSep); // STUB: force using posix

        // STUB: this intentionally left for future extentional purpose
        name = _dstFile;

        mapper[name as string] = resolve(opts.cwd!, filepath); // STUB: filepath MUST Absolute
    }
    return mapper;
}

export async function buildMiddleWare(
    writeBundleOptions: NormalizedOutputOptions, 
    assets: IAssets = [], 
    opts: IConfig = {},
    viteConfig: IViteResolvedConfig,
) {
    const files = await getFiles(assets, opts, viteConfig, writeBundleOptions);
    for (const [_dstFile, filepath] of Object.entries(files)) {
        // STUB: `dstFile` must be absolute.
        const dstFile = isAbsolute(_dstFile) ? _dstFile : resolve(opts.__dst!, _dstFile);

        // STUB: using chain promise to handle further condition and more convenience
        await fs.mkdir(dirname(dstFile), { recursive: true })
            .then(() => fs.copyFile(filepath!, dstFile))
            .catch(async (reason) => { // FIXME: no .code in Error interface of nodejs. Need find the right interface.
                if (reason.code == ErrorCode.EISDIR || reason.code == ErrorCode.ERR_FS_EISDIR)
                    return await fs.mkdir(dstFile);
                else throw reason;
            });
    }
}
