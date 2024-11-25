import {DynamicPublicDirectory} from "./index";
import {ServerMiddleWare} from "./server";
import type {IAssets, IConfig, IParameterViteServe} from "./types";

export function AstroIntegration(assets: IAssets, options: IConfig = {}) {
	return {
		name: "vite-multiple-assets-astro-integration",
		hooks: {
			"astro:config:setup": ({updateConfig}) => {
				updateConfig({
					vite: {
						plugins: [DynamicPublicDirectory(assets, options)]
					}
				});
			},
			"astro:server:setup": async ({server}) => {
				const middleware = await ServerMiddleWare({
					server,
					assets,
					options
				} as unknown as IParameterViteServe);

				if (!middleware) return;

				middleware();
			}
		}
	};
}
