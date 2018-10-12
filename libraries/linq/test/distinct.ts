import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as assert from "assert";
import { values, length } from '../main';

@suite class MyTests {

  @test async "does distinct work"() {
    const items = ['one', 'two', 'two', 'three'];
    const distinct = values(items).linq.distinct().linq.toArray();

    assert.equal(length(distinct), 3);
  }


}