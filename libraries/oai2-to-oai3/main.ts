import { createGraphProxy, JsonPointer, Node, visit } from '@microsoft.azure/datastore';
import { Mapping } from 'source-map';

export class Oai2ToOai3 {
  public generated: any;
  public mappings = new Array<Mapping>();

  constructor(protected originalFilename: string, protected original: any) {
    this.generated = this.createGraphProxy('');
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
          this.generated.tags = this.newObject(pointer);
          this.visitTags(children);
          break;
        case 'externalDocs':
          this.generated.externalDocs = this.newObject(pointer);
          this.visitExternalDocs(children);
          break;
        case 'x-ms-paths':
        case 'paths':
          if (!this.generated.paths) {
            this.generated.paths = this.newObject(pointer);
          }

          for (const { key: uri, pointer, children: pathItemMembers } of children) {
            this.visitPath(uri, pointer, pathItemMembers);
          }

          break;
        default:
          // handle stuff liks x-* and things not recognized
          this.visitExtensions(this, value);
          break;
      }
    }

    return this.generated;
  }

  visitTags(tags: Iterable<Node>) {
    for (const { key: index, pointer } of tags) {
      const tagObject = this.generated.tags[index] = this.newObject(pointer);
      for (const { key, pointer, children, value } of tagObject) {
        switch (key) {
          case 'name':
            this.generated.tags[index].name = this.newObject(pointer);
            break;
          case 'description':
            this.generated.tags[index].description = this.newObject(pointer);
            break;
          case 'externalDocs':
            this.generated.tags[index].externalDocs = this.newObject(pointer);
            this.visitExternalDocs(children);
            break;
          default:
            this.visitExtensions(tagObject, value);
            break;
        }
      }
    }
  }

  visitExternalDocs(externalDocs: Iterable<Node>) {
    for (const { value, key, pointer, children } of externalDocs) {
      switch (key) {
        case 'description':
        case 'url':
          this.generated.externalDocs[key] = { value, pointer };
          break;
        default:
          this.visitExtensions(this.generated.externalDocs, value);
          this.visitUnspecified(children);
          break;
      }
    }
  }

  visitPath(uri: string, jsonPointer: JsonPointer, pathItemMembers: Iterable<Node>) {
    const pathItem = this.generated.paths[uri] = this.newObject(jsonPointer);

    for (const { value, key, pointer, children } of pathItemMembers) {
      // handle each item in the path object
      switch (key) {
        case '$ref':
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
          this.visitExtensions(this.generated.info, value);
          this.visitUnspecified(children);
          break;
      }
    }
  }

  createGraphProxy(jsonPointer: JsonPointer) {
    return createGraphProxy(this.originalFilename, jsonPointer, this.mappings);
  }

  newObject(pointer: JsonPointer) {
    return <any>{ value: this.createGraphProxy(pointer), pointer };
  }

  visitUnspecified(nodes: Iterable<Node>) {
    for (const { value, key, pointer, children } of nodes) {
      console.error(`?? Unknown item: ${pointer} : ${value} `);
    }
  }

  visitOperation(pathItem: any, httpMethod: string, jsonPointer: JsonPointer, operationMembers: Iterable<Node>) {
    // handle a single operation.
    const operation = this.newObject(jsonPointer);

    for (const { value, key, pointer } of operationMembers) {
      switch (key) {
        case 'tags':
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
          this.visitExtensions(operation, value);
          break;
      }
    }
  }

  visitExtensions(target: any, value: any) {
    // add each extension to the right spot.
  }
}
