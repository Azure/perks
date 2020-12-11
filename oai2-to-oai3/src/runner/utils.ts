import { DataHandle } from '@azure-tools/datastore';
import { OaiToOai3FileInput } from './oai2-to-oai3-runner';

export const loadInputFiles = async (inputFiles: DataHandle[]): Promise<OaiToOai3FileInput[]> => {
  const inputs: OaiToOai3FileInput[] = [];
  for (const file of inputFiles) {
    const schema = await file.ReadObject();
    inputs.push({ name: file.originalFullPath, schema });
  }
  return inputs;
};
