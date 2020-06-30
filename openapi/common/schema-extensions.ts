import { Parameter as v2Parameter } from '../v2/parameters';
import { Parameter as v3Parameter } from '../v3/parameters';
import { Dictionary, JsonPointer, JsonReference } from './common';
/** 
 * Well-known extensions that are found on Schema declarations 
 */
export interface SchemaExtensions extends XMSClientName, XMSClientFlatten, XMSDiscriminatorValue, XMSExternal, XMSMutability, XMSAzureResource {
  /** Extended Enum/Contant defnition */
  'x-ms-enum'?: XMSEnum;

  /**
   * determines if the value for the schema is able to be null
   */
  'x-nullable'?: boolean;
}

/** 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-enum
 */
export interface XMSEnum {
  /** Specifies the name for the Enum */
  name?: string;

  /** 
   * When set to true the enum will be modeled as a string. No validation will
   * happen. When set to false, it will be modeled as an enum if that language
   * supports enums. Validation will happen, irrespective of support of enums in
   * that language.
   * 
   * This can be thought of as "Not Sealed"
   */
  modelAsString?: boolean;

  /**
   * When set, this will override the values specified with `enum` while also
   * enabling further customization.
   */
  values?: Array<XMSEnumValue>;
}

/** 
 * Values in an XMSEnum declaration.
 */
export interface XMSEnumValue {
  /** the actual wire value for the enum */
  value: any;

  /** The text description of the wire value */
  description?: string;

  /** a desired name for the enum value (affects code generation, not wire serialization)  */
  name?: string;
}

/**
 * Schema for an x-ms-skip-url-encoding
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-skip-url-encoding
 */
export interface XMSSkipUrlEncoding {
  /** Mark parameters where the source is KNOWN to be URL-encoded to prevent the automatic encoding behavior */
  'x-ms-skip-url-encoding'?: boolean;
}

/**
 * Schema for an x-ms-parameter-grouping extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-grouping
 */
export interface XMSParameterGrouping {
  'x-ms-parameter-grouping'?: ParameterGroup;
}

export interface ParameterGroup {
  /** 
   * When set, specifies the name for the composite type. 
   */
  name?: string;

  /**
   * Alternative to name parameter. If specified the name of the composite type will be generated as follows {MethodGroup}{Method}{Postfix}.
   */
  postfix?: string;
}

/**
 * Schema for the x-ms-parameter-location extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameter-location
 */
export interface XMSParameterLocation {
  /**
   * Determines if the parameter in generated code should be at the client (global) level or included in the method.
   */
  'x-ms-parameter-location'?: 'client' | 'method';
}

/**
 * Schema for the x-ms-client name extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-client-name
 */
export interface XMSClientName {
  /**
   * By using the 'x-ms-client-name' extension, a name can be defined for use specifically in code generation, separately from the name on the wire. It can be used for query parameters and header parameters, as well as properties of schemas.
   */
  'x-ms-client-name'?: string;
}

/**
 * Schema for the x-ms-client-request-id extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-client-request-id
 */
export interface XMSClientRequestId {
  /**
   * When set, specifies the header parameter to be used instead of x-ms-client-request-id (default is x-ms-client-request-id).
   */
  'x-ms-client-request-id'?: string;
}


/**
 * Schema for the x-ms-request-id  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-request-id
 */
export interface XMSRequestId {
  /**
   * When set, allows to overwrite the x-ms-request-id response header (default is x-ms-request-id).
   */
  'x-ms-request-id'?: string;
}

/**
 * Schema for the x-ms-azure-resource  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-azure-resource
 */
export interface XMSAzureResource {
  /**
   * marks a schema as an Azure Resource
   */
  'x-ms-azure-resource'?: boolean;
}

/**
 * Schema for the x-ms-long-running-operation-options  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-long-running-operation
 */
export interface XMSLongRunningOperation {
  /**
   * Options for the ARM long running operations
   */
  'x-ms-long-running-operation-options'?: LROOptions;
}

export interface LROOptions {
  /**
   * azure-async-operation - (default if not specified) poll until terminal state, the final response will be available at the uri pointed to by the header Azure-AsyncOperation
   * location - poll until terminal state, the final response will be available at the uri pointed to by the header Location
   * original-uri - poll until terminal state, the final response will be available via GET at the original resource URI. Very common for PUT operations.
   */
  'final-state-via': 'azure-async-operation' | 'location' | 'original-uri';
}

/**
 * Schema for the x-ms-long-running-operation  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-long-running-operation
 */
export interface XMSLongRunningOperation {
  /**
   * determines if the operation should be an ARM long running operation
   */
  'x-ms-long-running-operation'?: boolean;
}

/**
 * Schema for the x-ms-pageable  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-pageable
 */
export interface XMSPageable {
  /**
   * 
   */
  'x-ms-pageable'?: Pageable;
}

export interface Pageable {
  /**
   * (default: value). Specifies the name of the property that provides the collection of pageable items.
   */
  itemName?: string;

  /**
   * Specifies the name of the property that provides the next link (common: nextLink). If the model does not have a next link property then specify null. This is useful for services that return an object that has an array referenced by itemName. The object is then flattened in a way that the array is directly returned, no paging is used. This provides a better client side API to the end user.
   */
  nextLinkName: string | null;

  /**
   * (default: <operationName>Next). Specifies the name of the operation for retrieving the next page.
   */
  operationName?: string;
}

/**
 * Schema for the x-ms-odata  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-odata
 */
export interface XMSOData {
  /**
   * When present the x-ms-odata extensions indicates the operation includes one or more OData query parameters. These parameters include $filter, $top, $orderby, $skip, and $expand. In some languages the generated method will expose these parameters as strongly types OData type.
   */
  'x-ms-odata'?: JsonPointer;
}

/**
 * Schema for the x-ms-error-response  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-error-response
 */
export interface XMSErrorResponse {
  /**
   * Indicates whether the response status code should be treated as an error response or not.
   */
  'x-ms-error-response'?: boolean;
}

/**
 * Schema for the x-ms-examples  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-examples
 * @see https://github.com/Azure/azure-rest-api-specs/blob/master/documentation/x-ms-examples.md
 */
export interface XMSExamples {
  /**
   * Describes the format for specifying examples for request and response of an operation in an OpenAPI definition. It is a dictionary of different variations of the examples for a given operation.
   */
  'x-ms-examples'?: Dictionary<JsonReference<any>>;
}

/**
 * Schema for the x-ms-mutability  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-mutability
 */
export interface XMSMutability {
  /**
   * This extension offers insight to Autorest on how to generate code (mutability of the property of the model classes being generated). It doesn't alter the modeling of the actual payload that is sent on the wire.
   */
  'x-ms-mutability'?: Array<'create' | 'read' | 'update'>;
}

/**
 * Schema for the x-ms-parameterized-host  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-parameterized-host
 */
export interface XMSParameterizedHost {
  /**
   * When used, replaces the standard OpenAPI "host" attribute with a host that contains variables to be replaced as part of method execution or client construction, very similar to how path parameters work.
   */
  'x-ms-parameterized-host'?: ParameterizedHost;
}

export interface ParameterizedHost {
  /**
   * Specifies the parameterized template for the host.
   */
  hostTemplate: string;

  /**
   * Specifies whether to prepend the default scheme a.k.a protocol to the base uri of client. (defaults to 'true')
   */
  useSchemePrefix?: boolean;

  /**
   * Specifies whether the list of parameters will appear in the beginning or in the end, in the method signature for every operation.
   */
  positionInOperation?: 'first' | 'last';

  /**
   * The list of parameters that are used within the hostTemplate. This can include both reference parameters as well as explicit parameters. Note that "in" is required and must be set to "path". The reference parameters will be treated as global parameters and will end up as property of the client.
   */
  parameters: Array<v2Parameter | v3Parameter>;
}

/**
 * Schema for the x-ms-client-flatten  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-client-flatten
 */
export interface XMSClientFlatten {
  /**
   * 
   */
  'x-ms-client-flatten'?: boolean;
}

/**
 * Schema for the x-ms-discriminator-value  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-discriminator-value
 */
export interface XMSDiscriminatorValue {
  /**
   * 
   */
  'x-ms-discriminator-value'?: string;
}

/**
 * Schema for the x-ms-external  extension
 * 
 * @see https://github.com/Azure/autorest/tree/master/docs/extensions#x-ms-external
 */
export interface XMSExternal {
  /**
   * To allow generated clients to share models via shared libraries an x-ms-external extension was introduced
   */
  'x-ms-external'?: boolean;
}
