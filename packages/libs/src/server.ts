import fs from "fs";
import {
	ICacheConfig,
	IParameterViteServe,
	TReturnGetFile,
	TValueMapper
} from "./types";
import mime from "mime-types";
import http from "node:http";
import type {IncomingMessage} from "http";
import {getFiles} from "./build";
import {ViteDevServer} from "vite";
import Watchpack from "watchpack";
import {resolve} from "path";
import {readSymlink, removeViteBase, replaceStartCharacter} from "./utils";

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
};

function getContentType(file: string) {
	return mime.lookup(file);
}

/**
 * Parse Range header from request
 * Returns { start, end } or null if no valid range
 */
function parseRange(
	rangeHeader: string | undefined,
	fileSize: number
): {start: number; end: number} | null {
	if (!rangeHeader) return null;

	const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
	if (!match) return null;

	const start = match[1] ? Number.parseInt(match[1], 10) : 0;
	const end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;

	// Validate range
	if (start >= fileSize || end >= fileSize || start > end) {
		return null;
	}

	return {start, end};
}

function handleWriteToServe(
	res: http.ServerResponse,
	req: IncomingMessage,
	contentType: string,
	path: string,
	cacheOption: ICacheConfig = {}
) {
	try {
		// Get file stats for size
		const stats = fs.statSync(path);
		const fileSize = stats.size;

		// Parse Range header
		const rangeHeader = req.headers.range;
		const range = parseRange(rangeHeader, fileSize);

		// Set cache options
		for (const key in cacheOption) {
			res.setHeader(key, cacheOption[key]);
		}

		// Always set Accept-Ranges header to indicate range support
		res.setHeader("Accept-Ranges", "bytes");
		res.setHeader("Content-Type", contentType);

		if (range) {
			// Handle range request (for video seeking)
			const {start, end} = range;
			const contentLength = end - start + 1;

			// Set 206 Partial Content status
			res.statusCode = 206;
			res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
			res.setHeader("Content-Length", contentLength);

			// Read and send only the requested range
			const fileStream = fs.createReadStream(path, {start, end});
			fileStream.pipe(res);

			fileStream.on("error", (err) => {
				console.error("Error streaming file:", err);
				res.end();
			});
		} else {
			// Handle normal request (no range)
			res.statusCode = 200;
			res.setHeader("Content-Length", fileSize);
			// Stream the entire file
			const fileStream = fs.createReadStream(path);
			fileStream.pipe(res);

			fileStream.on("error", (err) => {
				console.error("Error streaming file:", err);
				res.end();
			});
		}
	} catch (e) {
		console.error("Error in handleWriteToServe:", e);
		res.statusCode = 500;
		res.write("");
		res.end();
	}
}
const wp = new Watchpack({
	aggregateTimeout: 1000,
	followSymlinks: true
});
function handleRestartChangFolder(watchPaths: string[], server: ViteDevServer) {
	wp.watch({
		directories: watchPaths,
		startTime: Date.now() - 10000
	});
	wp.on("change", () => {
		server.restart();
	});

	wp.on("remove", () => {
		server.restart();
	});

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

export async function ServerMiddleWare(
	payload: IParameterViteServe & {data?: TReturnGetFile}
) {
	const {server, assets, options, data} = payload;
	const {mimeTypes: types = {}, ssr, cacheOptions = {}} = options || {};
	if (!assets || !assets.length) return;
	const {mapper: fileObject, watchPaths} =
		data || (await getFiles(assets, payload.options, payload.viteConfig));
	const mergeMimeTypes: Record<string, string | undefined> = {
		...mimeTypes,
		...types
	};
	wp.close();
	watchPaths?.length && handleRestartChangFolder(watchPaths, server);
	const base = replaceStartCharacter(payload.viteConfig?.base, "/");
	return () => {
		server.middlewares.use(async (req, res, next) => {
			// NOTE: remove first slash. url always forward slash.
			// NOTE: handle "%2Fetc/wwwroot" for absolute "/etc/wwwroot"
			// NOTE: handle "%2E%2E/%2E%2E/some/file.txt" for relative backward "../../some/file.txt"

			const pathname = new URL(
				req.originalUrl ?? "",
				`http://${req.headers.host}`
			).pathname.slice(1);
			const file =
				fileObject![removeViteBase(pathname, base)] ??
				fileObject![removeViteBase(decodeURIComponent(pathname), base)];

			let path = file?.path!;
			if (file?.isSymLink) {
				readSymlink(path, (err, linkString) => {
					if (!err) {
						path = resolve(file.root!, linkString);
						handleBeforeWriteToServe(
							{
								res,
								req,
								ssr,
								cacheOptions,
								path,
								file,
								mergeMimeTypes
							},
							() => next()
						);
					}
				});
				return;
			}
			handleBeforeWriteToServe(
				{
					res,
					req,
					ssr,
					cacheOptions,
					path,
					file,
					mergeMimeTypes
				},
				() => next()
			);
		});
	};
}

interface IPropsBeforeWriteToServe {
	file: TValueMapper | undefined;
	path: string;
	mergeMimeTypes: Record<string, string | undefined>;
	ssr?: boolean;
	cacheOptions: ICacheConfig;
	res: http.ServerResponse;
	req: IncomingMessage;
}

function handleBeforeWriteToServe(
	data: IPropsBeforeWriteToServe,
	handleNext: () => void
) {
	const {path, file, mergeMimeTypes, cacheOptions, ssr, req, res} = data;
	if (file) {
		const extension = path.substring(path.lastIndexOf("."));
		const contentType =
			mergeMimeTypes[extension] ||
			getContentType(path) ||
			mergeMimeTypes[".html"] ||
			(getContentType(".html") as string);
		if (ssr)
			res.addListener("pipe", () => {
				handleWriteToServe(res, req, contentType, path!, cacheOptions);
			});
		else {
			handleWriteToServe(res, req, contentType, path, cacheOptions);
		}
		return;
	}
	handleNext();
}
