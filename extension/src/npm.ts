import { ChildProcess, spawn, SpawnOptions } from "child_process";
import { resolve } from "path";

const DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org";

const getPathToNpmCli = () => {
  return resolve(`${__dirname}/../../node_modules/npm/bin/npm-cli.js`);
};

export const npm = async (cwd: string, ...args: string[]) => {
  const procArgs = [
    getPathToNpmCli(),
    "--no-shrinkwrap",
    "--registry",
    process.env.autorest_registry || DEFAULT_NPM_REGISTRY,
    ...args,
  ];
  console.error("Args used", procArgs);
  return await execute(process.execPath, procArgs, { cwd });
};

interface MoreOptions extends SpawnOptions {
  onCreate?(cp: ChildProcess): void;
  onStdOutData?(chunk: any): void;
  onStdErrData?(chunk: any): void;
}

const execute = (
  command: string,
  cmdlineargs: Array<string>,
  options: MoreOptions
): Promise<{
  stdout: string;
  stderr: string;
  error: Error | null;
  code: number;
}> => {
  return new Promise((r, j) => {
    const cp = spawn(command, cmdlineargs, { ...options, stdio: "pipe" });
    if (options.onCreate) {
      options.onCreate(cp);
    }

    options.onStdOutData ? cp.stdout.on("data", options.onStdOutData) : cp;
    options.onStdErrData ? cp.stderr.on("data", options.onStdErrData) : cp;

    let err = "";
    let out = "";
    cp.stderr.on("data", (chunk) => {
      err += chunk;
    });
    cp.stdout.on("data", (chunk) => {
      out += chunk;
    });
    cp.on("close", (code, signal) =>
      r({
        stdout: out,
        stderr: err,
        error: code ? new Error("Process Failed.") : null,
        code,
      })
    );
  });
};
