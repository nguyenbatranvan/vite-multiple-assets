import type {PluginOption, ViteDevServer} from "vite";
import {ServerMiddleWare} from "./server";
import {AstroIntegration} from "./astroIntegration";
import {buildMiddleWare, getFiles} from "./build";
import {IAssets, IConfig, IViteResolvedConfig, TReturnGetFile} from "./types";
import type {NormalizedOutputOptions} from "rollup";
import {replacePosixSep, replaceStartCharacter} from "./utils";
import {join} from "path";
import mm from "micromatch";

let mapper: TReturnGetFile;
let viteBase: string;

// FIXME: types of writeBuldeOptions is not match when developing in PNPM
export function resolveInternalConfig({
	opts,
	writeBundleOptions,
	viteConfig,
	force
}: {
	opts: IConfig;
	writeBundleOptions?: NormalizedOutputOptions;
	viteConfig?: IViteResolvedConfig;
	force?: "bundle" | "vite" | boolean;
}) {
	force ??= false;
	opts ??= {};
	opts.cacheOptions ??= {};
	opts.ignore ??= [];
	opts.onlyFiles ??= true;
	opts.onlyDirectories ??= false;
	opts.markDirectories ??= true;
	opts.dot ??= true;

	// STUB[epic-LEGACY-FIRST] formerly, this plugin using config from rollup instead of vite.
	// TODO[epic-LEGACY-FIRST] for modern purpose, use resolved config from vite
	if (writeBundleOptions || force === "bundle" || force === true) {
		opts.__dst ??=
			(typeof opts.dst === "string" ? opts.dst : undefined) ??
			writeBundleOptions?.dir ??
			(force ? (viteConfig?.build.outDir ?? "./dist") : undefined);
		if (!opts.__dst) throw new Error("options.dir is undefined");
		opts.dst ??= opts.__dst;
	}

	if (viteConfig || force === "vite" || force === true) {
		opts.cwd ??= viteConfig?.root ?? (force ? process.cwd() : undefined);
	}
}

export default function DynamicPublicDirectory(
	assets: IAssets,
	opts: IConfig = {}
): PluginOption {
	let viteConfig: IViteResolvedConfig;

	resolveInternalConfig({opts});
	return {
		async configureServer(server: ViteDevServer) {
			if (!mapper) mapper = await getFiles(assets, opts, viteConfig);
			return await ServerMiddleWare({
				server,
				assets,
				options: opts,
				viteConfig,
				data: mapper
			});
		},
		configResolved(config) {
			viteConfig = config;
			resolveInternalConfig({opts, viteConfig});
		},
		async writeBundle(writeBundleOptions) {
			resolveInternalConfig({opts, viteConfig, writeBundleOptions});
			await buildMiddleWare(writeBundleOptions, assets, opts, viteConfig);
		},
		transform: async (code, id) => {
			if (!opts.needTransformBaseCss) {
				return null;
			}
			if (!mapper) {
				mapper = await getFiles(assets, opts, viteConfig);
			}
			viteBase = viteConfig.base;
			if (/\.(css|scss|sass|less|styl|stylus)$/.test(id)) {
				return {
					code: code.replace(/url\(["']?([^"')]+)["']?\)/g, (match, url) => {
						if (
							!mm.isMatch(url, `${viteBase}**`) &&
							mapper.mapper![replaceStartCharacter(url, "/")]
						) {
							return match.replace(url, replacePosixSep(join(viteBase, url)));
						}
						return match;
					})
				};
			}
			return null;
		},
		name: "dynamic assets"
	};
}

export {
	DynamicPublicDirectory,
	ServerMiddleWare,
	AstroIntegration as astroMultipleAssets
};
