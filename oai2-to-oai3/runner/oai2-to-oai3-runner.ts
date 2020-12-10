import { DataHandle } from "@azure-tools/datastore";
import { CrossFileReferenceTracker } from "./reference-tracker";
import { loadInputFiles } from "./utils";

export interface OaiToOai3FileInput {
  name: string;
  schema: any; // OAI2 type?
}

export const convertOai2ToOai3Files = async (inputFiles: DataHandle[]) => {
  const files = await loadInputFiles(inputFiles);
  const map = new Map<string, OaiToOai3FileInput>();
  for (const file of files) {
    map.set(file.name, file);
  }
  return convertOai2ToOai3(map);
};

export const convertOai2ToOai3 = async (inputs: Map<string, OaiToOai3FileInput>) => {
  const referenceTracker = new CrossFileReferenceTracker([...inputs.keys()]);
  const resolvingFiles = new Set<string>();
  const completedFiles = new Set<string>();

  const resolveReference: ResolveReferenceFn = async (
    targetfile: string,
    reference: string,
  ): Promise<string | undefined> => {
    const tracker = referenceTracker.getForFile(targetfile);
    const file = inputs.get(targetfile);
    if (file === undefined || tracker === undefined) {
      throw new Error(`Ref file ${targetfile} doesn't exists.`);
    }

    if (!completedFiles.has(targetfile)) {
      await computeFile(file);
    }
    return tracker.getReference(reference)?.newRef;
  };

  const computeFile = async (input: OaiToOai3FileInput) => {
    if (resolvingFiles.has(input.name)) {
      // Todo better circular dep findings
      throw new Error(`Circular dependency with file ${input.name}`);
    }
    resolvingFiles.add(input.name);

    const addMapping: AddMappingFn = (oldRef: string, newRef: string) => {
      const tracker = referenceTracker.getForFile(input.name);
      if (tracker === undefined) {
        throw new Error(`Unexpected error, this should never have happened.`);
      }
      tracker.addReference(oldRef, newRef);
    };
    const result = await convertOai2ToOai3Schema(input, addMapping, resolveReference);
    completedFiles.add(input.name);
    return result;
  };

  for (const input of Object.values(inputs)) {
    if (completedFiles.has(input.name)) {
      continue;
    }
    const result = await computeFile(input);
  }
};

/**
 * Callback to resolve a reference.
 */
export type AddMappingFn = (oldRef: string, newRef: string) => void;
export type ResolveReferenceFn = (targetfile: string, reference: string) => Promise<string | undefined>;

export const convertOai2ToOai3Schema = async (
  { name, schema }: OaiToOai3FileInput,
  addMapping: AddMappingFn,
  resolveReference: ResolveReferenceFn,
) => {};
