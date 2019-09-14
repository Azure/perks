import { XmlSerlializationFormat } from './formats/xml';
import { SerializationFormat } from './schema';

/** custom extensible metadata for individual serialization formats */
export interface SerializationFormats<T extends SerializationFormat = SerializationFormat> {
  [key: string]: T | undefined | unknown;
  json?: T;
  xml?: XmlSerlializationFormat;
  protobuf?: T;
}
