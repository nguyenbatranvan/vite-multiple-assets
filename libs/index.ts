import fs from "fs";
import path from "path";
import {PluginOption, ViteDevServer} from "vite";
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
    ".ico": "image/x-icon",
    ".tiff": "image/tiff",
    ".gz": "application/gzip",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".7z": "application/x-7z-compressed",
}

function getFiles(dir, files_): string[] {
    files_ = files_ || [];
    const files = fs.readdirSync(dir);
    for (const i in files) {
        const name = dir + "/" + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

function copyRecursively(src: string, dst: string) {
    if (fs.statSync(src).isDirectory()) {
        // folder
        if (!fs.existsSync(dst)) {
            fs.mkdirSync(dst);
        }
        for (const file of fs.readdirSync(src)) {
            copyRecursively(src + "/" + file, dst + "/" + file);
        }
    } else {
        // file
        fs.copyFileSync(src, dst);
    }
}

interface IPropsFile {
    name: string;
    files: string[];
}

// function getContentTypeImage(image: string) {
//     return mime.lookup(image);
// }

export default function DynamicPublicDirectory(assets: string[]): PluginOption {
    return {
        configureServer(server: ViteDevServer) {
            if (!assets || !assets.length)
                return;
            const fileObject: IPropsFile[] = [];
            for (let i = 0; i < assets.length; i++) {
                const files = getFiles(path.join(process.cwd(), `/${assets[i]}`), []);
                fileObject.push({
                    name: assets[i],
                    files
                });
            }

            return () => {
                server.middlewares.use(async (req, res, next) => {
                    for (let i = 0; i < fileObject.length; i++) {
                        const file = path.join(process.cwd(), `${fileObject[i].name}/${req.originalUrl}`);
                        if (fileObject[i].files.includes(file)) {
                            const extension = file.substring(file.lastIndexOf("."));
                            res.setHeader("Cache-Control", "max-age=31536000, immutable");
                            res.setHeader("Content-Type", mimeTypes[extension]);
                            res.writeHead(200);
                            res.write(fs.readFileSync(path.join(process.cwd(), "/" + fileObject[i].name + req.originalUrl)));
                            res.end();
                            break;
                        }
                    }
                    next();
                });
            };
        },
        async writeBundle(options, bundle) {
            const dst = options.dir;
            if (!dst) throw new Error("options.dir is undefined");
            for (const dir of assets) {
                copyRecursively(dir, dst)
            }
        },
        name: "dynamic assets"
    };
}
