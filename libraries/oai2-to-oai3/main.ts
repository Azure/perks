import { createGraphProxy, JsonPointer, Node, visit, FastStringify, parsePointer } from '@microsoft.azure/datastore';
import { Mapping } from 'source-map';
import { parse } from 'path';
import { values } from '../linq/dist/main';

export class Oai2ToOai3 {
  public generated: any;
  public mappings = new Array<Mapping>();

  constructor(protected originalFilename: string, protected original: any) {
    this.generated = createGraphProxy(this.originalFilename, '', this.mappings);
  }

  convert() {
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
          if (!this.generated.paths) {
            this.generated.paths = this.newObject(pointer);
          }
          this.visitPaths(children);
          break;
        case 'host':
          break;
        case 'basePath':
          break;
        case 'schemes':
          break;
        case 'consumes':
          break;
        case 'produces':
          break;
        case 'definitions':
          if (!this.generated.components) {
            this.generated.components = this.newObject(pointer);
          }
          this.generated.components.schemas = this.newObject(pointer);
          this.visitDefinitions(children);
          break;
        case 'parameters':
          if (!this.generated.components) {
            this.generated.components = this.newObject(pointer);
          }
          this.generated.components.parameters = this.newObject(pointer);
          break;
        case 'responses':
          if (!this.generated.components) {
            this.generated.components = this.newObject(pointer);
          }
          this.generated.components.responses = this.newObject(pointer);
          this.visitResponsesDefinitions(children);
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

  // DONE
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
          this.visitExtensions(info, key, value, pointer);
          this.visitUnspecified(children);
          break;
      }
    }
  }

  // DONE
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

          if (v.authorizationUrl !== undefined) {
            authorizationUrl = v.authorizationUrl.split('?')[0].trim() || '/';
            securityScheme.flows[flowName].authorizationUrl = { value: authorizationUrl, pointer: jsonPointer };
          }

          if (v.tokenUrl !== undefined) {
            tokenUrl = v.tokenUrl.split('?')[0].trim() || '/';
            securityScheme.flows[flowName].tokenUrl = { value: tokenUrl, pointer: jsonPointer };
          }

          scopes = v.scopes || {};
          securityScheme.flows[flowName].scopes = { value: scopes, pointer: jsonPointer };
          break;
      }
    }
  }

  // DONE
  visitDefinitions(definitions: Iterable<Node>) {
    for (const { key: schemaName, value: schemaValue, pointer: jsonPointer, children: definitionsItemMembers } of definitions) {
      this.generated.components.schemas[schemaName] = this.newObject(jsonPointer);
      const schemaItem = this.generated.components.schemas[schemaName];
      this.visitSchema(schemaItem, schemaValue, definitionsItemMembers);
    }
  }

  visitSchema(target: any, schemaValue: any, schemaItemMemebers: Iterable<Node>) {
    for (const { key, value, pointer, children } of schemaItemMemebers) {
      switch (key) {
        case 'format':
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
        case 'required':
        case 'enum':
        case 'allOf':
        case 'readOnly':
          target[key] = { value, pointer, recurse: true };
          break;
        case 'items':
          target.items = this.newObject(pointer);
          if (schemaValue.items.$ref !== undefined) {
            let newReferenceValue = `#/components/schemas/${schemaValue.items.$ref.replace('#/definitions/', '')}`;
            target.items.$ref = { value: newReferenceValue, pointer };
          } else {
            this.visitSchema(target.items, value, children)
          }
          break;
        case 'properties':
        case 'additionalProperties':
          target[key] = this.newObject(pointer);
          this.visitProperties(target.properties, children);
          break;
        case 'type':
          target.type = { value, pointer };
          if (value === null) {
            target.nullable = { value: true, pointer };
          }
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
        default:
          this.visitExtensions(target, key, value, pointer);
          break;
      }
    }
  }

  visitProperties(target: any, propertiesItemMembers: Iterable<Node>) {
    for (const { key, value, pointer, children } of propertiesItemMembers) {
      target[key] = this.newObject(pointer);
      if (value.$ref !== undefined) {
        let newReferenceValue = `#/components/schemas/${value.$ref.replace('#/definitions/', '')}`;
        target[key].$ref = { value: newReferenceValue, pointer };
      } else {
        this.visitSchema(target[key], value, children);
      }
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
    this.generated.tags.push(this.newObject(jsonPointer));

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

  visitExtensions(target: any, key: string, value: any, pointer: string) {
    target[key] = { value, pointer, recurse: true };
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

  visitPaths(paths: Iterable<Node>) {
    for (const { key: uri, pointer, children: pathItemMembers } of paths) {
      this.visitPath(uri, pointer, pathItemMembers);
    }
  }

  visitPath(uri: string, jsonPointer: JsonPointer, pathItemMembers: Iterable<Node>) {
    this.generated.paths[uri] = this.newObject(jsonPointer);
    const pathItem = this.generated.paths[uri];
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
          this.visitOperation(pathItem, key, pointer, pathItemFieldMembers, value);
          break;
        case 'parameters':
          break;
      }
    }
  }

  visitOperation(pathItem: any, httpMethod: string, jsonPointer: JsonPointer, operationItemMembers: Iterable<Node>, operationValue: any) {

    // trace was not supported on OpenAPI 2.0, it was an extension
    httpMethod = (httpMethod !== 'x-trace') ? httpMethod : 'trace';
    pathItem[httpMethod] = this.newObject(jsonPointer);

    // handle a single operation.
    const operation = pathItem[httpMethod];
    const produces = (operationValue.produces.length !== 0) ? operationValue.produces : ['*/*'];

    for (const { value, key, pointer, children: operationFieldItemMembers } of operationItemMembers) {
      switch (key) {
        case 'tags':
        case 'description':
        case 'summary':
        case 'operationId':
          operation[key] = { value, pointer };
          break;
        case 'externalDocs':
          this.visitExternalDocs(operation, key, value, pointer);
          break;
        case 'consumes':
          break;
        case 'parameters':
          break;
        case 'produces':
          // handled beforehand for responses
          break;
        case 'responses':
          operation.responses = this.newObject(pointer);
          if (value.$ref !== undefined) {
            // if it contains a reference object just update the reference
            operation.responses.$ref = { value: `#/components/responses/${<string>(value.$ref).replace('#/responses/', '')}`, pointer };
            break;
          }

          for (const { key: fieldName, pointer, value: responseValue, children: responsesFieldMembers } of operationFieldItemMembers) {
            if (fieldName.startsWith('x-')) {
              this.visitExtensions(operation.responses, key, value, pointer);
            } else {
              // this.visitResponse(operation.responses, fieldName, responseValue, responsesFieldMembers, pointer, produces);
            }
          }
          break;
        case 'schemes':
          break;
        case 'deprecated':
          break;
        case 'security':
          break;
        default:
          this.visitExtensions(operation, key, value, pointer);
          break;
      }
    }
  }

  visitResponsesDefinitions(responsesDefinitions: Iterable<Node>) {
    for (const { key: name, pointer, children } of responsesDefinitions) {
      this.generated.components.responses[name] = this.newObject(pointer);
      const response = this.generated.components.responses[name];
      //this.visitResponse(response, children);
    }
  }

  // visitResponse(target: any, responseCode: any, responseValue: any, responsesFieldMembers: Iterable<Node>, jsonPointer: any, produces: any) {
  //   target[responseCode] = this.newObject(jsonPointer);
  //   const response = target[responseCode];

  //   if (responseValue.description) {
  //     response.description = { value: responseValue.description, pointer: jsonPointer };
  //   }

  //   if (responseValue.schema) {
  //     response.content = this.newObject(jsonPointer);
  //     for (let mimetype of produces) {
  //       response.content[mimetype] = this.newObject(jsonPointer);
  //       if (responseValue.schema) {
  //         response.content[mimetype].schema = this.newObject(jsonPointer);
  //         if (responseValue.schema.$ref) {
  //           const newReferenceValue = `#/components/schemas/${responseValue.schema.$ref.replace('#/definitions/', '')}`;
  //           response.content[mimetype].schema.$ref = { value: newReferenceValue, pointer: jsonPointer };
  //         } else {
  //           for (const { key, children: schemaItemMemebers, pointer } of responsesFieldMembers) {
  //             if (key === 'schema') {
  //               this.visitSchema(response.content[mimetype].schema, schemaItemMemebers);
  //             }
  //           }
  //         }
  //       }

  //       // if (responseValue.examples && response.examples[mimetype]) {
  //       //   let example = {};
  //       //   example['value'] = response.examples[mimetype];
  //       //   response.content[mimetype].examples = this.newObject(jsonPointer);
  //       //   response.content[mimetype].examples.response = { value: example, pointer: jsonPointer };
  //       // }
  //     }
  //   }
  // }

}
