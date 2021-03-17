/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { exists, rmdir, readdir, mkdir, writeFile } from "@azure-tools/async-io";
import { resolve as uriResolve, parse as uriParse } from "url";
import { homedir } from "os";

export function simplifyUri(uri: string) {
  return uriResolve(`${uriParse(uri).protocol}://`, uri);
}

export function IsUri(uri: string): boolean {
  return /^([a-z0-9+.-]+):(?:\/\/(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::(\d*))?(\/(?:[a-z0-9-._~!$&'()*+,;=:@/]|%[0-9A-F]{2})*)?|(\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@/]|%[0-9A-F]{2})*)?)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*))?$/i.test(
    uri,
  );
}

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

const getUri = require("get-uri");

function getUriAsync(uri: string, options: { headers: { [key: string]: string } }): Promise<Readable> {
  return new Promise((r, j) => getUri(uri, options, (err: any, rs: Readable) => (err ? j(err) : r(rs))));
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
 * URI manipulation
 ***********************/
import { dirname } from "path";
const URI = require("urijs");
const fileUri: (path: string, options: { resolve: boolean }) => string = require("file-url");

/**
 *  remake of path.isAbsolute... because it's platform dependent:
 * Windows: C:\\... -> true    /... -> true
 * Linux:   C:\\... -> false   /... -> true
 */
function isAbsolute(path: string): boolean {
  return !!path.match(/^([a-zA-Z]:)?(\/|\\)/);
}

/**
 * determines what an absolute URI is for our purposes, consider:
 * - we had Ruby try to use "Azure::ARM::SQL" as a file name, so that should not be considered absolute
 * - we want simple, easily predictable semantics
 */
function isUriAbsolute(url: string): boolean {
  return /^[a-z]+:\/\//.test(url);
}

/**
 * Create a 'file:///' URI from given absolute path.
 * Examples:
 * - "C:\swagger\storage.yaml" -> "file:///C:/swagger/storage.yaml"
 * - "/input/swagger.yaml" -> "file:///input/swagger.yaml"
 */
export function CreateFileOrFolderUri(absolutePath: string): string {
  if (!isAbsolute(absolutePath)) {
    throw new Error(`Can only create file URIs from absolute paths. Got '${absolutePath}'`);
  }
  let result = fileUri(absolutePath, { resolve: false });
  // handle UNCs
  if (absolutePath.startsWith("//") || absolutePath.startsWith("\\\\")) {
    result = result.replace(/^file:\/\/\/\//, "file://");
  }
  return result;
}

export function EnsureIsFileUri(uri: string): string {
  return uri.replace(/\/$/g, "");
}

export function EnsureIsFolderUri(uri: string): string {
  return EnsureIsFileUri(uri) + "/";
}
export function CreateFileUri(absolutePath: string): string {
  return EnsureIsFileUri(CreateFileOrFolderUri(absolutePath));
}
export function CreateFolderUri(absolutePath: string): string {
  return EnsureIsFolderUri(CreateFileOrFolderUri(absolutePath));
}

export function GetFilename(uri: string): string {
  return uri.split("/").reverse()[0].split("\\").reverse()[0];
}

export function GetFilenameWithoutExtension(uri: string): string {
  const lastPart = GetFilename(uri);
  const ext = lastPart.indexOf(".") === -1 ? "" : lastPart.split(".").reverse()[0];
  return lastPart.substr(0, lastPart.length - ext.length - 1);
}

export function ToRawDataUrl(uri: string): string {
  uri = simplifyUri(uri);

  // special URI handlers (the 'if's shouldn't be necessary but provide some additional isolation in case there is anything wrong with one of the regexes)
  // - GitHub repo
  if (uri.startsWith("https://github.com")) {
    uri = uri.replace(
      /^https?:\/\/(github.com)(\/[^\/]+\/[^\/]+\/)(blob|tree)\/(.*)$/gi,
      "https://raw.githubusercontent.com$2$4",
    );
  }
  // - GitHub gist
  if (uri.startsWith("gist://")) {
    uri = uri.replace(/^gist:\/\/([^\/]+\/[^\/]+)$/gi, "https://gist.githubusercontent.com/$1/raw/");
  }
  if (uri.startsWith("https://gist.github.com")) {
    uri = uri.replace(/^https?:\/\/gist.github.com\/([^\/]+\/[^\/]+)$/gi, "https://gist.githubusercontent.com/$1/raw/");
  }
  if (uri.startsWith("null://")) {
    uri = uri.substr(7);
  }

  return uri;
}

/**
 * The singularity of all resolving.
 * With URI as our one data type of truth, this method maps an absolute or relative path or URI to a URI using given base URI.
 * @param baseUri   Absolute base URI
 * @param pathOrUri Relative/absolute path/URI
 * @returns Absolute URI
 */
export function ResolveUri(baseUri: string, pathOrUri: string): string {
  if (pathOrUri.startsWith("~/")) {
    pathOrUri = pathOrUri.replace(/^~/, homedir());
  }
  if (isAbsolute(pathOrUri)) {
    return CreateFileOrFolderUri(pathOrUri);
  }

  // known here: `pathOrUri` is eiher URI (relative or absolute) or relative path - which we can normalize to a relative URI
  pathOrUri = pathOrUri.replace(/\\/g, "/");
  // known here: `pathOrUri` is a URI (relative or absolute)
  if (isUriAbsolute(pathOrUri)) {
    return pathOrUri;
  }
  // known here: `pathOrUri` is a relative URI
  if (!baseUri) {
    throw new Error("'pathOrUri' was detected to be relative so 'baseUri' is required");
  }
  try {
    const base = new URI(baseUri);
    const relative = new URI(pathOrUri);
    if (baseUri.startsWith("untitled:///") && pathOrUri.startsWith("untitled:")) {
      return pathOrUri;
    }
    const result = relative.absoluteTo(base);
    // GitHub simple token forwarding, for when you pass a URI to a private repo file with `?token=` query parameter.
    // this may be easier for quick testing than getting and passing an OAuth token.
    if (
      base.protocol() === "https" &&
      base.hostname() === "raw.githubusercontent.com" &&
      result.protocol() === "https" &&
      result.hostname() === "raw.githubusercontent.com"
    ) {
      result.query(base.query());
    }

    return simplifyUri(result.toString());
  } catch (e) {
    throw new Error(`Failed resolving '${pathOrUri}' against '${baseUri}'.`);
  }
}

export function ParentFolderUri(uri: string): string | null {
  // root?
  if (uri.endsWith("//")) {
    return null;
  }
  // folder? => cut away last "/"
  if (uri.endsWith("/")) {
    uri = uri.slice(0, uri.length - 1);
  }
  // cut away last component
  const compLen = uri.split("/").reverse()[0].length;
  return uri.slice(0, uri.length - compLen);
}

export function MakeRelativeUri(baseUri: string, absoluteUri: string): string {
  return new URI(absoluteUri).relativeTo(baseUri).toString();
}

/***********************
 * OS abstraction (writing files, enumerating files)
 ***********************/

import { lstatSync, unlinkSync, rmdirSync } from "fs";
import { url } from "inspector";

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
    } catch (e) {}
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
