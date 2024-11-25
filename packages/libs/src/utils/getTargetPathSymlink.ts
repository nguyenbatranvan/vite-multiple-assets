import fs from "fs";
import path from "node:path";

export function getTargetPathSymlink(symlink: string) {
	try {
		const targetPath = fs.readlinkSync(symlink);
		return path.resolve(path.dirname(symlink), targetPath);
	} catch (e) {
		return null;
	}
}
