import { SpawnOptions, ChildProcess, spawn } from "child_process";

interface MoreOptions extends SpawnOptions {
  onCreate?(cp: ChildProcess): void;
  onStdOutData?(chunk: any): void;
  onStdErrData?(chunk: any): void;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  error: Error | null;
  code: number;
}

export const execute = (
  command: string,
  cmdlineargs: Array<string>,
  options: MoreOptions
): Promise<ExecResult> => {
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
