import {ViteDevServer} from "vite";

export type IMIME = Record<string, string>;

export interface IConfig {
    mimeTypes: IMIME;
    ssr: boolean;
}

export interface IParameterViteServe {
    server: ViteDevServer;
    assets: string[];
    options: IConfig
}
