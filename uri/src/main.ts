/* eslint-disable node/no-deprecated-api */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { exists, rmdir, readdir, mkdir, writeFile } from "@azure-tools/async-io";
import { dirname } from "path";
import * as getUri from "get-uri";

/***********************
 * Data aquisition
 ***********************/
import { Readable } from "stream";
import { parse } from "url";
import { sep, extname } from "path";

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

function getUriAsync(uri: string, options: { headers: { [key: string]: string } }): Promise<Readable> {
  // headers being passed is not described in the typing but does works.
  return getUri(uri, options as getUri.GetUriOptions);
}

/**
 * Loads a UTF8 string from given URI.
 */
export async function ReadUri(uri: string, headers: { [key: string]: string } = {}): Promise<string> {
  const actualUri = ToRawDataUrl(uri);
  const readable = await getUriAsync(actualUri, { headers: headers });

  const readAll = new Promise<Buffer>(function (resolve, reject) {
    let result = Buffer.alloc(0);
    readable.on("data", (data) => (result = Buffer.concat([result, data])));
    readable.on("end", () => resolve(result));
    readable.on("error", (err) => reject(err));
  });

  const result = await readAll;

  // make sure we can read 4 bytes into the file before trying to fix it!
  if (result.length > 3) {
    // fix up UTF16le files
    if (result.readUInt16LE(0) === 65533 && result.readUInt16LE(1) === 65533) {
      return stripBom(result.slice(2).toString("utf16le"));
    }
  }
  return stripBom(result.toString("utf8"));
}

export async function ExistsUri(uri: string): Promise<boolean> {
  try {
    await ReadUri(uri);
    return true;
  } catch (e) {
    return false;
  }
}

/***********************
 * OS abstraction (writing files, enumerating files)
 ***********************/

import { lstatSync } from "fs";
import { EnsureIsFolderUri, ResolveUri, ToRawDataUrl } from "./uri-manipulation";

function isAccessibleFile(localPath: string) {
  try {
    return lstatSync(localPath).isFile();
  } catch (e) {
    return false;
  }
}

function FileUriToLocalPath(fileUri: string): string {
  const uri = parse(fileUri);
  if (!fileUri.startsWith("file:///")) {
    throw new Error(
      `Cannot write data to '${fileUri}'. ` +
        (!fileUri.startsWith("file://")
          ? `Protocol '${uri.protocol}' not supported for writing.`
          : "UNC paths not supported for writing.") +
        " Make sure to specify a local, absolute path as target file/folder.",
    );
  }
  // convert to path
  let p = uri.path;
  if (p === undefined || p === null) {
    throw new Error(`Cannot write to '${uri}'. Path not found.`);
  }
  if (sep === "\\") {
    if (p.indexOf(":") > 0) {
      p = p.substr(p.startsWith("/") ? 1 : 0);
    }

    p = p.replace(/\//g, "\\");
  }
  return decodeURI(p);
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
  const uri = parse(fileUri);
  if (uri.protocol !== "file:") {
    throw `Protocol '${uri.protocol}' not supported for writing.`;
  }
  // convert to path
  let p = uri.path;
  if (p === undefined || p == null) {
    throw `Cannot write to '${uri}'. Path not found.`;
  }
  if (sep === "\\") {
    p = p.substr(p.startsWith("/") ? 1 : 0);
    p = p.replace(/\//g, "\\");
  }
  return p;
}

export function GetExtension(name: string) {
  const ext = extname(name);
  if (ext) {
    return ext.substr(1).toLowerCase();
  }
  return ext;
}
