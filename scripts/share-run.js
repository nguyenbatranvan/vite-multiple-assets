import { spawnd } from "spawnd";

const args = process.argv.filter((item) => !item.includes("/"));
const projectName = args[0];
const opts = args.slice(1, args.length);

function shareRun(mode) {
    runScripts(mode, " --filter=" + projectName);
}

function runScripts(mode, projects) {
    let process;
    if (!args || !args.length) {
        process = spawnd("turbo", [mode, opts], {
            shell: true,
            stdio: "inherit"
        });
    } else {
        process = spawnd("turbo", [mode, projects, opts], {
            shell: true,
            stdio: "inherit"
        });
    }
    process.on('error', (code) => {
        console.error(`Process error with code ${code}`);
        process.exit(code);
    });
    process.on('close', (code) => {
        if (code !== 0) {
            console.error(`Process exited with code ${code}`);
            process.exit(code);
        }
    });
}

module.exports = {
    shareRun
};
