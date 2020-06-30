/**
 * @description The location of the parameter.
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#user-content-parameterIn
 */
export enum ParameterLocation {
  Query = 'query',
  Header = 'header',
  Cookie = 'cookie',
  Path = 'path',
}