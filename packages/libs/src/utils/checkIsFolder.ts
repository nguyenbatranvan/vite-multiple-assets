import fs from "fs";
export async function checkIsFolder(pathToCheck: string) {
	let isFolder = true;
	return fs.promises
		.stat(pathToCheck)
		.then((stats) => {
			if (stats.isFile()) {
				isFolder = false;
			}
			if (stats.isDirectory()) {
				isFolder = true;
			}
			return isFolder;
		})
		.catch((e) => {});
}
