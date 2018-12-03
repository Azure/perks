import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as assert from "assert";
import * as aio from "@microsoft.azure/async-io"
import * as datastore from '@microsoft.azure/datastore';
import { stringify, CancellationToken, FastStringify } from "@microsoft.azure/datastore";
import { SourceMapGenerator } from 'source-map';

require('source-map-support').install();

import { Oai2ToOai3 } from '../main';

@suite class MyTests {

  @test  async "test conversion - simple"() {
    const swaggerUri = 'mem://swagger.yaml';
    const oai3Uri = 'mem://oai3.yaml';

    const swagger = await aio.readFile(`${__dirname}/../../test/resources/conversion/swagger.yaml`);
    const oai3 = await aio.readFile(`${__dirname}/../../test/resources/conversion/openapi.yaml`);

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

      assert.deepEqual(convert.generated, original, "Should be the same");
    }
  }

  @test  async "test conversion - ApiManagementClient"() {
    const swaggerUri = 'mem://ApiManagementClient-swagger.json';
    const oai3Uri = 'mem://ApiManagementClient-oai3.json';

    const swagger = await aio.readFile(`${__dirname}/../../test/resources/conversion/ApiManagementClient-swagger.json`);
    const oai3 = await aio.readFile(`${__dirname}/../../test/resources/conversion/ApiManagementClient-openapi.json`);

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

      assert.deepEqual(convert.generated, original, "Should be the same");
    }
  }

  /* @test */ async "test conversion with sourcemap"() {
    const absoluteUri = 'swagger.yaml';

    const swagger = await aio.readFile(`${__dirname}/../../test/resources/conversion/swagger.yaml`);
    const map = new Map<string, string>([[absoluteUri, swagger]]);
    const mfs = new datastore.MemoryFileSystem(map);

    const cts: datastore.CancellationTokenSource = {
      cancel() { },
      dispose() {

      },
      token: {
        isCancellationRequested: false,
        onCancellationRequested: <any>null
      }

    };
    const ds = new datastore.DataStore(cts.token);
    const scope = ds.GetReadThroughScope(mfs);
    const files = await scope.Enum();
    console.log(files);
    const swaggerdata = await scope.Read(`file:///${absoluteUri}`);

    assert(swaggerdata != null);
    if (swaggerdata) {
      const swag = swaggerdata.ReadObject();

      const convert = new Oai2ToOai3(swaggerdata.key, swag);
      const result = convert.convert();

      const sink = ds.getDataSink();
      const text = FastStringify(convert.generated);
      console.log(text);
      const data = await sink.WriteData('output-file', text, [absoluteUri], 'yaml-file', convert.mappings, [swaggerdata]);

      console.log(JSON.stringify(data.metadata.sourceMap.Value));
      await aio.writeFile("c:/tmp/swagger.yaml", swagger);
      await aio.writeFile("c:/tmp/output.yaml", text);
      await aio.writeFile("c:/tmp/output.yaml.map", JSON.stringify(data.metadata.sourceMap.Value));
    }
  }
}