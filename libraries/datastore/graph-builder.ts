import { Mapping } from 'source-map';
import { JsonPath, parseJsonPointer } from './jsonpath';
import { CreateAssignmentMapping } from './source-map/source-map';
import { keys, length } from '@microsoft.azure/linq';

/*
export abstract class GraphWithSourceMap<T> {
  private generated: T;

  constructor(private originalGraph: any, private originalFilename: string) {
    this.generated = newGraph([''], '');
    jsonPointer.visit(originalGraph, this.visit);
  }

  abstract visit(node, pointer): never;
}
*/
/*

const q = newGraph('', );
q.components = {};  //        './'
q.components.schema = {};     './definitions'
q.components.schema.pet = {   './definitions/pet'

};
const components = q.set("components",{}, '$');
const schema = components.set("schema",{},['$','definitions']);
const pet = schema.set("pet",p,['$','definitions','pet']);

q.components = {
  value: {},                       # value to assign

  sourcePath: "",                  # source JsonPath
  subject: '??',                   # description of what's going on here. (optional)
  sourceKey: "mem://foo/bar.yaml", # sourceFile name (optional)

 }

 *
 */

 /*
export function newGraph<T extends object>(targetPath: JsonPath, sourceKey: string): T {
  const mappings = new Array<Mapping>();

  return new Proxy<T>(<T><any>{
    ____hasSourceGraph: true
  }, {
      get(target: T, key: string | number | symbol): any {

        return (<any>target)[key];
      },
      set(target: T, key: string | number, value: any): boolean {
        // check if this is a correct assignment.
        if (value.value === undefined) {
          throw new Error('Assignment: Direct Assignment Prohibited.');
        }
        if (value.sourcePath === undefined) {
          throw new Error('Assignment: sourcePath property required.');
        }
        if (typeof (value.value) === 'object' && !Array.isArray(value.value)) {
          if (!(<any>target).____hasSourceGraph) {
            throw new Error('Assignment: Objects must have source graph.');
          }
        }

        // set the value in the target object
        CreateAssignmentMapping(value.value, value.sourceKey || sourceKey, value.sourcePath, [...targetPath, key], value.subject || '', true, mappings);


        return true;
      }
    });
}

export abstract class GraphWithMap {
  private generated:any;

  constructor(private originalGraph: any, private originalFilename: string,) {
    this.generated = newGraph([''],'');
    jsonPointer.visit( originalGraph, this.visit);
  }

  abstract visit(node,pointer):never;
}

export class Oai3FromOai2 extends GraphWithMap {
  constructor(originalGraph: any, originalFilename: string,) {
    super( originalGraph, originalFilename);
}
  visit( node, pointer) {
    switch( pointer ) {
      case '/info':
      this.visitInfo(node);
      return false; // don't handle the children
    }
  }

  visitInfo(info:any) {
    this.generated = {
      pointer:
    }
  }
}

interface InsertNode {
  value: string | number | boolean | undefined | InsertNode | {},
  pointer: string,
  filename?: string,
};


let oldModel = {};

let newModel = newGraph('originalFilename.yaml');


newModel.components = {};

newModel.components.schemas = {
  value: newGraph("/definitions", "originalFileName.yaml"),
  sourcePath: "",
  subject: 'components'
};

newModel.components.schemas.foo = {
  value: { ...},
  jsonptr: "/defintions/foo",
  subject: 'components'
};


jp.visit(original, (nodevalue, pointer) => {
  //
  if (pointer === "/paths") {

    newDoc.paths = {
      jsonptr: pointer,
      value: {},

    }
    handlePaths(nodvalue);
    return false;
  }
});

function handlePaths(pathsObject) {
  jp.visit(orginalNode, (pathObject, pointer) => {
    // pointer should be the URI for the path.
    newDoc.paths[uri] = {
      jsonptr: pointer,
      value: {
        summary: {
          value: pathObject.summary,
          jsonPointer: `${pointer}/summary`
        },
        description: {
          value: pathObject.description,
          jpsonPath: `${pointer}/description`
        },
        get: nodeValue.get ? handleOperationObject(nodevalue.get) : undefined,

      }

    }
  });
}*/