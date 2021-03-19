import * as getUri from "get-uri";
import { toRawDataUrl } from "./uri-manipulation";
import { Readable } from "stream";

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
 * @uri to load. Can be a remote url or a local file path(using file: protocol).
 */
export async function readUri(uri: string, headers: { [key: string]: string } = {}): Promise<string> {
  const actualUri = toRawDataUrl(uri);
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

export async function existsUri(uri: string): Promise<boolean> {
  try {
    await readUri(uri);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @deprecated use readUri instead
 */
export const ReadUri = readUri;

/**
 * @deprecated use existsUri instead
 */
export const ExistsUri = existsUri;
