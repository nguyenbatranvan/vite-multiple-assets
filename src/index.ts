import fs from "fs";
import path from "path";
import { PluginOption, ViteDevServer } from "vite";

function getFiles(dir, files_): string[] {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + "/" + files[i];
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

function getContentTypeImage(image: string) {
  const extensionImage = image.split(".").slice(-1)[0];
  switch (extensionImage) {
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/jpeg";
  }
}

export default function DynamicPublicDirectory(assets: string[]): PluginOption {
  return {
    apply: "serve",
    configureServer(server: ViteDevServer) {
      if (!assets || !assets.length)
        return;
      const fileObject: IPropsFile[] = [];
      for (let i = 0; i < assets.length; i++) {
        const files = getFiles(path.join(process.cwd(), `/${assets[i]}`), []);
        // const fileStr = file.join(",");
        fileObject.push({
          name: assets[i],
          files
        });
      }

      return () => {
        server.middlewares.use(async (req, res, next) => {
          for (let i = 0; i < fileObject.length; i++) {
            const file = path.join(process.cwd(), `${fileObject[i].name}/${req.originalUrl}`);
            if (fileObject[i].files.includes(file)) {
              res.setHeader("Cache-Control", "max-age=31536000, immutable");
              res.setHeader("Content-Type", getContentTypeImage(file));
              res.writeHead(200);
              res.write(fs.readFileSync(path.join(process.cwd(), "/" + fileObject[i].name + req.originalUrl)));
              res.end();
              break;
            }
          }
          // }
          next();
        });
      };
    },
    name: "dynamic assets"
  };
}
