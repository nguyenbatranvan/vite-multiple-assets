const {spawn} = require("node:child_process");
const fs = require("node:fs");
const {join} = require("path");

const args = process.argv.filter((item) => !item.includes("/"));
const projectName = args[0];
const opts = args.slice(1, args.length);
// const filePath = join(process.cwd(), "apps/" + projectName + "/remote.json");

// function fastReadFileSyncsToArray(filePath) {
//     return JSON.parse(fs.readFileSync(filePath));
// }

function shareRun(mode) {
    runScripts(mode, " --filter=" + projectName);
}

function runScripts(mode, projects) {
    if (!args || !args.length) {
        spawn("turbo", [mode, opts], {
            shell: true,
            stdio: "inherit"
        });
    } else {
        spawn("turbo", [mode, projects, opts], {
            shell: true,
            stdio: "inherit"
        });
    }
}

module.exports = {
    shareRun
};
