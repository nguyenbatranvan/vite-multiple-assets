export function countParentDirectory(path: string) {
	const parent = path.split("../");
	const countParent = parent.length - 1;
	return {
		countParent,
		joinPath: Array(countParent).fill("../").join("")
	};
}
