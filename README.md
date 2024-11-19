# Setup

`vite-multiple-assets` support vite to run with multiple directory public directory.

## Feature

- No copy file when run dev, help with no impact on performance when launching apps with vite
- Support automatically copy files when running build
- Support SSR

## Quick setup would be in the `vite.config.js`:

* Default with vite's configuration you can only use 1 publicDir in `vite.config.ts`

```ts
export default defineConfig({
    // default is public folder
    publicDir: ''
})
```

* With this plugin you can add multiple public folders

## Install

```sh
npm i -D vite-multiple-assets
```

## Basic Usage

In `vite.config.ts`

```ts
import {type PluginOption} from 'vite'
import {DynamicPublicDirectory} from "vite-multiple-assets";
// same level as project root
const dirAssets = ["public/**", "libs/{\x01,assets}/**", "repo1/{\x01,assets}/**"];

// example
const mimeTypes = {
    '.acc': 'application/acc'
}

export default defineConfig({
    plugins: [
        DynamicPublicDirectory(dirAssets, {
            ssr: true,
            mimeTypes
        }) as PluginOption
    ],
    publicDir: false,
})
```

* With the above configuration will automatically add files in `libs/assets`, `repo1/assets` folders as static assets
  for your project
* It also recommended to set `publicDir` to `false` to avoid confusion
* Notice the wildcard `**`, this plugin use glob pattern by default. You could also
  review [fast-glob](https://www.npmjs.com/package/fast-glob) and [micromatch](https://www.npmjs.com/package/micromatch)

### Astro Support

In `astro.config.mjs`

```ts
import {defineConfig} from 'astro/config';
import {astroMultipleAssets} from "vite-multiple-assets";

const assets = ['public2/**'];
// https://astro.build/config
export default defineConfig({
    integrations: [
        astroMultipleAssets(assets)
    ],
});
```

## Options

```ts
import type {PluginOption} from "vite";

export default function DynamicPublicDirectory(assets: IAssets, opts: IConfig = {}): PluginOption
```

```ts
import type {Options} from "fast-glob";

export interface IConfigExtend extends Partial<Pick<Options, "ignore" | "dot">> {
    dst?: string | FDst;
}

export interface IConfig extends IConfigExtend,
    Partial<Pick<Options, "onlyFiles" | "onlyDirectories" | "cwd" | "markDirectories">> {
    __dst?: string; // NOTE: internal destination from parsing rollup write bundlers nor vite config.
    mimeTypes?: IMIME;
    ssr?: boolean;
}
```

<!-- NOTE: for documenters, these options is ordered from the most important to the less -->
<!-- NOTE: types preview using `var` instead of `let` and `const` as function arguments are `var` by design -->

### `assets`

```ts
export type IObjectAssets = {
    input: string;
    output: string;
    watch?: boolean;
    flatten?: boolean;
}
var assets: IAssets = [];
export type IAssets = (string | IObjectAssets)[];
```

List copied `assets` by following pattern defined in [
`fast-glob` pattern](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax) which
is [Unix Glob](https://man7.org/linux/man-pages/man7/glob.7.html) [Pattern](https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html).
There are few things to take:

- always use forward-slash `/` for path, and use backslash to escape character
- do not use single-dot `./**/*.txt` `./abc/**/*.txt` for current path, instead straight use the pattern `**/*.txt`
  `abc/**/*.txt`
- If you are hope certain folder included to be copied, make it in selectable list pattern,
  `dir1/{\x01,folder_name}/**`. Just ensure there is no folder or file named by first ascii

For example:

```ts
export default defineConfig({
    plugins: [
        DynamicPublicDirectory([
            "public/{\x01, models}/**", // order is important
            "public/**", // basic public needs
            "../../assets/**" // you could go to upper level
        ])
    ],
    publicDir: false,
})
```

**Match and out examples:**

```ts
`/a/b/c/d/**` + `/a/b/c/d/efg.txt` = `efg.txt`
    `/a/b/{\x01,c}/d/**` + `/a/b/c/d/efg.txt` = `c/d/efg.txt`
```

#### Detailed explanation `/x01`

This character is used to specify whether you want the output to include the current directory containing this character
or not.

**I have `shared-assets` folder**:
```tree
.
├── shared-assets
│   ├── image.png
│   └── logo.png
```

#### Using with `\x01`

```ts
DynamicPublicDirectory(["{\x01, shared-assets}/**"])
```

- Result bundle:

```tree
├── dist
│   ├── shared-assets
│   │   ├── image.png
│   │   ├── logo.png
```

- Usage in component

`App.tsx`

```tsx
<img src="/shared-assets/image.png"/>
```
#### Using outside `\x01`

```ts
DynamicPublicDirectory(["shared-assets/**"])
```

- Result bundle:

```tree
├── dist
│   ├── image.png
│   ├── logo.png
```

- Usage in component

`App.tsx`

```tsx
<img src="/image.png"/>
```

##### This works the same in `development` environment

### Custom output assets

Similar to the above configurations, the only difference is that you can add output with your own paths

- `input`: Path of public folder
- `output`: output of public directory
- `watch`: Watch shared folder changes! Whenever a new file is added or deleted, the page will automatically reload.
  Default `false`.
- `flatten`: flatten the directory, to a single level! Do not copy subdirectories

#### Flatten

- I have `public` folder:

```tree
.
├── public
│   ├── sub-folder
│   │   ├── sub-file.png
│   │   ├── nested-sub-folder
│   │   │   ├── nested-sub-file.png
│   ├── image.png
│   └── logo.png
```

`vite.config.ts`:

```ts
export default defineConfig({
    plugins: [
        DynamicPublicDirectory([
            {
                // copy file ignore parent folder.
                // If you want to copy the parent directory as well, the syntax would be simply
                // {\x01, public}/**
                input: "public/**",
                output: "/shared",
                flatten: false // default
            }
        ])
    ],
    publicDir: false,
})
```

- Result with `flatten = false` in `dist`:

```tree
.
├── shared
│   ├── sub-folder
│   │   ├── sub-file.png
│   │   ├── nested-sub-folder
│   │   │   ├── nested-sub-file.png
│   ├── image.png
│   └── logo.png
```

- if `flatten = true`:

```tree
.
├── shared
│   ├── image.png
│   ├── sub-file.png
│   ├── nested-sub-file.png
│   └── logo.png
```

### `opts.cwd`

```ts
var opts_cwd: string = process.cwd();
```

Where does the beginning root to traverse all directory and files. If you not define, it would goes using Vite's
`.root`. If not defined, it would goes using `process.cwd()` by default.

### `opts.cacheOptions`

```text
{
    "Cache-Control": "max-age=31536000, immutable"
    // ...
}
```

- Default: No cache

**Note**:  Working only development

### `opts.ssr`

```ts
var opts_ssr: boolean = false;
```

SSR option accept certain value:

- `true`: support using Solid-js or framework with SSR
- `false` (default): support client side, static build

If you need to go up, you could use `%2E%2E/file.txt` as alternative of `../file.txt`. Also, you could you
`%2Fetc/wwwroot` as alternative of `/etc/wwwroot`. Just in case you need it.

### `opts.mimeTypes`

```ts

var opts_mimeTypes: IMIME = {}
export type IMIME = Record<string, string>;

const internalMimeTypes: IMIME = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "font/eot",
    ".otf": "font/otf",
    ".wasm": "application/wasm",
    ".mjs": "text/javascript",
    ".txt": "text/plain",
    ".xml": "text/xml",
    ".wgsl": "text/wgsl",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".tiff": "image/tiff",
    ".gz": "application/gzip",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".7z": "application/x-7z-compressed"
};

```

You could define your extended content types using `opts.mimeTypes`. This feature could be use when using `SSR` mode.
There are few hierarchi when choosing the right types:

1. get the last extention and compare it to your `opt.mimeTypes`. If not exists,
2. get the last extention and compare it to `internalMimeTypes`. If not exists,
3. do `mime.lookup` to the entire filename so it will be automatically handled according to the [
   ```mime-types```](https://www.npmjs.com/package/mime-types) library by [
   `mime-db`](https://www.npmjs.com/package/mime-db). If not exists,
4. just use `.html` content type from `opts.mimeTypes` and then `internalMimeTypes`. If not exists,
5. just lookup `.html` content type from `mime-types`

### `opts.ignore`

```ts
var opts_ignore: string[] = [];
```

List of pattern to be ignored. If you want to include all files from root and inside `public/` but not the public
itself, you could do as follow:

```ts
export default defineConfig({
    plugins: [
        DynamicPublicDirectory(["public/**", "**"], {
            ignore: ["/public"]
        })
    ],
    publicDir: false,
})
```

**Notice:** `public/**` and `/public` are different.

### `opts.followSymlinks`

Are symlinks in shared folders tracked and read? If so, symlinks will work in development and be copied when running a
build. Default `false`

```js
export default defineConfig({
    plugins: [
        DynamicPublicDirectory(["public/**"], {
            followSymlinks: true
        })
    ],
    publicDir: false,
})
```

### `opts.dst`

```ts
// NOTE: internal destination from parsing rollup write bundlers nor vite config.
// If opts.dst is defined and is string,
let opts_0__dst: string = opts_dst || writeBundleOptions?.dir || viteConfig?.build.outDir;

var opts_dst: string | FDst = writeBundleOptions?.dir || viteConfig?.build.outDir;

export type FDst = (params: {
    // CORE
    dst: string;        // destination folder
    assets: IAssets;    // list of assets pattern

    // UTILITIES
    filepath: string;   // absolute path to the source file would be copied
    baseFile: string;   // internal normalization; most common to use this one
    dstFile: string;    // NOTE: either absolut or non-slash on beginning path to target copied;
                        //       default destination to the last filename

    // MUTABLE
    writeBundleOptions?: NormalizedOutputOptions; // modify rollup option
    viteConfig: IViteResolvedConfig; // modify vite option
    opts: IConfig;  // {__dst, ...opts}; 
                    // modify internal configuration
    __files: IFilesMapper; // NOTE: internal use to modify all compiled files entirely;
                           // NOTE: user can return false and define its own compilation
}) => string | false | void;

export type IFilesMapper = Partial<Record<string, string>>; // STUB: { baseTransformedFilePath: toAbsolutePath }
```

Where the files would be copied. In default, it would reuse Rollup output or Vite output. This options allow user to
reroutes to different folder, or prorammatically reroutes these copied files and rename it. Programmatically reroutes
has 3 return options:

- `string`: path with filename relative to default destination directory, or absolute path. Rules from `assets` also
  applied.
- `false`: do not copy file. Can be use to programmatically ignore certain file. Use this if you need complex use-case.
- `undefined`: copy to default name and destination

You could reroutes to different folder:

```ts
import path from "path/posix"; // NOTE: use posix for relative transformation

DynamicPublicDirectory(["public/**"], {
    // goto `.cache/` instead of `dist/`
    dst: path.join(__dirname, ".cache"),
})
```

You could also make your own `ignore` and filter:

```ts
DynamicPublicDirectory(["public/**"], {
    dst: ({dstFile, filepath,}) => filepath.match(/.jpg$/ig) ? false : undefined,
})
```

If you need to add more files which not depend with this plugin's internal logic; or you need to modify base for SSR,
you could modify `__files`.

```ts
let nonce = false;

DynamicPublicDirectory(["public/**"], {
    dst: ({
              opts: {__dst, ...opts}, __files, // muttable
              dstFile, filepath, baseFile, // useful params to use
          }) => {
        if (!nonce) {
            __files["new-no/existing/file.png"] = "/home/me/Pictures/image.png"
            nonce = true;
        }
    }
})
```

### `opts.dot`

```ts
var opts_dot: boolean = true;
```

Also search for dotfile (hidden files of linux). Those are in examples `.env`, `.npmrc`, `.git/`, `.gitignore/`, etc.
For conveince to make everything discoverable, this option is `true` by default.

### `opts.onlyFiles`

```ts
var opts_onlyFiles: boolean = true;
```

Search and gather only files (with no directories). For convenience to get lower size and more countable, this option is
`true` by default. If you want to also copy empty folder, you could set `false` to this options. It would be wise if you
also set `opts.onlyDirectories` to `false`.

### `opts.onlyDirectories`

```ts
var opts_onlyDirectories: boolean = false;
```

Search and gather only directories (with no files). Opposite to `opts.onlyFies`, this option is `false` by default.
Assuming, just copying folders is useless.

> Enable this options can lead to duplication issue, the folder which contains files inside it also reached, and also
> all folders inside it. When coping the folder, the same folders may be copied twice or more.

### `opts.markDirectories`

```ts
var opts_markDirectories: boolean = true;
```

Mark all path of directory noticeable by adding the last slash at the end of the path. For conveince, this option is
`true` by default. Assume this structure:

```css
dirA

/
\_ dirAA

/
\_ file.txt
dirB

/
```

The list of folder could be:

```css
dirA

/
dirA /dirAA/
dirA

/
file.txt
dirB

/
```

## Enforced Behaviors

All `opts.*` internally directly passed to `fast-glob`, so you could override `opts` types and use any `fast-glob`
available flags. This is not recommended as these options already selected to fit internal logic and this plugin
original use-case and ideation. Even though that, there is options that is enforced to satisfy internal logic.

## `opts.absolute`

```ts
const opts_absolute: boolean = false;
```

This option is forced to be `false`. All path would return to relative path from `cwd`. These is intended due to simpler
internal logic, and easier in rejoin path to `dst`.
