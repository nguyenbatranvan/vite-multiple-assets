import fs from "fs";
import type {NormalizedOutputOptions} from "rollup";
import {basename, dirname, isAbsolute, join, resolve, sep} from "path";
import mm from "micromatch";
import fg from "fast-glob";
import {FDst, IAssets, IConfig, IFilesMapper, IObjectAssets, IViteResolvedConfig} from "./types";
import {countParentDirectory, checkIsFolder, replacePosixSep, copyWithResolvedSymlinks, findSymlinks} from "./utils";

// LINK https://nodejs.org/docs/latest/api/errors.html#common-system-errors
export enum ErrorCode {
    EISDIR = "EISDIR",
    ERR_FS_EISDIR = "ERR_FS_EISDIR",
    ENOENT = "ENOENT"
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
                               opts: {ignore, ...opts},
                           }) => {
        const {files} = transformFiles(assets, opts)
        for (const asset of files) {
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
            if (list[asset].isMatch(dstFile) && dstFile.slice(0, list[asset].base.length).toUpperCase() == list[asset].base.toUpperCase()) {
                dstFile = dstFile.slice(list[asset].startGlob); // REVIEW: fixed because last slash before glob is not included in base
                break;
            }
        }
        return dstFile;
    };

    return {list, resolve};
}

export const internalDestination = destinationResolver();

function transformFiles(data: IAssets, opts?: IConfig) {
    const __data: IObjectAssets[] = [];
    const {cwd} = opts ?? {};
    const __files: string[] = [];
    const watchPaths: string[] = [];
    for (let item of data) {
        if (typeof item === "string") {
            __files.push(item)
            __data.push({
                input: item,
                output: ""
            })
        } else {
            const {watch, input} = item;
            watch && watchPaths.push(resolve(cwd!, fg.sync(input.replace('**', ""), {
                onlyFiles: false,
                followSymbolicLinks: true
            })[0]))
            __files.push(input)
            __data.push(item);
        }
    }
    return {
        watchPaths,
        data: __data,
        files: __files
    }
}


export async function getFiles(
    files_: IAssets = [],
    opts: IConfig = {},
    viteConfig: IViteResolvedConfig,
    writeBundleOptions?: NormalizedOutputOptions
) {
    files_ = files_ || [];
    const {files: __transformFiles, data, watchPaths} = transformFiles(files_, opts);
    const cloneOpts = {...opts};
    if (opts.followSymbolicLinks) {
        cloneOpts.markDirectories = false;
        cloneOpts.onlyFiles = false;
        cloneOpts.onlyDirectories = false;

    }
    const files = await fg.glob(__transformFiles, {
        // onlyFiles: false,
        ignore: [],
        onlyFiles: true,
        onlyDirectories: false,
        markDirectories: true,
        dot: true,
        // onlyDirectories: false,
        // markDirectories: false,
        ...cloneOpts,
        followSymbolicLinks: !opts.followSymbolicLinks,
        throwErrorOnBrokenSymbolicLink: opts.followSymbolicLinks
    });
    // let symlinks: string[] = ;
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
        if (opts.dst && typeof opts.dst == "function")
            _dstFile = opts.dst({
                filepath, baseFile, opts, viteConfig, writeBundleOptions,
                assets: files_,
                dstFile: name as string,
                dst: opts.__dst!,
                __files: mapper,
            });
        if (_dstFile == false) continue;
        if (_dstFile == undefined) _dstFile = name as string;
        _dstFile = replacePosixSep(_dstFile); // STUB: force using posix

        // STUB: this intentionally left for future extentional purpose
        const indexMatch = data.findIndex(item => mm.isMatch(filepath, item.input));
        const output = data[indexMatch]?.output
        name = output ? replacePosixSep(join(output.replace(/^\/+/, ''), basename(filepath))) : _dstFile;
        const {countParent, joinPath} = countParentDirectory(filepath);
        mapper[name] = {
            path: resolve(opts.cwd!, filepath),
            output,
            root: countParent ? resolve(opts.cwd!, joinPath) : ""
        }; // STUB: filepath MUST Absolute
    }
    return {mapper, watchPaths, symlinks: opts.followSymbolicLinks ? findSymlinks(files) : []};
}


// async function createSymlinkFolder(dirPath: string, symlinkPath: string) {
//     const check = await checkIsFolder(dirPath)
//     fs.symlink(dirPath, symlinkPath, check ? 'dir' : 'file', (err) => {
//         if (err) {
//             return console.error('Error creating symlink:', err);
//         }
//     });
// }

export async function buildMiddleWare(
    writeBundleOptions: NormalizedOutputOptions,
    assets: IAssets = [],
    opts: IConfig = {},
    viteConfig: IViteResolvedConfig,
) {
    const {mapper} = await getFiles(assets, opts, viteConfig, writeBundleOptions);
    for (const [_dstFile, filepath] of Object.entries(mapper)) {
        const {output, path, root} = filepath!;
        // STUB: `dstFile` must be absolute.
        const dstFile = isAbsolute(_dstFile) ? _dstFile : join(opts.__dst!, output || _dstFile);
        const pathDst = output ? join(dstFile, basename(path)) : dstFile;
        const dirnamePathDst = dirname(pathDst);

        // STUB: using chain promise to handle further condition and more convenience
        await fs.promises.mkdir(dirnamePathDst, {recursive: true})
            .then(async () => {
                const check = await checkIsFolder(path)
                return !check ? fs.promises.copyFile(path!, pathDst) : null
            })
            .catch(async (reason) => { // FIXME: no .code in Error interface of nodejs. Need find the right interface.
                if (reason.code == ErrorCode.EISDIR || reason.code == ErrorCode.ERR_FS_EISDIR)
                    return await fs.promises.mkdir(dstFile);
                else if (reason.code == ErrorCode.ENOENT && reason.path && reason.dest) {
                    fs.readlink(path, async (err, linkString) => {
                        if (err) {
                            // console.error('Error reading symlink:', err);
                            // todo handle error here
                        } else {
                            await copyWithResolvedSymlinks(resolve(root!, linkString), pathDst)
                        }
                    })
                } else
                    throw reason;
            });
    }
}


