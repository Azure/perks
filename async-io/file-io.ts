/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Exception, OutstandingTaskAwaiter, promisify } from '@azure-tools/tasks';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath, Url, URL } from 'url';

export class PathNotFoundException extends Exception {
  constructor(path: string, public exitCode: number = 1) {
    super(`File '${path}' not found.`, exitCode);
    Object.setPrototypeOf(this, PathNotFoundException.prototype);
  }
}

export class PathIsNotFileException extends Exception {
  constructor(path: string, public exitCode: number = 1) {
    super(`File '${path}' is not a file.`, exitCode);
    Object.setPrototypeOf(this, PathIsNotFileException.prototype);
  }
}

export class PathIsNotDirectoryException extends Exception {
  constructor(path: string, public exitCode: number = 1) {
    super(`File '${path}' is not a directory.`, exitCode);
    Object.setPrototypeOf(this, PathIsNotFileException.prototype);
  }
}

export class UnableToRemoveException extends Exception {
  constructor(path: string, public exitCode: number = 1) {
    super(`Unable to remove '${path}'.`, exitCode);
    Object.setPrototypeOf(this, UnableToRemoveException.prototype);
  }
}

export class UnableToMakeDirectoryException extends Exception {
  constructor(path: string, public exitCode: number = 1) {
    super(`Unable to create directory '${path}'.`, exitCode);
    Object.setPrototypeOf(this, UnableToMakeDirectoryException.prototype);
  }
}
export function filePath(path: string | Buffer | Url | URL): string {
  path = path.toString();
  return path.startsWith('file:///') ? fileURLToPath(path) : path;
}
export const exists = promisify(fs.exists);
export const readdir: (path: string | Buffer) => Promise<Array<string>> = promisify(fs.readdir);
export const close: (fd: number) => Promise<void> = promisify(fs.close);

export const writeFile: (filename: string, content: string | Buffer) => Promise<void> = promisify(fs.writeFile);
export const lstat: (path: string | Buffer) => Promise<fs.Stats> = promisify(fs.lstat);

const rmdirInternal: (path: string | Buffer) => Promise<void> = promisify(fs.rmdir);
const unlinkInternal: (path: string | Buffer) => Promise<void> = promisify(fs.unlink);
const mkdirInternal: (path: string | Buffer) => Promise<void> = promisify(fs.mkdir);
const openInternal: (path: string | Buffer, flags: string | number) => Promise<number> = promisify(fs.open);
const closeInternal: (fs: number) => Promise<void> = promisify(fs.close);

export async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    if (await exists(dirPath)) {
      return (await lstat(dirPath)).isDirectory();
    }
  } catch (e) {
    // don't throw!
  }
  return false;
}

export async function mkdir(dirPath: string) {
  if (!await isDirectory(dirPath)) {
    const p = path.normalize(dirPath + '/');
    const parent = path.dirname(dirPath);
    if (! await isDirectory(parent)) {
      if (p != parent) {
        await mkdir(parent);
      }
    }
    try {
      await mkdirInternal(p);
    } catch (e) {
      if (!await isDirectory(p)) {
        throw new UnableToMakeDirectoryException(p);
      }
    }
  }
}

const readFileInternal: (filename: string, encoding: string, ) => Promise<string> = promisify(fs.readFile);

export async function readFile(filename: string): Promise<string> {
  return readFileInternal(filename, 'utf-8');
}

export async function readBinaryFile(filename: string): Promise<string> {
  return readFileInternal(filename, 'base64');
}

export async function isFile(filePath: string): Promise<boolean> {
  try {
    return await exists(filePath) && !await isDirectory(filePath);
  } catch (e) {
    // don't throw!
  }
  return false;
}

export async function rmdir(dirPath: string, exceptions?: Set<string>) {
  // if it's not there, do nothing.
  if (!await exists(dirPath)) {
    return;
  }
  exceptions = exceptions || new Set();

  // if it's not a directory, that's bad.
  if (!await isDirectory(dirPath)) {
    throw new PathIsNotDirectoryException(dirPath);
  }

  // make sure this isn't the current directory.
  if (process.cwd() === path.normalize(dirPath)) {
    process.chdir(`${dirPath}/..`);
  }

  // make sure the folder is empty first.
  const files = await readdir(dirPath);
  if (files.length) {
    const awaiter = new OutstandingTaskAwaiter();
    try {
      for (const file of files) {
        try {
          const p = path.join(dirPath, file);
          if (exceptions.has(p.toLowerCase())) {
            continue;
          }

          if (await isDirectory(p)) {
            // folders are recursively rmdir'd
            awaiter.Await(rmdir(p, exceptions));
          } else {
            // files and symlinks are unlink'd
            awaiter.Await(unlinkInternal(p).catch(() => { }));
          }
        } catch (e) {
          // uh... can't.. ok.
        }

      }
    } finally {
      // after all the entries are done
      await awaiter.Wait();
    }
  }
  try {
    // if this fails for some reason, check if it's important.
    await rmdirInternal(dirPath);
  } catch (e) {
    // is it gone? that's all we really care about.
    if (await isDirectory(dirPath)) {
      // directory did not delete
      //throw new UnableToRemoveException(dirPath);
    }
  }
}

export async function rmFile(filePath: string) {
  // not there? no problem
  if (!exists(filePath)) {
    return;
  }

  // not a file? that's not cool.
  if (await isDirectory(filePath)) {
    throw new PathIsNotFileException(filePath);
  }

  try {
    // files and symlinks are unlink'd
    await unlinkInternal(filePath);
  } catch (e) {
    // is it gone? that's all we really care about.
    if (await exists(filePath)) {
      // directory did not delete
      throw new UnableToRemoveException(filePath);
    }
  }
}
