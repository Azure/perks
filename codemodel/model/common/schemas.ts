import { PrimitiveSchemaTypes, CompoundSchemaTypes } from './schema-type';
import { ObjectSchema, ChoiceSchema, DictionarySchema, ConstantSchema, ArraySchema } from './schema';

export interface Schemas {
  objects?: Array<ObjectSchema>;
  compounds?: Array<CompoundSchemaTypes>;
  choices?: Array<ChoiceSchema>; // enums (selection?)
  dictionaries?: Array<DictionarySchema>;
  constants?: Array<ConstantSchema>;
  primitives?: Array<PrimitiveSchemaTypes | ArraySchema>;
}