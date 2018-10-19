import { createGraphProxy, JsonPointer, Node, visit, FastStringify } from '@microsoft.azure/datastore';
import { Mapping } from 'source-map';

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

          break;
        case 'parameters':
          break;
        case 'responses':
          break;
        case 'securityDefinitions':
          break;
        case 'security':
          break;
        case 'tags':
          this.generated.tags = this.newArray(pointer);
          this.visitTags(children);
          break;
        case 'externalDocs':
          this.visitExternalDocs(this.generated, key, value, pointer);
          break;
        case 'x-ms-paths':
        case 'paths':
          if (!this.generated.paths) {
            this.generated.paths = this.newObject(pointer);
          }
          this.visitPaths(children);
          break;
        default:
          // handle stuff liks x-* and things not recognized
          this.visitExtensions(this.generated, key, value, pointer);
          break;
      }
    }

    return this.generated;
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
    for (const { value, key, pointer, children } of pathItemMembers) {
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
          this.visitOperation(pathItem, key, pointer, children);
          break;
        case 'parameters':
          break;
      }
    }
  }

  visitOperation(pathItem: any, httpMethod: string, jsonPointer: JsonPointer, operationMembers: Iterable<Node>) {
    // handle a single operation.
    pathItem[httpMethod] = this.newObject(jsonPointer);
    const operation = pathItem[httpMethod];

    for (const { value, key, pointer } of operationMembers) {
      switch (key) {
        case 'tags':
          operation.tags = { value, pointer }
          break;
        case 'description':
        case 'summary':
          operation[key] = { value, pointer };
          break;
        case 'externalDocs':
          break;
        case 'operationId':
          break;
        case 'consumes':
          break;
        case 'produces':
          break;
        case 'parameters':
          break;
        case 'responses':
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
}
