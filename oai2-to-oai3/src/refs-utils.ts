import { ResolveReferenceFn } from "./runner";

export const oai3PathToSchema = (name: string) => `/components/schemas/${name}`;

export const oai3PathToParameter = (name: string) => `/components/parameters/${name}`;

export const cleanElementName = (name: string) => name.replace(/\$|\[|\]/g, "_");

/**
 * Convert a OpenAPI 2.0 $ref to its OpenAPI3.0 version.
 * @param oai2Ref OpenAPI 2.0 reference.
 * @param resolveReference Optional resolver for references pointing to a different file.
 * @param currentFile Current file to use with `resolveReference`
 */
export const convertOai2RefToOai3 = async (
  oai2Ref: string,
  resolveReference?: ResolveReferenceFn,
  currentFile?: string,
): Promise<string> => {
  const [file, path] = oai2Ref.split("#");

  if (file !== "" && file !== currentFile) {
    if (!resolveReference) {
      return `${file}#${convertOai2PathToOai3(path)}`;
    }

    const reference = await resolveReference(file, path);
    if (reference == undefined) {
      throw new Error(`Cannot find reference ${oai2Ref}`);
    }
    return `${file}#${reference.newRef}`;
  }
  return `#${convertOai2PathToOai3(path)}`;
};

const oai2PathMapping = {
  "/definitions/": "/components/schemas/",
  "/parameters/": "/components/parameters/",
  "/responses/": "/components/responses/",
};

export const convertOai2PathToOai3 = (path: string) => {
  const parsed = parseOai2Path(path);
  if (parsed === undefined) {
    throw new Error(`Cannot parse ref path ${path} it is not a supported ref pattern.`);
  }

  return `${oai2PathMapping[parsed.basePath]}${cleanElementName(parsed.componentName)}`;
};

export interface Oai2ParsedPath {
  basePath: keyof typeof oai2PathMapping;
  componentName: string;
}

export interface Oai2ParsedRef extends Oai2ParsedPath {
  file: string;
  path: string;
}

export enum OpenAPIComponentTypes {
  Schemas,
  Parameters,
  Responses,
}

/**
 * Extract the component name and base path of a reference path.
 * @exampe
 *  parseOai2Path("/parameters/Foo") -> {basePath: "/parameters/", componentName: "Foo"}
 *  parseOai2Path("/definitions/Foo") -> {basePath: "/definitions/", componentName: "Foo"}
 */
export const parseOai2Path = (path: string): Oai2ParsedPath | undefined => {
  for (const oai2Path of Object.keys(oai2PathMapping)) {
    if (path.startsWith(oai2Path)) {
      return {
        basePath: oai2Path as keyof typeof oai2PathMapping,
        componentName: path.slice(oai2Path.length),
      };
    }
  }
  return undefined;
};

export const parseOai2Ref = (oai2Ref: string): Oai2ParsedRef | undefined => {
  const [file, path] = oai2Ref.split("#");
  const parsedPath = parseOai2Path(path);
  if (parsedPath === undefined) {
    return undefined;
  }
  return {
    file,
    path,
    ...parsedPath,
  };
};
