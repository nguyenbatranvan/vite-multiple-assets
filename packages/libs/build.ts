import fs from "fs";
import {NormalizedOutputOptions} from "rollup";

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

export function buildMiddleWare(options: NormalizedOutputOptions, assets: string[] = []) {
    const dst = options.dir;
    if (!dst) throw new Error("options.dir is undefined");
    for (const dir of assets) {
        copyRecursively(dir, dst)
    }
}
