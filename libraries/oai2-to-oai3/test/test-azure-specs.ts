import * as aio from "@microsoft.azure/async-io"
import * as datastore from '@microsoft.azure/datastore';
import { CancellationToken, FastStringify, stringify } from "@microsoft.azure/datastore";
import * as assert from 'assert';
import { only, skip, slow, suite, test, timeout } from "mocha-typescript";
import { SourceMapGenerator } from 'source-map';
import { resolve } from 'path';
const convertOAI2toOAI3 = async (oa2def: any): Promise<any> => (await require("swagger2openapi").convert(oa2def, { patch: true })).openapi;

require('source-map-support').install();

// NOTE: this checks for the azure rest api specs repo to be checked out to /tmp/azure-rest-api-specs.
// if it's not, this test will not run.
// ie:
// mkdir /tmp
// cd /tmp
// git clone https://github.com/azure/azure-rest-api-specs


import { Oai2ToOai3 } from '../main';

@suite class AzureRestSpecs {

  async testEachfile(file: string) {
    let swagger: string;
    let swaggerGraph: any;
    try {
      swagger = await aio.readFile(file);
      swaggerGraph = JSON.parse(swagger);
      if (swaggerGraph.swagger !== '2.0') {
        return;
      }
    }
    catch {
      return;
    }


    const filename = file.replace(/\\/g, '/');
    const name = filename.substring(filename.indexOf('specification/'));
    const swaggerUri = `mem://${name}`;
    const oai3Uri = `mem://oai3.yaml`;
    console.log(`      ${name}`);

    const oai3 = JSON.stringify(await convertOAI2toOAI3(swaggerGraph));

    const map = new Map<string, string>([[swaggerUri, swagger], [oai3Uri, oai3]]);
    const mfs = new datastore.MemoryFileSystem(map);

    const cts: datastore.CancellationTokenSource = { cancel() { }, dispose() { }, token: { isCancellationRequested: false, onCancellationRequested: <any>null } };
    const ds = new datastore.DataStore(cts.token);
    const scope = ds.GetReadThroughScope(mfs);
    const swaggerDataHandle = await scope.Read(swaggerUri);
    const originalDataHandle = await scope.Read(oai3Uri)

    assert(swaggerDataHandle != null);
    assert(originalDataHandle != null);

    if (swaggerDataHandle && originalDataHandle) {
      const swag = swaggerDataHandle.ReadObject();
      const original = originalDataHandle.ReadObject();
      const convert = new Oai2ToOai3(swaggerUri, swag);

      // run the conversion
      convert.convert();

      // const swaggerAsText = FastStringify(convert.generated);
      // console.log(swaggerAsText);

      // assert.deepStrictEqual({ a: 1 }, { a: '1' });
      assert.deepStrictEqual(convert.generated, original, `${file} - conversion should be identical`);
    }
  }

  async testFolder(folder: string) {
    const all = new Array<Promise<void>>();
    for (const each of await aio.readdir(folder)) {
      const fullPath = resolve(folder, each);
      if (await aio.isDirectory(fullPath)) {
        await this.testFolder(fullPath);
        // all.push(this.testFolder(fullPath));
      } else {
        await this.testEachfile(fullPath);
        // all.push();
      }
    }
    /*()
    try {
      await Promise.all(all);
    } catch (E) {
      console.log(E);
    }*/
  }


  @test  async 'test conversion - Azure'() {

    if (!aio.isDirectory('/tmp/azure-rest-api-specs')) {
      return;
    }
    await this.testFolder('/tmp/azure-rest-api-specs/specification');


  }
}
