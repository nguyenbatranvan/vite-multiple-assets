import fs from "fs";
import type {ICacheConfig, IParameterViteServe} from "./types";
import mime from "mime-types";
import http from "node:http";
import type {IncomingMessage} from "http";
import {getFiles} from "./build";
import {ViteDevServer} from "vite";
import Watchpack from "watchpack"


const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "font/eot",
    ".otf": "font/otf",
    ".wasm": "application/wasm",
    ".mjs": "text/javascript",
    ".txt": "text/plain",
    ".xml": "text/xml",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".wgsl": "text/wgsl",
    ".ico": "image/x-icon",
    ".tiff": "image/tiff",
    ".gz": "application/gzip",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".7z": "application/x-7z-compressed"
}

function getContentType(file: string) {
    return mime.lookup(file);
}

function handleWriteToServe(res: http.ServerResponse, req: IncomingMessage, contentType: string, path: string, cacheOption: ICacheConfig = {}) {
    for (const key in cacheOption) {
        res.setHeader(key, cacheOption[key]);
    }
    // res.setHeader("Cache-Control", "max-age=31536000, immutable");
    res.setHeader("Content-Type", contentType);
    res.write(fs.readFileSync(path));
    res.end();
}


function handleRestartChangFolder(watchPaths: string[], server: ViteDevServer) {
    const wp = new Watchpack({
        aggregateTimeout: 10,
        followSymlinks: true,
    });
    wp.watch({
        directories: watchPaths,
        startTime: Date.now() - 10000
    })
    wp.on('change', () => {
        server.restart()
    })

    wp.on('remove', () => {
        server.restart()
    })

    // chokidar.watch(watchPaths, {
    //     ignoreInitial: true,
    //     followSymlinks: true,
    //     persistent: true
    // }).on('all', () => {
    //     internal && clearTimeout(internal)
    //     internal = setTimeout(() => {
    //         server.restart()
    //     })
    // })

}

function removeViteBase(path: string, base: string) {
    const regex = new RegExp(`/?${base}`);
    return path.replace(regex, '');
}

function replaceStartCharacter(path: string, character: string) {
    try {
        if (path.startsWith(character)) {
            return path.replace(character, "");
        }
        return path;
    } catch (e) {
        return path;
    }

}

export async function ServerMiddleWare(payload: IParameterViteServe) {
    const {server, assets, options} = payload;
    const {mimeTypes: types = {}, ssr, cacheOptions = {}} = options || {}
    if (!assets || !assets.length)
        return;
    const {mapper: fileObject, watchPaths} = await getFiles(assets, payload.options, payload.viteConfig);
    let mergeMimeTypes: Record<string, string | undefined> = {...mimeTypes, ...types}
    watchPaths?.length && handleRestartChangFolder(watchPaths, server);
    const base = replaceStartCharacter(payload.viteConfig?.base, '/');
    return () => {
        server.middlewares.use(async (req, res, next) => {
            // NOTE: remove first slash. url always forward slash.
            // NOTE: handle "%2Fetc/wwwroot" for absolute "/etc/wwwroot"
            // NOTE: handle "%2E%2E/%2E%2E/some/file.txt" for relative backward "../../some/file.txt"


            const pathname = new URL(req.originalUrl ?? "", `http://${req.headers.host}`).pathname.slice(1);
            let file = fileObject[removeViteBase(pathname, base)] ?? fileObject[removeViteBase(decodeURIComponent(pathname), base)];
            if (file) {
                const extension = file.path.substring(file.path.lastIndexOf("."));
                const contentType = mergeMimeTypes[extension] || getContentType(file.path) || mergeMimeTypes[".html"] || (getContentType(".html") as string);
                if (ssr)
                    res.addListener('pipe', () => {
                        handleWriteToServe(res, req, contentType, file?.path!, cacheOptions)
                    })
                else {
                    handleWriteToServe(res, req, contentType, file.path, cacheOptions)
                }
            } else {
                next();
            }
        });
    };
}

