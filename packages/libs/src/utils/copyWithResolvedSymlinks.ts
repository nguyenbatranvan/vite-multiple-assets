import fs from "fs";
import {dirname, join, resolve, sep} from "path";
import {sep as posixSep} from "path/posix";

export async function copyWithResolvedSymlinks(
	source: string,
	destination: string
) {
	try {
		const stat = await fs.promises.lstat(source);

		// Check if the source is a symlink
		if (stat.isSymbolicLink()) {
			const realPath = await fs.promises.readlink(source);
			const absoluteRealPath = resolve(dirname(source), realPath);
			await copyWithResolvedSymlinks(absoluteRealPath, destination);
		} else if (stat.isDirectory()) {
			// If it's a directory, create the destination directory and copy its contents
			await fs.promises.mkdir(destination, {recursive: true});
			const items = await fs.promises.readdir(source);
			for (const item of items) {
				await copyWithResolvedSymlinks(
					replacePosixSep(join(source, item)),
					replacePosixSep(join(destination, item))
				);
			}
		} else {
			// If it's a file, just copy it
			await fs.promises.copyFile(source, destination);
		}
	} catch (error) {
		// console.error('Error copying files:', error);
	}
}

export function replacePosixSep(value: string) {
	return value.replaceAll(sep, posixSep);
}

export const checkSymLink = (path: string) => {
	try {
		return fs.lstatSync(path).isSymbolicLink();
	} catch (error) {
		// console.error(`Error ${entry}:`, error);
		return false;
	}
};
export const findSymlinks = (entries: string[]) => {
	return entries.filter(checkSymLink);
};

export function readSymlink(
	path: string,
	cb?: (err: NodeJS.ErrnoException | null, linkString: string) => void
) {
	fs.readlink(path, (err, linkString) => cb?.(err, linkString));
}
