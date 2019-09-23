import { Schema, SchemaDefinition, Type, DEFAULT_SAFE_SCHEMA } from 'js-yaml';

import { CodeModel } from './common/code-model';
import { Metadata } from './common/metadata';

export const codeModelSchema = Schema.create(DEFAULT_SAFE_SCHEMA, [
  new Type('!CodeModel', <TypeConstructorOptions>{
    kind: 'mapping',
    predicate: CodeModel.is,
    represent: each => each,
    // instanceOf: CodeModel, // uses instanceof to identify 




  }),
  new Type('!Metadata', <TypeConstructorOptions>{
    kind: 'mapping',
    predicate: Metadata.is,
    represent: each => each,
    //instanceOf: Metadata
  })
]);

codeModelSchema


declare interface TypeConstructorOptions {
  /** what kind of a definition is this  */
  kind?: 'sequence' | 'scalar' | 'mapping';

  /** deserialization/, if you don't know what the data type is, this lets you programatically guess via shape */
  resolve?: (data: any) => boolean;

  /** deserialization/ this lets you construct the type from the given data */
  construct?: (data: any) => any;

  /** serialization/ this would let it choose the 'type' based on class. derrived types should be before parent types  */
  instanceOf?: object;

  /** seralization/ this would let it choose the 'type' based on shape */
  predicate?: (data: object) => boolean;

  /** serialization/ this is the serializer    */
  represent?: ((data: object) => any) | { [x: string]: (data: object) => any };

  /** formatting style default  */
  defaultStyle?: string;

  /** formatting style options */
  styleAliases?: { [x: string]: any; };
}

