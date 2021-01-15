import { OpenAPI2Definition, OpenAPI2Reference } from "./definition";

/**
 * Custom http method verb for autorest.
 */
export type HttpMethodCustom = "x-trace";

export type HttpMethod = "get" | "post" | "patch" | "put" | "delete" | "options" | "head" | "trace";

export type OpenAPI2Path = {
  [method in HttpMethod]: OpenAPI2Path;
} & {
  parameters: any[];
};

export interface OpenAPI2Operation {
  operationId: string;
  description: string;
  responses: OpenAPI2OperationResponses;
  parameters?: any[];
  produces?: string[];
  consumes?: string[];
}

export type OpenAPI2OperationResponses = { [statusCode: string]: OpenAPI2OperationResponse };

export interface OpenAPI2OperationResponse {
  description: string;
  schema?: OpenAPI2Definition;
  examples?: { [exampleName: string]: unknown };
  headers?: { [headerName: string]: OpenAPI2Header };
}

export type OpenAPI2Header = OpenAPI2Reference & OpenAPI2HeaderDefinition;

export interface OpenAPI2HeaderDefinition {
  type: "string" | "number" | "integer" | "boolean" | "array";
  schema: OpenAPI2Reference & OpenAPI2Definition;
  description: string;
  items: any;
  collectionFormat: "csv" | "ssv" | "tsv" | "pipes" | "multi";
}