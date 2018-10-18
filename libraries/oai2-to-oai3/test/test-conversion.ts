import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as assert from "assert";
import * as aio from "@microsoft.azure/async-io"
import * as datastore from '@microsoft.azure/datastore';
import { stringify, CancellationToken, FastStringify } from "@microsoft.azure/datastore";
import { SourceMapGenerator } from 'source-map';

require('source-map-support').install();

import { Oai2ToOai3 } from '../main';

@suite class MyTests {

  @test async "test conversion"() {
    const absoluteUri = 'mem://swagger.yaml';

    const swagger = await aio.readFile(`${__dirname}../../../test/resources/conversion/swagger.yaml`);
    const map = new Map<string, string>([[absoluteUri, swagger]]);
    const mfs = new datastore.MemoryFileSystem(map);

    const cts: datastore.CancellationTokenSource = { cancel() { }, dispose() { }, token: { isCancellationRequested: false, onCancellationRequested: <any>null } };
    const ds = new datastore.DataStore(cts.token);
    const scope = ds.GetReadThroughScope(mfs);
    const swaggerDataHandle = await scope.Read(absoluteUri);

    assert(swaggerDataHandle != null);
    if (swaggerDataHandle) {
      const swag = swaggerDataHandle.ReadObject();
      const convert = new Oai2ToOai3(absoluteUri, swag);

      // run the conversion
      convert.convert();

      const text = FastStringify(convert.generated);
      console.log(text);


    }

  }

  /* do not look!
  @test async "test conversion"() {
    const absoluteUri = 'mem://swagger.yaml';

    const swagger = await aio.readFile(`${__dirname}../../../test/resources/conversion/swagger.yaml`);
    const map = new Map<string, string>([[absoluteUri, swagger]]);
    const mfs = new datastore.MemoryFileSystem(map);



    const cts: datastore.CancellationTokenSource = {
      cancel() {

      },
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

    const swaggerdata = await scope.Read(absoluteUri);

    assert(swaggerdata != null);
    if (swaggerdata) {
      const swag = swaggerdata.ReadObject();
      const convert = new Oai2ToOai3(absoluteUri, swag);
      const result = convert.convert();


      const sink = ds.getDataSink();
      const text = FastStringify(convert.generated);
      console.log(text);
      const data = await sink.WriteData('output-file', FastStringify(convert.generated), 'yaml-file', convert.mappings, [swaggerdata]);
      console.log(data.ReadMetadata())

    }


    // const convert = new Oai2ToOai3("swagger.yaml", swagger);



  }
*/
}