import fs from "fs";
import path from "path";
import {PluginOption, ViteDevServer} from "vite";

function getFiles(dir, files_): string[] {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

interface IPropsFile {
  name: string;
  files: string[];
}

export default function DynamicPublicDirectory(assets: string[]): PluginOption {
  return {
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      if (!assets || !assets.length)
        return
      const fileObject: IPropsFile[] = [];
      for (let i = 0; i < assets.length; i++) {
        const files = getFiles(path.join(process.cwd(), `/${assets[i]}`), []);
        // const fileStr = file.join(",");
        fileObject.push({
          name: assets[i],
          files
        })
      }

      return () => {
        server.middlewares.use(async (req, res, next) => {

          // console.log('a',req.originalUrl)
          // if (req.originalUrl?.includes('assets/') || req.originalUrl.includes("locales/")) {
          // const splits = req.originalUrl.split("assets");
          for (let i = 0; i < fileObject.length; i++) {
            if (fileObject[i].files.includes(path.join(process.cwd(), `${fileObject[i].name}/${req.originalUrl}`))) {
              res.setHeader('Cache-Control', 'max-age=31536000, immutable')
              res.writeHead(200);
              res.write(fs.readFileSync(path.join(process.cwd(), '/' + fileObject[i].name + req.originalUrl)));
              res.end();
              break;
            }
          }
          // }
          next();
        });
      };
    },
    name: 'dynamic assets',
  };
}
