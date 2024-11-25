import {replaceStartCharacter} from "./viteBase";
import {replacePosixSep} from "./copyWithResolvedSymlinks";
import {join} from "path";
import {TReturnGetFile} from "../types";

interface IProps {
	viteBase: string;
	url: string;
	file: TReturnGetFile;
}

export function handleMatchFileFromAssets(data: IProps) {
	const {viteBase, url, file} = data;
	const regex = new RegExp(`/?${viteBase}`);
	const matchers = url.match(regex);
	return !!(!matchers && file.mapper![replaceStartCharacter(url, "/")]);
}
