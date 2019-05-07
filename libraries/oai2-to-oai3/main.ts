import { createGraphProxy, JsonPointer, Node, visit, FastStringify, parsePointer, get } from '@microsoft.azure/datastore';
import { Mapping } from 'source-map';
import { statusCodes } from './status-codes';

// NOTE: after testing references should be changed to OpenAPI 3.x.x references

export class Oai2ToOai3 {
  public generated: any;
  public mappings = new Array<Mapping>();

  constructor(protected originalFilename: string, protected original: any) {
    this.generated = createGraphProxy(this.originalFilename, '', this.mappings);
  }

  convert() {
    // process servers
    if (this.original['x-ms-parameterized-host']) {
      let xMsPHost: any = this.original['x-ms-parameterized-host'];
      let server: any = {};
      const scheme = xMsPHost.useSchemePrefix === false ? "" : ((this.original.schemes || ["http"]).map(s => s + "://")[0] || "");
      server.url = scheme + xMsPHost.hostTemplate + (this.original.basePath || "");
      if (xMsPHost.positionInOperation) {
        server['x-ms-parameterized-host'] = { positionInOperation: xMsPHost.positionInOperation };
      }
      server.variables = {};
      for (let msp in xMsPHost.parameters) {
        if (!msp.startsWith('x-')) {

          let originalParameter: any = {};
          let param: any = {};
          if (xMsPHost.parameters[msp].$ref !== undefined) {
            const referencePointer = xMsPHost.parameters[msp].$ref.replace('#', '');
            originalParameter = get(this.original, referencePointer);
          } else {
            originalParameter = xMsPHost.parameters[msp];
          }

          // TODO: Investigate why its not possible to copy
          // properties and filter the property 'in' using
          // object destructuring.
          for (const key in originalParameter) {
            switch (key) {
              case 'in':
              case 'required':
              case 'type':
              case 'name':
                break;
              default:
                param[key] = originalParameter[key];
                break;
            }
          }

          const parameterName = originalParameter.name;
          if (originalParameter.default === undefined) {
            if (originalParameter.enum) {
              param.default = originalParameter.enum[0];
            }
            else {
              param.default = '';
            }
          }

          server.variables[parameterName] = param;
        }
      }

      this.generated.servers = this.newArray('/x-ms-parameterized-host');
      this.generated.servers.__push__({ value: server, pointer: '/x-ms-parameterized-host', recurse: true });
    } else if (this.original.host) {
      if (this.generated.servers === undefined) {
        this.generated.servers = this.newArray('/host');
      }
      for (const { value: s, pointer } of visit(this.original.schemes)) {
        let server: any = {};
        server.url = (s ? s + ':' : '') + '//' + this.original.host + (this.original.basePath ? this.original.basePath : '/');
        extractServerParameters(server);
        this.generated.servers.__push__({ value: server, pointer });
      }
    } else if (this.original.basePath) {
      let server: any = {};
      server.url = this.original.basePath;
      extractServerParameters(server);
      if (this.generated.servers === undefined) {
        this.generated.servers = this.newArray('/basePath');
      }
      this.generated.servers.__push__({ value: server, pointer: '/basePath' });
    }

    if (this.generated.servers === undefined) {
      // NOTE: set to empty array to match behavior from https://github.com/fearthecowboy/swagger2openapi/blob/autorest-flavor/index.js
      // In reality this should not be neccesary as severs is not required for the OAI definition to be complete.
      this.generated.servers = this.newArray('');
    }

    // internal function to extract server parameters
    function extractServerParameters(server) {
      server.url = server.url.split('{{').join('{');
      server.url = server.url.split('}}').join('}');
      server.url.replace(/\{(.+?)\}/g, function (match, group1) {
        if (!server.variables) {
          server.variables = {};
        }
        server.variables[group1] = { default: 'unknown' };
      });
    }

    // extract cosumes and produces
    const globalProduces = (this.original.produces) ? this.original.produces : ['*/*'];
    const globalConsumes = (this.original.consumes) ? this.original.consumes : ['application/json'];


    for (const { value, key, pointer, children } of visit(this.original)) {
      switch (key) {
        case 'swagger':
          this.generated.openapi = { value: '3.0.0', pointer };
          break;
        case 'info':
          this.generated.info = this.newObject(pointer);
          this.visitInfo(children);
          break;
        case 'x-ms-paths':
        case 'paths':
          // convert x-ms-paths to paths by just passing paths as the key.
          const newKey = 'paths';
          if (!this.generated[newKey]) {
            this.generated[newKey] = this.newObject(pointer);
          }
          this.visitPaths(this.generated[newKey], children, globalConsumes, globalProduces);
          break;
        case 'host':
        case 'basePath':
        case 'schemes':
        case 'x-ms-parameterized-host':
          // host, basePath and schemes already processed
          break;
        case 'consumes':
        case 'produces':
          // PENDING
          break;
        case 'definitions':
          this.visitDefinitions(children);
          break;
        case 'parameters':
          this.visitParameterDefinitions(children);
          break;
        case 'responses':
          if (!this.generated.components) {
            this.generated.components = this.newObject(pointer);
          }
          this.generated.components.responses = this.newObject(pointer);
          this.visitResponsesDefinitions(children, globalProduces);
          break;
        case 'securityDefinitions':
          if (!this.generated.components) {
            this.generated.components = this.newObject(pointer);
          }
          this.generated.components.securitySchemes = this.newObject(pointer);
          this.visitSecurityDefinitions(children);
          break;
        // no changes to security from OA2 to OA3
        case 'security':
          this.generated.security = { value, pointer, recurse: true };
          break;
        case 'tags':
          this.generated.tags = this.newArray(pointer);
          this.visitTags(children);
          break;
        case 'externalDocs':
          this.visitExternalDocs(this.generated, key, value, pointer);
          break;
        default:
          // handle stuff liks x-* and things not recognized
          this.visitExtensions(this.generated, key, value, pointer);
          break;
      }
    }

    return this.generated;
  }

  visitParameterDefinitions(parameters: Iterable<Node>) {
    for (const { key, value, pointer, childIterator } of parameters) {
      if (value.in !== 'formData' && value.in !== 'body' && value.type !== 'file') {

        if (this.generated.components === undefined) {
          this.generated.components = this.newObject(pointer);
        }

        if (this.generated.components.parameters === undefined) {
          this.generated.components.parameters = this.newObject(pointer);
        }

        const cleanParamName = key.replace(/\$|\[|\]/g, '_');

        this.generated.components.parameters[cleanParamName] = this.newObject(pointer);
        this.visitParameter(this.generated.components.parameters[cleanParamName], value, pointer, childIterator);
      }
    }
  }


  visitParameter(parameterTarget: any, parameterValue: any, pointer: string, parameterItemMembers: () => Iterable<Node>) {

    if (parameterValue.$ref !== undefined) {
      const cleanReferenceValue = parameterValue.$ref.replace(/\$|\[|\]/g, '_');
      parameterTarget.$ref = { value: cleanReferenceValue.replace('#/parameters/', '#/components/parameters/'), pointer };
    } else {

      const parameterUnchangedProperties = [
        'name',
        'in',
        'description',
        'allowEmptyValue',
        'required',
        'x-ms-parameter-location',
        'x-comment',
        'x-ms-parameter-grouping',
        'x-ms-client-name',
        'x-ms-client-flatten',
        'x-ms-client-request-id'
      ]

      for (const key of parameterUnchangedProperties) {
        if (parameterValue[key] !== undefined) {
          parameterTarget[key] = { value: parameterValue[key], pointer, recurse: true };
        }
      }

      if (parameterValue['x-ms-skip-url-encoding'] !== undefined) {
        if (parameterValue.in === 'query') {
          parameterTarget.allowReserved = { value: true, pointer };
        } else {
          parameterTarget['x-ms-skip-url-encoding'] = { value: parameterValue['x-ms-skip-url-encoding'], pointer };
        }
      }

      // Collection Format
      if (parameterValue.collectionFormat !== undefined && parameterValue.type === 'array') {
        if ((parameterValue.collectionFormat === 'csv') && ((parameterValue.in === 'query') || (parameterValue.in === 'cookie'))) {
          parameterTarget.style = { value: 'form', pointer };
        }
        if ((parameterValue.collectionFormat === 'csv') && ((parameterValue.in === 'path') || (parameterValue.in === 'header'))) {
          parameterTarget.style = { value: 'simple', pointer };
        }
        if (parameterValue.collectionFormat === 'ssv') {
          if (parameterValue.in === 'query') {
            parameterTarget.style = { value: 'spaceDelimited', pointer };
          }
        }
        if (parameterValue.collectionFormat === 'pipes') {
          if (parameterValue.in === 'query') {
            parameterTarget.style = { value: 'pipeDelimited', pointer };
          }
        }
        if (parameterValue.collectionFormat === 'multi') {
          parameterTarget.explode = { value: true, pointer };
        }
      }

      if (parameterTarget.schema === undefined) {
        parameterTarget.schema = this.newObject(pointer);
      }

      const schemaKeys = [
        'maximum',
        'exclusiveMaximum',
        'minimum',
        'exclusiveMinimum',
        'maxLength',
        'minLength',
        'pattern',
        'maxItems',
        'minItems',
        'uniqueItems',
        'enum',
        'x-ms-enum',
        'multipleOf',
        'default',
        'format',
      ];

      for (const { key, childIterator, pointer: jsonPointer } of parameterItemMembers()) {
        if (key === 'schema') {
          if (parameterTarget.schema.items === undefined) {
            parameterTarget.schema.items = this.newObject(jsonPointer);
          }
          this.visitSchema(parameterTarget.schema.items, parameterValue.items, childIterator);
        } else if (schemaKeys.indexOf(key) !== -1) {
          parameterTarget.schema[key] = { value: parameterValue[key], pointer, recurse: true };
        }
      }


      if (parameterValue.type !== undefined) {
        parameterTarget.schema.type = { value: parameterValue.type, pointer };
      }

      if (parameterValue.items !== undefined) {
        parameterTarget.schema.items = this.newObject(pointer);
        for (const { key, childIterator } of parameterItemMembers()) {
          if (key === 'items') {
            this.visitSchema(parameterTarget.schema.items, parameterValue.items, childIterator);
          }
        }
      }
    }
  }

  visitInfo(info: Iterable<Node>) {
    for (const { value, key, pointer, children } of info) {
      switch (key) {
        case 'title':
        case 'description':
        case 'termsOfService':
        case 'contact':
        case 'license':
        case 'version':
          this.generated.info[key] = { value, pointer };
          break;
        default:
          this.visitExtensions(this.generated.info, key, value, pointer);
          break;
      }
    }
  }

  visitSecurityDefinitions(securityDefinitions: Iterable<Node>) {
    for (const { key: schemeName, value: v, pointer: jsonPointer, children: securityDefinitionsItemMembers } of securityDefinitions) {
      this.generated.components.securitySchemes[schemeName] = this.newObject(jsonPointer);
      const securityScheme = this.generated.components.securitySchemes[schemeName];
      switch (v.type) {
        case 'apiKey':
          for (const { key, value, pointer } of securityDefinitionsItemMembers) {
            switch (key) {
              case 'type':
              case 'description':
              case 'name':
              case 'in':
                securityScheme[key] = { value, pointer };
                break;
              default:
                this.visitExtensions(securityScheme, key, value, pointer);
                break;
            }
          }
          break;
        case 'basic':
          for (const { key, value, pointer } of securityDefinitionsItemMembers) {
            switch (key) {
              case 'description':
                securityScheme.description = { value, pointer };
                break;
              case 'type':
                securityScheme.type = { value: 'http', pointer };
                securityScheme.scheme = { value: 'basic', pointer };
                break;
              default:
                this.visitExtensions(securityScheme, key, value, pointer);
                break;
            }
          }
          break;
        case 'oauth2':
          if (v.description !== undefined) {
            securityScheme.description = { value: v.description, pointer: jsonPointer };
          }

          securityScheme.type = { value: v.type, pointer: jsonPointer };
          securityScheme.flows = this.newObject(jsonPointer);
          let flowName = v.flow;

          // convert flow names to OpenAPI 3 flow names
          if (v.flow === 'application') {
            flowName = 'clientCredentials';
          }

          if (v.flow === 'accessCode') {
            flowName = 'authorizationCode';
          }

          securityScheme.flows[flowName] = this.newObject(jsonPointer);
          let authorizationUrl;
          let tokenUrl;
          let scopes;

          if (v.authorizationUrl) {
            authorizationUrl = v.authorizationUrl.split('?')[0].trim() || '/';
            securityScheme.flows[flowName].authorizationUrl = { value: authorizationUrl, pointer: jsonPointer };
          }

          if (v.tokenUrl) {
            tokenUrl = v.tokenUrl.split('?')[0].trim() || '/';
            securityScheme.flows[flowName].tokenUrl = { value: tokenUrl, pointer: jsonPointer };
          }

          scopes = v.scopes || {};
          securityScheme.flows[flowName].scopes = { value: scopes, pointer: jsonPointer };
          break;
      }
    }
  }

  visitDefinitions(definitions: Iterable<Node>) {
    for (const { key: schemaName, value: schemaValue, pointer: jsonPointer, childIterator: definitionsItemMembers } of definitions) {
      if (this.generated.components === undefined) {
        this.generated.components = this.newObject(jsonPointer);
      }

      if (this.generated.components.schemas === undefined) {
        this.generated.components.schemas = this.newObject(jsonPointer);
      }

      const cleanSchemaName = schemaName.replace(/\[|\]/g, '_');
      this.generated.components.schemas[cleanSchemaName] = this.newObject(jsonPointer);
      const schemaItem = this.generated.components.schemas[cleanSchemaName];
      this.visitSchema(schemaItem, schemaValue, definitionsItemMembers);
    }
  }

  visitProperties(target: any, propertiesItemMembers: () => Iterable<Node>) {
    for (const { key, value, pointer, childIterator } of propertiesItemMembers()) {
      target[key] = this.newObject(pointer);
      this.visitSchema(target[key], value, childIterator);
    }
  }

  visitResponsesDefinitions(responses: Iterable<Node>, globalProduces: Array<string>) {
    for (const { key, pointer, value, childIterator } of responses) {
      this.generated.components.responses[key] = this.newObject(pointer);
      this.visitResponse(this.generated.components.responses[key], value, key, childIterator, pointer, globalProduces);
    }
  }

  visitSchema(target: any, schemaValue: any, schemaItemMemebers: () => Iterable<Node>) {
    for (const { key, value, pointer, childIterator } of schemaItemMemebers()) {
      switch (key) {
        case '$ref':
          target[key] = { value: this.getNewSchemaReference(value), pointer };
          break;
        case 'additionalProperties':
          if (typeof (value) === 'boolean') {
            target[key] = { value, pointer };
          } else {
            target[key] = this.newObject(pointer);
            this.visitSchema(target[key], value, childIterator);
          }
          break;
        case 'required':
        case 'title':
        case 'description':
        case 'default':
        case 'multipleOf':
        case 'maximum':
        case 'exclusiveMaximum':
        case 'minimum':
        case 'exclusiveMinimum':
        case 'maxLength':
        case 'minLength':
        case 'pattern':
        case 'maxItems':
        case 'minItems':
        case 'uniqueItems':
        case 'maxProperties':
        case 'minProperties':
        case 'enum':
        case 'readOnly':
          target[key] = { value, pointer, recurse: true };
          break;
        case 'allOf':
          target.allOf = this.newArray(pointer);
          this.visitAllOf(target.allOf, childIterator);
          break;
        case 'items':
          target[key] = this.newObject(pointer);
          this.visitSchema(target[key], value, childIterator);
          break;
        case 'properties':
          target[key] = this.newObject(pointer);
          this.visitProperties(target[key], childIterator);
          break;
        case 'type':
        case 'format':
          target[key] = { value, pointer };
          break;
        // in OpenAPI 3 the discriminator its an object instead of a string.
        case 'discriminator':
          target.discriminator = this.newObject(pointer);
          target.discriminator.propertyName = { value, pointer };
          break;
        case 'xml':
          this.visitXml(target, key, value, pointer);
          break;
        case 'externalDocs':
          this.visitExternalDocs(target, key, value, pointer);
          break;
        case 'example':
          target.example = { value, pointer, recurse: true };
          break;
        case 'x-nullable':
          // NOTE: this matches the previous converter behavior
          // ... when a $ref is inside the schema
          // copy the properties as they are
          // don't update names
          if (schemaValue.$ref === undefined) {
            target['nullable'] = { value, pointer };
          } else {
            target['x-nullable'] = { value, pointer };
          }
          break;
        default:
          this.visitExtensions(target, key, value, pointer);
          break;
      }
    }
  }

  visitAllOf(target: any, allOfMembers: () => Iterable<Node>) {
    for (const { key: index, value, pointer, childIterator } of allOfMembers()) {
      target.__push__(this.newObject(pointer));
      this.visitSchema(target[index], value, childIterator);
    }
  }

  visitItems(target: any, key: string, value: any, pointer: string) {
    if (Array.isArray(target[key])) {
      if (target[key].length === 0) {
        // Value must be an object not an array.
        // See: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schemaObject
        target[key] = { value: {}, pointer };
      } else if (target[key].length === 1) {
        target[key] = { value: value[0], pointer, recurse: true }
      } else {
        target[key] = { value: { anyOf: target[key] }, pointer };
      }
    } else {
      target[key] = { value, pointer, recurse: true };
    }
  }

  visitXml(target: any, key: string, value: any, pointer: string) {
    target[key] = { value, pointer, recurse: true };
  }

  visitTags(tags: Iterable<Node>) {
    for (const { key: index, pointer, children: tagItemMembers } of tags) {
      this.visitTag(parseInt(index), pointer, tagItemMembers);
    }
  }

  visitTag(index: number, jsonPointer: JsonPointer, tagItemMembers: Iterable<Node>) {
    this.generated.tags.__push__(this.newObject(jsonPointer));

    for (const { key, pointer, value } of tagItemMembers) {
      switch (key) {
        case 'name':
        case 'description':
          this.generated.tags[index][key] = { value, pointer };
          break;
        case 'externalDocs':
          this.visitExternalDocs(this.generated.tags[index], key, value, pointer);
          break;
        default:
          this.visitExtensions(this.generated.tags[index], key, value, pointer);
          break;
      }
    }
  }

  // NOTE: For the previous converter external references are not
  // converted, but internal references are converted.
  // Decided that updating all references makes more sense.
  getNewSchemaReference(oldReference: string) {
    const cleanOldReference = oldReference.replace(/\$|\[|\]/g, '_');
    return cleanOldReference.replace('#/definitions/', '#/components/schemas/');
  }

  visitExtensions(target: any, key: string, value: any, pointer: string) {
    switch (key) {
      case 'x-ms-odata':
        target[key] = { value: this.getNewSchemaReference(value), pointer };
        break;
      default:
        target[key] = { value, pointer, recurse: true };
        break;
    }
  }

  visitExternalDocs(target: any, key: string, value: any, pointer: string) {
    target[key] = { value, pointer, recurse: true }
  }

  newArray(pointer: JsonPointer) {
    return { value: createGraphProxy(this.originalFilename, pointer, this.mappings, new Array<any>()), pointer };
  }

  newObject(pointer: JsonPointer) {
    return <any>{ value: createGraphProxy(this.originalFilename, pointer, this.mappings), pointer };
  }

  visitUnspecified(nodes: Iterable<Node>) {
    for (const { value, pointer } of nodes) {
      console.error(`?? Unknown item: ${pointer} : ${value} `);
    }
  }

  visitPaths(target: any, paths: Iterable<Node>, globalConsumes: Array<string>, globalProduces: Array<string>) {
    for (const { key: uri, pointer, children: pathItemMembers } of paths) {
      this.visitPath(target, uri, pointer, pathItemMembers, globalConsumes, globalProduces);
    }
  }

  visitPath(target: any, uri: string, jsonPointer: JsonPointer, pathItemMembers: Iterable<Node>, globalConsumes: Array<string>, globalProduces: Array<string>) {
    target[uri] = this.newObject(jsonPointer);
    const pathItem = target[uri];
    for (const { value, key, pointer, children: pathItemFieldMembers } of pathItemMembers) {
      // handle each item in the path object
      switch (key) {
        case '$ref':
        case 'x-summary':
        case 'x-description':
          pathItem[key] = { value, pointer };
          break;
        case 'get':
        case 'put':
        case 'post':
        case 'delete':
        case 'options':
        case 'head':
        case 'patch':
        case 'x-trace':
          this.visitOperation(pathItem, key, pointer, pathItemFieldMembers, value, globalConsumes, globalProduces);
          break;
        case 'parameters':
          pathItem.parameters = this.newArray(pointer);
          this.visitPathParameters(pathItem.parameters, pathItemFieldMembers);
          break;
      }
    }
  }

  visitPathParameters(target: any, parameters: Iterable<Node>) {
    for (const { key, value, pointer, childIterator } of parameters) {
      target.__push__(this.newObject(pointer));
      this.visitParameter(target[target.length - 1], value, pointer, childIterator);
    }
  }

  visitOperation(pathItem: any, httpMethod: string, jsonPointer: JsonPointer, operationItemMembers: Iterable<Node>, operationValue: any, globalConsumes: Array<string>, globalProduces: Array<string>) {

    // trace was not supported on OpenAPI 2.0, it was an extension
    httpMethod = (httpMethod !== 'x-trace') ? httpMethod : 'trace';
    pathItem[httpMethod] = this.newObject(jsonPointer);

    // handle a single operation.
    const operation = pathItem[httpMethod];

    // preprocess produces and consumes for responses and parameters respectively;
    const produces = (operationValue.produces) ? (operationValue.produces.indexOf('application/json') !== -1) ? operationValue.produces
      : [...new Set([...operationValue.produces, ...globalProduces])]
      : globalProduces;

    const consumes = (operationValue.consumes) ? (operationValue.consumes.indexOf('application/octet-stream') !== -1) ? operationValue.consumes
      : [...new Set([...operationValue.consumes, ...globalConsumes])]
      : globalConsumes;
    for (const { value, key, pointer, children: operationFieldItemMembers } of operationItemMembers) {
      switch (key) {
        case 'tags':
        case 'description':
        case 'summary':
        case 'operationId':
        case 'deprecated':
          operation[key] = { value, pointer };
          break;
        case 'externalDocs':
          this.visitExternalDocs(operation, key, value, pointer);
          break;
        case 'consumes':
          // handled beforehand for parameters
          break;
        case 'parameters':
          this.visitParameters(operation, operationFieldItemMembers, consumes, pointer);
          break;
        case 'produces':
          // handled beforehand for responses
          break;
        case 'responses':
          operation.responses = this.newObject(pointer);
          this.visitResponses(operation.responses, operationFieldItemMembers, produces);
          break;
        case 'schemes':
          break;
        case 'security':
          operation.security = { value, pointer, recurse: true };
          break;
        default:
          this.visitExtensions(operation, key, value, pointer);
          break;
      }
    }
  }

  visitParameters(targetOperation: any, parametersFieldItemMembers: any, consumes: any, pointer: string) {
    const requestBodyTracker = { xmsname: undefined, name: undefined, description: undefined, index: -1, keepTrackingIndex: true, wasSpecialParameterFound: false, wasParamRequired: false };
    for (let { pointer, value, childIterator } of parametersFieldItemMembers) {

      if (value.$ref && (value.$ref.match(/^#\/parameters\//g) || value.$ref.startsWith(`${this.originalFilename}#/parameters/`))) {
        // local reference. it's possible to look it up.
        const referenceParts = value.$ref.split('/');
        const paramName = referenceParts.pop();
        const componentType = referenceParts.pop();
        const referencePointer = `/${componentType}/${paramName}`;
        const dereferencedParameter = get(this.original, referencePointer);
        if (dereferencedParameter.in === 'body' || dereferencedParameter.type === 'file' || dereferencedParameter.in === 'formData') {
          const parameterName = referencePointer.replace('/parameters/', '');
          const dereferencedParameters = get(this.original, '/parameters');
          for (const { key, childIterator: newChildIterator } of visit(dereferencedParameters)) {
            if (key === parameterName) {
              childIterator = newChildIterator;
            }
          }
          value = dereferencedParameter;
          pointer = referencePointer;
        }
      }

      if (value.in === 'body' || value.type === 'file' || value.in === 'formData') {
        if (!requestBodyTracker.wasSpecialParameterFound && value.description !== undefined) {
          requestBodyTracker.description = value.description;
        } else {
          requestBodyTracker.description = undefined;
        }

        if (value['x-ms-client-name']) {
          requestBodyTracker.xmsname = value['x-ms-client-name'];
        } else if (value.name) {
          requestBodyTracker.name = value.name;
        }

        if ((value.in === 'body' || value.type === 'file') && value.in !== 'formData') {
          requestBodyTracker.wasParamRequired = value.required;
        }
      }

      if (requestBodyTracker.keepTrackingIndex) {
        if (!(value.in === 'body' || value.type === 'file' || value.in === 'formData')) {
          if (requestBodyTracker.wasSpecialParameterFound) {
            requestBodyTracker.keepTrackingIndex = false;
          }
        } else {
          requestBodyTracker.wasSpecialParameterFound = true;
        }
      }

      if (requestBodyTracker.keepTrackingIndex) {
        requestBodyTracker.index += 1;
      }

      this.visitOperationParameter(targetOperation, value, pointer, childIterator, consumes);
    }

    if (targetOperation.requestBody !== undefined) {


      if (requestBodyTracker.wasParamRequired) {
        targetOperation.requestBody.required = { value: requestBodyTracker.wasParamRequired, pointer };
      }

      if (requestBodyTracker.description !== undefined && targetOperation.requestBody.description === undefined) {
        targetOperation.requestBody.description = { value: requestBodyTracker.description, pointer };
      }

      if (requestBodyTracker.xmsname) {
        targetOperation.requestBody['x-ms-client-name'] = { value: requestBodyTracker.xmsname, pointer };
        targetOperation.requestBody['x-ms-requestBody-name'] = { value: requestBodyTracker.xmsname, pointer };
      } else if (requestBodyTracker.name) {
        targetOperation.requestBody['x-ms-requestBody-name'] = { value: requestBodyTracker.name, pointer };
      }

      if (targetOperation.parameters === undefined) {
        targetOperation['x-ms-requestBody-index'] = { value: 0, pointer };

      } else {
        targetOperation['x-ms-requestBody-index'] = { value: requestBodyTracker.index, pointer };
      }
    }
  }

  visitOperationParameter(targetOperation: any, parameterValue: any, pointer: string, parameterItemMembers: () => Iterable<Node>, consumes: Array<any>) {

    if (parameterValue.in === 'formData' || parameterValue.in === 'body' || parameterValue.type === 'file') {

      if (targetOperation.requestBody === undefined) {
        targetOperation.requestBody = this.newObject(pointer);
      }

      if (targetOperation.requestBody.content === undefined) {
        targetOperation.requestBody.content = this.newObject(pointer);
      }

      if (parameterValue['x-ms-parameter-location'] && targetOperation.requestBody['x-ms-parameter-location'] === undefined) {
        targetOperation.requestBody['x-ms-parameter-location'] = { value: parameterValue['x-ms-parameter-location'], pointer };
      }

      if (parameterValue['x-ms-client-flatten'] !== undefined && targetOperation.requestBody['x-ms-client-flatten'] === undefined) {
        targetOperation.requestBody['x-ms-client-flatten'] = { value: parameterValue['x-ms-client-flatten'], pointer };
      }

      if (parameterValue['x-ms-enum'] !== undefined && targetOperation.requestBody['x-ms-enum'] === undefined) {
        targetOperation.requestBody['x-ms-enum'] = { value: parameterValue['x-ms-enum'], pointer };
      }

      if (parameterValue.allowEmptyValue !== undefined && targetOperation.requestBody.allowEmptyValue === undefined) {
        targetOperation.requestBody.allowEmptyValue = { value: parameterValue.allowEmptyValue, pointer };
      }

      // if (parameterValue.required === true && targetOperation.requestBody.required === undefined) {
      //   targetOperation.requestBody.required = { value: parameterValue.required, pointer };
      // }

      if (parameterValue.in === 'formData') {

        let contentType = 'application/x-www-form-urlencoded';
        if ((consumes.length) && (consumes.indexOf('multipart/form-data') >= 0)) {
          contentType = 'multipart/form-data';
        }

        if (targetOperation.requestBody.content[contentType] === undefined) {
          targetOperation.requestBody.content[contentType] = this.newObject(pointer);
        }

        if (targetOperation.requestBody.content[contentType].schema === undefined) {
          targetOperation.requestBody.content[contentType].schema = this.newObject(pointer);
        }

        if (parameterValue.schema !== undefined) {
          for (const { key, value, childIterator } of parameterItemMembers()) {
            if (key === 'schema') {
              this.visitSchema(targetOperation.requestBody.content[contentType].schema, value, childIterator);
            }
          }
        } else {
          const schema = targetOperation.requestBody.content[contentType].schema;
          if (schema.type === undefined) {
            schema.type = { value: 'object', pointer };
          }

          if (schema.properties === undefined) {
            schema.properties = this.newObject(pointer);
          }

          schema.properties[parameterValue.name] = this.newObject(pointer);
          const targetProperty = schema.properties[parameterValue.name];
          if (parameterValue.description !== undefined) {
            targetProperty.description = { value: parameterValue.description, pointer };
          }

          if (parameterValue.example !== undefined) {
            targetProperty.example = { value: parameterValue.example, pointer };
          }

          if (parameterValue.type !== undefined) {
            // NOTE: To be valid 3.x.x it should do the stuff commented below, but the previous converter didn't do it.
            // if (parameterValue.type === 'file') {
            //   targetProperty.type = { value: 'string', pointer };
            //   targetProperty.format = { value: 'binary', pointer };
            // } else {
            //   targetProperty.type = { value: parameterValue.type, pointer };
            // }
            targetProperty.type = { value: parameterValue.type, pointer };
          }

          if (schema.required === undefined) {
            schema.required = this.newArray(pointer);
          }

          if (parameterValue.required === true) {
            schema.required.__push__({ value: parameterValue.name, pointer });
          }

          if (parameterValue.default !== undefined) {
            targetProperty.default = { value: parameterValue.default, pointer };
          }

          if (parameterValue.enum !== undefined) {
            targetProperty.enum = { value: parameterValue.enum, pointer, recurse: true };
          }

          if (parameterValue.allOf !== undefined) {
            targetProperty.allOf = { value: parameterValue.allOf, pointer };
          }

          if (parameterValue.type === 'array' && parameterValue.items !== undefined) {
            targetProperty.items = { value: parameterValue.items, pointer };
          }

          // copy extensions in target property
          for (const { key, pointer: fieldPointer, value } of parameterItemMembers()) {
            if (key.startsWith('x-')) {
              targetProperty[key] = { value: value, pointer: fieldPointer };
            }
          }
        }
      } else if (parameterValue.type === 'file') {

        targetOperation['application/octet-stream'] = this.newObject(pointer);
        targetOperation['application/octet-stream'].schema = this.newObject(pointer);
        targetOperation['application/octet-stream'].schema.type = { value: 'string', pointer };
        targetOperation['application/octet-stream'].schema.format = { value: 'binary', pointer };
      }

      if (parameterValue.in === 'body') {

        const consumesTempArray = [...consumes];
        if (consumesTempArray.length === 0) {
          consumesTempArray.push('application/json');
        }

        for (let mimetype of consumesTempArray) {
          if (targetOperation.requestBody.content[mimetype] === undefined) {
            targetOperation.requestBody.content[mimetype] = this.newObject(pointer);
          }

          if (targetOperation.requestBody.content[mimetype].schema === undefined) {
            targetOperation.requestBody.content[mimetype].schema = this.newObject(pointer);
          }

          if (parameterValue.schema !== undefined) {
            for (const { key, value, childIterator } of parameterItemMembers()) {
              if (key === 'schema') {
                this.visitSchema(targetOperation.requestBody.content[mimetype].schema, value, childIterator);
              }
            }
          } else {
            targetOperation.requestBody.content[mimetype].schema = this.newObject(pointer);
          }

        }

        // copy extensions in requestBody
        for (const { key, pointer: fieldPointer, value } of parameterItemMembers()) {
          if (key.startsWith('x-')) {
            targetOperation.requestBody[key] = { value: value, pointer: fieldPointer };
          }
        }
      }
    } else {
      if (targetOperation.parameters === undefined) {
        targetOperation.parameters = this.newArray(pointer);
      }

      targetOperation.parameters.__push__(this.newObject(pointer));
      const parameter = targetOperation.parameters[targetOperation.parameters.length - 1];
      this.visitParameter(parameter, parameterValue, pointer, parameterItemMembers);
    }
  }

  visitResponses(target: any, responsesItemMembers: Iterable<Node>, produces: Array<string>) {
    for (const { key, value, pointer, childIterator } of responsesItemMembers) {
      target[key] = this.newObject(pointer);
      if (value.$ref) {
        let newReferenceValue = value.$ref.replace('#/responses/', '#/components/responses/');

        target[key].$ref = { value: newReferenceValue, pointer };
      } else if (key.startsWith('x-')) {
        this.visitExtensions(target[key], key, value, pointer);
      } else {
        this.visitResponse(target[key], value, key, childIterator, pointer, produces);
      }
    }
  }

  visitResponse(responseTarget: any, responseValue: any, responseName: string, responsesFieldMembers: () => Iterable<Node>, jsonPointer: string, produces: Array<string>) {

    // NOTE: The previous converter patches the description of the response because
    // every response should have a description.
    // So, to match previous behavior we do too.
    if (responseValue.description === undefined || responseValue.description === '') {
      let sc = statusCodes.find((e) => {
        return e.code === responseName;
      });

      responseTarget.description = { value: (sc ? sc.phrase : ''), pointer: jsonPointer };
    } else {
      responseTarget.description = { value: responseValue.description, pointer: jsonPointer };
    }

    if (responseValue.schema) {
      responseTarget.content = this.newObject(jsonPointer);
      for (let mimetype of produces) {
        responseTarget.content[mimetype] = this.newObject(jsonPointer);
        responseTarget.content[mimetype].schema = this.newObject(jsonPointer);
        for (const { key, value, childIterator } of responsesFieldMembers()) {
          if (key === 'schema') {
            this.visitSchema(responseTarget.content[mimetype].schema, value, childIterator);
          }
        }
        if (responseValue.examples && responseValue.examples[mimetype]) {
          let example: any = {};
          example.value = responseValue.examples[mimetype];
          responseTarget.content[mimetype].examples = this.newObject(jsonPointer);
          responseTarget.content[mimetype].examples.response = { value: example, pointer: jsonPointer };
        }
      }
    }

    // examples outside produces
    for (let mimetype in responseValue.examples) {
      if (responseTarget.content === undefined) {
        responseTarget.content = this.newObject(jsonPointer);
      }

      if (responseTarget.content[mimetype] === undefined) {
        responseTarget.content[mimetype] = this.newObject(jsonPointer);
      }

      if (responseTarget.content[mimetype].examples === undefined) {
        responseTarget.content[mimetype].examples = this.newObject(jsonPointer);
        responseTarget.content[mimetype].examples.response = this.newObject(jsonPointer);
        responseTarget.content[mimetype].examples.response.value = { value: responseValue.examples[mimetype], pointer: jsonPointer }
      }
    }

    if (responseValue.headers) {
      responseTarget.headers = this.newObject(jsonPointer);
      for (let h in responseValue.headers) {
        responseTarget.headers[h] = this.newObject(jsonPointer);
        this.visitHeader(responseTarget.headers[h], responseValue.headers[h], jsonPointer);
      }
    }
  }

  visitHeader(targetHeader: any, headerValue: any, jsonPointer: string) {
    if (headerValue.$ref) {
      // GS01/CRITICAL-TO-DO-NELSON -- should that be /components/headers ????
      const newReferenceValue = `#/components/responses/${headerValue.schema.$ref.replace('#/responses/', '')}`;
      targetHeader.$ref = { value: newReferenceValue, pointer: jsonPointer };
    } else {
      if (headerValue.type && headerValue.schema === undefined) {
        targetHeader.schema = this.newObject(jsonPointer);
      }

      if (headerValue.description) {
        targetHeader.description = { value: headerValue.description, pointer: jsonPointer };
      }

      const schemaKeys = [
        'maximum',
        'exclusiveMaximum',
        'minimum',
        'exclusiveMinimum',
        'maxLength',
        'minLength',
        'pattern',
        'maxItems',
        'minItems',
        'uniqueItems',
        'enum',
        'multipleOf',
        'format',
        'default'
      ];

      for (const { key, childIterator } of visit(headerValue)) {
        if (key === 'schema') {
          this.visitSchema(targetHeader.schema.items, headerValue.items, childIterator);
        } else if (schemaKeys.indexOf(key) !== -1) {
          targetHeader.schema[key] = { value: headerValue[key], pointer: jsonPointer, recurse: true };
        }
      }

      if (headerValue.type) {
        targetHeader.schema.type = { value: headerValue.type, pointer: jsonPointer };
      }
      if (headerValue.items && headerValue.items.collectionFormat) {
        if (headerValue.collectionFormat === 'csv') {
          targetHeader.style = { value: 'simple', pointer: jsonPointer };
        }

        if (headerValue.collectionFormat === 'multi') {
          targetHeader.explode = { value: true, pointer: jsonPointer };
        }
      }
    }
  }
}
