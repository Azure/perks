import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as assert from "assert";
import { While, CriticalSection } from "../main";

@suite class TestFunctions {
  @test async "Test While"() {
    let i = 10;
    await While(() => --i ? true : false);
    assert.equal(i, 0, "While should run until condition is false.")
  }
}