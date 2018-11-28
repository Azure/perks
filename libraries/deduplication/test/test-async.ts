import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as assert from "assert";
import { Deduplicator } from "../main";
import * as datastore from '@microsoft.azure/datastore';
import * as aio from "@microsoft.azure/async-io";

@suite class DeduplicatorTest {

  @test async "schemas deduplication"() {

    const file1 = JSON.parse(await aio.readFile(`${__dirname}../../../test/resources/input.yaml`));
    const deduplicator = new Deduplicator(file1);
    console.log(JSON.stringify(deduplicator.output, null, 4));
    console.log(JSON.stringify(deduplicator.mappings, null, 4));

  }
}