import fs from "fs";
import type { IParameterViteServe } from "./types";
import mime from "mime-types";
import http from "node:http";
import type { IncomingMessage } from "http";
import { getFiles } from "./build";

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

function handleWriteToServe(res: http.ServerResponse, req: IncomingMessage, contentType: string, path: string) {
    res.setHeader("Cache-Control", "max-age=31536000, immutable");
    res.setHeader("Content-Type", contentType);
    res.write(fs.readFileSync(path));
    res.end();
}

export async function ServerMiddleWare(payload: IParameterViteServe) {
    const {server, assets, options} = payload;
// =======
// const postfixRE = /[?#].*$/s

// /**
//  * Get pure file url
//  * @param {string} url
//  * @example
//  * toFilePath('vite.svg?t=1703075066566') // return 'vite.svg'
//  * @returns {string} Returns file url
//  */
// function toFilePath(url: string = '') {
//     let filePath = url.replace(postfixRE, '')
//     return filePath
// }


// export function ServerMiddleWare(payload: IParameterViteServe) {
//     const {server, assets, options = {}} = payload;
    const {mimeTypes: types = {}, ssr} = options || {}
    if (!assets || !assets.length)
        return;
    const fileObject = await getFiles(assets, payload.options, payload.viteConfig);
    let mergeMimeTypes: Record<string, string | undefined> = {...mimeTypes, ...types}

    return () => {
        server.middlewares.use(async (req, res, next) => {
            // NOTE: remove first slash. url always forward slash.
            // NOTE: handle "%2Fetc/wwwroot" for absolute "/etc/wwwroot"
            // NOTE: handle "%2E%2E/%2E%2E/some/file.txt" for relative backward "../../some/file.txt"

            const pathname = new URL(req.originalUrl ?? "", `http://${req.headers.host}`).pathname.slice(1);
            let file = fileObject[pathname] ?? fileObject[decodeURIComponent(pathname)];

            if (file) {
                const extension = file.substring(file.lastIndexOf("."));
                const contentType = mergeMimeTypes[extension] || getContentType(file) || mergeMimeTypes[".html"] || (getContentType(".html") as string);
                if (ssr)
                    res.addListener('pipe', () => {
                        handleWriteToServe(res, req, contentType, file!)
                    })
                else {
                    handleWriteToServe(res, req, contentType, file)
// =======
            // for (let i = 0; i < fileObject.length; i++) {
            //     const file = path.join(process.cwd(), `${fileObject[i].name}/${toFilePath(req.originalUrl)}`);
            //     if (fileObject[i].files.some(f => path.relative(f, file) === "")) {
            //         const extension = file.substring(file.lastIndexOf("."));
            //         const contentType = mergeMimeTypes[extension] || getContentType(file)
            //         if (ssr)
            //             res.addListener('pipe', () => {
            //                 handleWriteToServe(res, req, contentType, file)
            //             })
            //         else {
            //             handleWriteToServe(res, req, contentType, file)
            //         }
            //         return
                }
            }
            next();
        });
    };
}

