# vite-multiple-assets
`vite-multiple-assets` add support for multiple public asset directories to vite (or astro).
### Document
[Visit website](https://nguyenbatranvan.github.io/vite-multiple-assets-doc/)
### Feature
- No copy file when run dev, help with no impact on performance when launching apps with vite
- Support automatically copy files when running build
- Support SSR

### Quick setup would be in the `vite.config.js`:

* By default, vite's configuration only allows you to specify 1 public directory, via publicDir in `vite.config.ts`
```ts
export default defineConfig({
    // default is public folder
    publicDir:''
})
```
* With this plugin you can add multiple public directories

### install
``npm i -D vite-multiple-assets``

#### Config options

- dirAssets: list of your static directories
- mimeTypes: Add your extended content types, by default there will be the following content types
- ssr: default is `false` support client side, using with Solid-js or framework support SSR please enable this flag to `true`

```ts
{
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
}
```

**Note:** In case the content type is not found, it will be automatically handled according to the ```mime-types``` library


In `vite.config.ts`
```ts
-Before `1.3.0`

import DynamicPublicDirectory from "vite-multiple-assets";

-After `1.3.0`
import {DynamicPublicDirectory} from "vite-multiple-assets";
// same level as project root
const dirAssets = ["libs/assets", "repo1/assets", ...];

// example
const mimeTypes = {
    '.acc': 'application/acc'
}

export default defineConfig({
    plugins: [
        DynamicPublicDirectory(dirAssets, {
            ssr: true,
            mimeTypes
        })
    ]
})
```

- Support Astro build (version 1.3.x above):
```javascript
import {astroMultipleAssets} from "vite-multiple-assets";
const assets = ["libs/assets", "repo1/assets", ...];
export default defineConfig({
    integrations: [
        astroMultipleAssets(assets)
    ],
});
```
* The above configuration will automatically add files in `public`, `libs/assets`, `repo1/assets` folders as static assets for your project, which can be understood as below:
 ```ts
 export default defineConfig({
    // default is public folder
    publicDir:["public","libs/assets","repo1/assets",...]
  })
```

### Example
- [React](https://github.com/nguyenbatranvan/vite-multiple-assets/blob/main/packages/examples/react/vite.config.ts)
- [Solid](https://github.com/nguyenbatranvan/vite-multiple-assets/blob/main/packages/examples/solid/vite.config.ts)
- [Astro](https://github.com/nguyenbatranvan/vite-multiple-assets/blob/main/packages/examples/astro/astro.config.mjs)
