import mm from "micromatch";
import {replaceStartCharacter} from "./viteBase";
import {replacePosixSep} from "./copyWithResolvedSymlinks";
import {join} from "path";
import {TReturnGetFile} from "../types";
interface IProps {
	id: string;
	code: string;
	viteBase: string;
	mapper: TReturnGetFile;
}
export function transformCssUrl(props: IProps) {
	const {mapper, code, id, viteBase} = props;
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
}
