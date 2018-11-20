import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as assert from "assert";
import { areSimilar } from "../main";

@suite class ObjectDeepComparison {

  @test async "ES6 primitives testing"() {
    assert.strictEqual(areSimilar(null, {}), false);
    assert.strictEqual(areSimilar(undefined, {}), false);
    assert.strictEqual(areSimilar('a', ['a']), false);
    assert.strictEqual(areSimilar('a', { 0: 'a' }), false);
    assert.strictEqual(areSimilar(1, {}), false);
    assert.strictEqual(areSimilar(true, {}), false);
  }
}