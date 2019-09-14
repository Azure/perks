import { XmlSerlializationFormat } from './formats/xml';

export interface Formats {
  json: any;
  xml: XmlSerlializationFormat;
  protobuf: any;
}
