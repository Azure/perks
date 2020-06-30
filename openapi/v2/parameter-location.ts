/** There are five possible parameter types. */
export enum ParameterLocation {
  /**  Parameters that are appended to the URL. For example, in /items?id=###, the query parameter is id. */
  Query = 'query',

  /** Custom headers that are expected as part of the request. */
  Header = 'header',

  /** Used to describe the payload of an HTTP request when either application/x-www-form-urlencoded, multipart/form-data or both are used as the content type of the request (in Swagger's definition, the consumes property of an operation). This is the only parameter type that can be used to send files, thus supporting the file type. Since form parameters are sent in the payload, they cannot be declared together with a body parameter for the same operation. */
  FormData = 'formData',

  /** The payload that's appended to the HTTP request. Since there can only be one payload, there can only be one body parameter. The name of the body parameter has no effect on the parameter itself and is used for documentation purposes only. Since Form parameters are also in the payload, body and form parameters cannot exist together for the same operation. */
  Body = 'body',

  /** Used together with Path Templating, where the parameter value is actually part of the operation's URL. This does not include the host or base path of the API. For example, in /items/{itemId}, the path parameter is itemId. */
  Path = 'path',
}