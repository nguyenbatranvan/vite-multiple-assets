export function removeViteBase(path: string, base: string) {
	const regex = new RegExp(`/?${base}`);
	return path.replace(regex, "");
}

export function replaceStartCharacter(path: string, character: string) {
	try {
		if (path.startsWith(character)) {
			return path.replace(character, "");
		}
		return path;
	} catch (e) {
		return path;
	}
}
