/* eslint-disable node/no-deprecated-api */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { exists, rmdir, readdir, mkdir, writeFile } from "@azure-tools/async-io";
import { dirname, extname } from "path";
import { lstatSync } from "fs";
import { EnsureIsFolderUri, ResolveUri } from "./uri-manipulation";
import { fileURLToPath } from "url";
import { ExistsUri } from "./data-acquisition";

/***********************
 * OS abstraction (writing files, enumerating files)
 ***********************/

function isAccessibleFile(localPath: string) {
  try {
    return lstatSync(localPath).isFile();
  } catch (e) {
    return false;
  }
}

function FileUriToLocalPath(fileUri: string): string {
  if (!fileUri.startsWith("file:///")) {
    throw new Error(
      `Cannot write data to '${fileUri}'. ` +
        (!fileUri.startsWith("file://")
          ? `File protocol '${fileUri}' not supported for writing.`
          : "UNC paths not supported for writing.") +
        " Make sure to specify a local, absolute path as target file/folder.",
    );
  }

  return decodeURI(fileURLToPath(fileUri));
}

export async function EnumerateFiles(folderUri: string, probeFiles: Array<string> = []): Promise<Array<string>> {
  const results = new Array<string>();
  folderUri = EnsureIsFolderUri(folderUri);
  if (folderUri.startsWith("file:")) {
    let files: Array<string> = [];
    try {
      files = await readdir(FileUriToLocalPath(folderUri));
    } catch (e) {
      // noop
    }
    results.push(...files.map((f) => ResolveUri(folderUri, f)).filter((f) => isAccessibleFile(FileUriToLocalPath(f))));
  } else {
    for (const candid of probeFiles.map((f) => ResolveUri(folderUri, f))) {
      if (await ExistsUri(candid)) {
        results.push(candid);
      }
    }
  }
  return results;
}

async function CreateDirectoryFor(filePath: string): Promise<void> {
  const dir: string = dirname(filePath);
  if (!(await exists(dir))) {
    await CreateDirectoryFor(dir);
    try {
      await mkdir(dir);
    } catch (e) {
      // mkdir throws if directory already exists - which happens occasionally due to race conditions
    }
  }
}

async function WriteDataInternal(fileName: string, data: string | Buffer): Promise<void> {
  await CreateDirectoryFor(fileName);
  await writeFile(fileName, data);
}

/**
 * Writes string to local file system.
 * @param fileUri  Target file uri.
 * @param data     String to write (encoding: UTF8).
 */
export function WriteString(fileUri: string, data: string): Promise<void> {
  return WriteDataInternal(FileUriToLocalPath(fileUri), data);
}

/**
 * Writes binary to local file system.
 * @param fileUri  Target file uri.
 * @param data     String to write (encoding - base64 encoded UTF8).
 */
export function WriteBinary(fileUri: string, data: string): Promise<void> {
  return WriteDataInternal(FileUriToLocalPath(fileUri), Buffer.from(data, "base64"));
}

/**
 * Clears a folder on the local file system.
 * @param folderUri  Folder uri.
 */

export async function ClearFolder(folderUri: string, exceptions?: Array<string>): Promise<void> {
  return await rmdir(
    FileUriToLocalPath(folderUri),
    new Set((exceptions || []).map((each) => FileUriToLocalPath(each).toLowerCase())),
  );
}

export function FileUriToPath(fileUri: string): string {
  return fileURLToPath(fileUri);
}

export function GetExtension(name: string) {
  const ext = extname(name);
  if (ext) {
    return ext.substr(1).toLowerCase();
  }
  return ext;
}
