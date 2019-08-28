import { suite, test, slow, timeout, skip, only } from 'mocha-typescript';
import * as assert from 'assert';
import { While, CriticalSection, Async } from '../main';

// pull in source-map support for stack traces.
require('source-map-support').install({ hookRequire: true });


@suite class TestFunctions {
  @test async 'Test While'() {
    let i = 10;
    await While(() => --i ? true : false);
    assert.equal(i, 0, 'While should run until condition is false.');
  }

  @test async 'Async'() {
    let x = 0;

    const done = Async(() => {
      x = 100;
    });

    assert.equal(x, 0, 'should not run async until after this point.');

    await done;

    assert.equal(x, 100, 'it should have run it.');
  }
}