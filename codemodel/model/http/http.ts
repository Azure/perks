import { SerializationStyle } from './SerializationStyle';
import { HttpMethod } from './HttpMethod';
import { ParameterLocation } from './ParameterLocation';
import { Protocol, ImplementationLocation, Language } from '../common/metadata';
import { StatusCode } from './status-code';
import { Server } from './server';
import { SecurityRequirement } from './security';

export interface ParameterMetadata extends Protocol {
  in: ParameterLocation;
  style: SerializationStyle;
  allowReserved?: boolean;
  implementation: ImplementationLocation;
}

export interface OperationMetadata extends Protocol {
  path: string;
  baseUrl: string;
  method: HttpMethod;
}

export interface ResponseMetadata extends Protocol {
  statusCodes: Array<StatusCode>; // oai3 supported options.
  mediaTypes: Array<string>; // the response mediaTypes that this should apply to (ie, 'application/json')
}

export interface ModelMetadata extends Protocol {
  servers: Array<Server>;
  security?: Array<SecurityRequirement>;
}

