import { ObjectSchema, ChoiceSchema, DictionarySchema, ConstantSchema, ArraySchema, OrSchema, XorSchema, BooleanSchema, NumberSchema, StringSchema, DateSchema, DateTimeSchema, UnixTimeSchema, CredentialSchema, UriSchema, UuidSchema, DurationSchema, CharSchema, ByteArraySchema, ParameterGroupSchema, NotSchema, SealedChoiceSchema, FlagSchema, Schema, ComplexSchema, ValueSchema, ODataQuerySchema, BinarySchema } from './schema';
import { camelCase } from '@azure-tools/codegen';

/** the full set of schemas for a given service, categorized into convenient collections */
export interface Schemas {
  /** a collection of items */
  arrays?: Array<ArraySchema>;

  /** an associative array (ie, dictionary, hashtable, etc) */
  dictionaries?: Array<DictionarySchema>;

  /** a true or false value */
  booleans?: Array<BooleanSchema>;

  /** a number value */
  numbers?: Array<NumberSchema>;

  /** an object of some type */
  objects?: Array<ObjectSchema>;

  /** a string of characters  */
  strings: Array<StringSchema>;

  /** UnixTime */
  unixtimes?: Array<UnixTimeSchema>;

  /** ByteArray -- an array of bytes */
  byteArrays?: Array<ByteArraySchema>;

  /* a binary stream */
  streams?: Array<Schema>;

  /** a single character */
  chars?: Array<CharSchema>;

  /** a Date */
  dates?: Array<DateSchema>;

  /** a DateTime */
  dateTimes?: Array<DateTimeSchema>;

  /** a Duration */
  durations?: Array<DurationSchema>;

  /** a universally unique identifier  */
  uuids?: Array<UuidSchema>;

  /** an URI of some kind */
  uris?: Array<UriSchema>;

  /** a password or credential  */
  credentials?: Array<CredentialSchema>;

  /** OData Query */
  odataQueries?: Array<ODataQuerySchema>;

  /** a choice between one of several  values (ie, 'enum')
   * 
   * @description - this is essentially can be thought of as an 'enum' 
   * that is a choice between one of several strings
   */
  choices?: Array<ChoiceSchema>;

  sealedChoices?: Array<SealedChoiceSchema>;

  flags?: Array<FlagSchema>;

  /** a constant value */
  constants?: Array<ConstantSchema>;

  ors?: Array<OrSchema>;

  xors?: Array<XorSchema>;

  binaries?: Array<BinarySchema>;

  /** the type is not known.
   * 
   * @description it's possible that we just may make this an error 
   * in representation.
   */
  unknowns?: Array<Schema>;

  parameterGroups?: Array<ParameterGroupSchema>;
}

export class Schemas {
  add<T extends Schema>(schema: T): T {

    let group = `${camelCase(schema.type)}s`.replace(/rys$/g, 'ries');
    if (group === 'integers') {
      group = 'numbers';
    }

    const a: Array<Schema> = ((<any>this)[group] || ((<any>this)[group] = new Array<Schema>()));
    if (a.indexOf(schema) > -1) {
      throw new Error(`Duplicate ! ${schema.type} : ${schema.language.default.name}`);
      // return schema;
    } else {
      //console.error(`Adding ${schema.type} : ${schema.language.default.name}`);
    }
    a.push(schema);
    return schema;
  }

}