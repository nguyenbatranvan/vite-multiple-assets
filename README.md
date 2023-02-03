# vite-multiple-assets

### install
``npm i -D vite-multiple-assets``

Quick setup (with comlink included) would be in the `vite.config.js`:
```ts
import DynamicPublicDirectory from "vite-multiple-assets";
export default {
    plugins: [
        DynamicPublicDirectory(["libs/assets","repo1/assets",...])
    ]
}
```
