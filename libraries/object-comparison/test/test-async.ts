import * as assert from 'assert';
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript';
import { areSimilar } from '../main';

@suite class ObjectDeepComparison {

  @test async 'ES6 primitives testing'() {
    // not equal
    assert.strictEqual(areSimilar(null, {}), false);
    assert.strictEqual(areSimilar(undefined, {}), false);
    assert.strictEqual(areSimilar('a', ['a']), false);
    assert.strictEqual(areSimilar(true, false), false);
    assert.strictEqual(areSimilar('a', { 0: 'a' }), false);
    assert.strictEqual(areSimilar(1, {}), false);
    assert.strictEqual(areSimilar(true, {}), false);
    assert.strictEqual(areSimilar(null, undefined), false);
    assert.strictEqual(areSimilar(true, []), false);

    // equal
    assert.strictEqual(areSimilar(true, true), true);
    assert.strictEqual(areSimilar(null, null), true);
    assert.strictEqual(areSimilar(undefined, undefined), true);
    assert.strictEqual(areSimilar(1, 1), true);
    assert.strictEqual(areSimilar('bar', 'bar'), true);
  }

  @test async 'objects and no filter applied'() {
    // similar
    assert.strictEqual(areSimilar({ a: 4 }, { a: 4 }), true);
    assert.strictEqual(areSimilar({ a: 4, b: '2' }, { a: 4, b: '2' }), true);
    assert.strictEqual(areSimilar(['a'], { 0: 'a' }), true);
    assert.strictEqual(areSimilar({ a: 4, b: '1' }, { b: '1', a: 4 }), true); // out of order
    assert.strictEqual(areSimilar({}, {}), true);

    // TBD: is this the right behavior? if not, easy fix: check if one is array and the other is not.
    assert.strictEqual(areSimilar([], {}), true); // treating arrays and objects to be similar if they have similar keys
    assert.strictEqual(areSimilar(['a'], { '0': 'a' }), true); // no distinction between array and object with similar keys
    assert.strictEqual(areSimilar(['a'], { 0: 'a' }), true);

    // not similar
    assert.strictEqual(areSimilar({ a: 4 }, { a: '4' }), false);
    assert.strictEqual(areSimilar({ a: 4 }, { b: '4', c: '2' }), false);
    assert.strictEqual(areSimilar([4], ['4']), false);
    assert.strictEqual(areSimilar({ a: 4 }, { b: '4' }), false);
    assert.strictEqual(areSimilar([1], { 1: '0' }), false);
    assert.strictEqual(areSimilar([0, 1, 2, 3], [3, 2, 1, 0]), false);
  }

  @test async 'objects and with filter applied'() {
    // similar
    assert.strictEqual(areSimilar({ a: 1, b: 2 }, { a: '4', b: 2 }, 'a'), true); // different values 
    assert.strictEqual(areSimilar({ a: 1, b: 2 }, { a: 1 }, 'b'), true); // abscence of key in one object
    assert.strictEqual(areSimilar({}, { a: 1, b: 2, c: 3 }, 'a', 'b', 'c'), true);
    // nested
    assert.strictEqual(areSimilar({ a: 1, b: { a: 4, b: 2 } }, { a: '4', b: { b: 2 } }, 'a'), true);
    assert.strictEqual(areSimilar({ a: 1, b: { c: 4, x: 2 } }, { a: 1, b: { y: 2 } }, 'b'), true); // ignores everything in b

    // not similar
    assert.strictEqual(areSimilar({ a: 1, b: 2 }, { a: 1, c: 12 }, 'b'), false);
    assert.strictEqual(areSimilar({}, { a: 1, b: 2, c: 3, d: 4 }, 'a', 'b', 'c'), false);
    // nested
    assert.strictEqual(areSimilar({ a: 1, b: { a: 4, b: 1000 } }, { a: '4', b: { b: 9999 } }, 'a'), false);
    assert.strictEqual(areSimilar({ a: 1, b: { a: 4, b: 1000 } }, { a: '4', b: { b: 1000, c: 999 } }, 'a'), false);
  }
}
