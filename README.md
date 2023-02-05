# vite-multiple-assets
`vite-multiple-assets` support vite to run with multiple directory assets in development environment.
### Feature
- No copy file when run dev, help with no impact on performance when launching apps with vite
> **Note**
> This plugin only works in development environment, so when you build, you have to use another plugin to copy it into your build directory.
> I have a suggestion for a plugin when building you can refer to it as ``vite-plugin-static-copy``

Quick setup would be in the `vite.config.js`:
### install
``npm i -D vite-multiple-assets``

```ts
import DynamicPublicDirectory from "vite-multiple-assets";
// same level as project root
const dirAssets=["libs/assets","repo1/assets",...];
export default {
    plugins: [
        DynamicPublicDirectory(dirAssets)
    ]
}
```
