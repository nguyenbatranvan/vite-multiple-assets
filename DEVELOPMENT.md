## Notes
### 2024-04-03
- using `fast-glob` and `micromatch` for extending functionality
- at first, planned to using `glob`
- `fast-glob` always using posix seperator, forward slash `/`;
  - there is no need to force replace win32 seperator to posix
- force `fast-glob` to disable `absolute`
- using `path/posix` instead of `path`
- ~need fixing to handle `../`, absolute `/etc/wwwroot` path~
  - ~right now, it is ignored and in server it either use~
  - ~`/%2Fetc/wwwroot` or `/C:/Windows/` for absolute, or~
  - ~`/%2E%2E/%2E%2E/backward/file` for `../../backward/file`~
  - These all are intended and would go to same `outDir` without rerouting to anywhere else
  - ~Also there is no~ need to handle `./dir1/dir2/**`. It cannot match on `destinationResolver`.
- No need to fix `destinationResolver` base as user can also scanning from root or backward
- Because error in building library, `tsup` would be changed to ~`rollup`, and monorepo would change `npm` to `yarn`~
  - ~[Troubleshooting | Rollup](https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency)~
  - ~[Configuration Options | Rollup](https://rollupjs.org/configuration-options/#output-globals)~
  - ~[Configuration Options | Rollup](https://rollupjs.org/configuration-options/#output-exports)~
- ~After invastigation, [`glob`](https://www.npmjs.com/package/glob?activeTab=code), `tsup` would be change to [`tshy`](https://www.npmjs.com/package/tshy)~
- VSCode: use extension Comment Anchors
- recommended to move to v2.0.0
- https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names

**Current Issues:**

- Performance on Server Rendering
- File patterns is only `string[]`, planned so can have individual pattern to output files
- `internalResolver` can overidden so a lot of filename and its situation can collapse
