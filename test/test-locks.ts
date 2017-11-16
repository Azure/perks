import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as assert from "assert";

import { CriticalSection, Mutex, SharedLock, ManualPromise, Delay, Async } from "../main"

@suite class TestLocks {
  @test async "CriticalSection"() {

    const cs = new CriticalSection();

    const status = new Array<string>();

    const first = Async(async () => {
      const r = await cs.acquire();
      console.log("1. acquired");
      status.push("A");
      await Delay(200);
      console.log("2. releasing")
      status.push("B");
      await r();
      console.log("3.released")
      status.push("C");
    })

    const second = Async(async () => {
      const r = await cs.acquire();
      console.log("4. acquired");
      status.push("D");
      await Delay(10);
      console.log("5. releasing")
      status.push("E");
      await r();
      console.log("6.released")
      status.push("F");

    })

    await Promise.all([first, second]);

    assert.equal(status.join(""), "ABCDEF", "Correct Order.")
  }

  @test async "Mutex"() {

    const status = new Array<string>();

    const first = Async(async () => {
      const mutex = new Mutex("garrett");
      const r = await mutex.acquire();
      console.log("1. acquired");
      status.push("A");
      await Delay(200);
      console.log("2. releasing")
      status.push("B");
      await r();
      console.log("3.released")
      status.push("C");
    })

    const second = Async(async () => {
      try {
        const mutex = new Mutex("garrett");
        const r = await mutex.acquire();
        console.log("4. acquired");
        status.push("D");
        await Delay(10);
        console.log("5. releasing")
        status.push("E");
        await r();
        console.log("6.released")
        status.push("F");

      } catch (E) {
        console.log(E);
      }
    }, 1)

    await Promise.all([first, second]);
    assert.equal(status.join(""), "ABCDEF", "Correct Order.")
  }

  @test async "SharedLock-simple"() {
    const sharedLock = new SharedLock("/tmp/testJqqE6h/install-pkguByBYI/echo-cli@1.0.8/bla/bla/bla");
    const release = await sharedLock.acquire();
    try {
      console.log("\n\n\nactive lock count====")
      assert.equal(await sharedLock.activeLockCount, 1, "should be one active lock")

      console.log("\n\n\nIs Exclusive====")
      assert.equal(await sharedLock.isExclusiveLocked, false, "should not be exclusive");
      const ex_release = await sharedLock.exclusive();
      assert.equal(await sharedLock.isExclusiveLocked, true, "should be exclusive");

      const anotherShared = new SharedLock("/tmp/testJqqE6h/install-pkguByBYI/echo-cli@1.0.8/bla/bla/bla");
      let success = false;
      try {
        await anotherShared.acquire(2)
      } catch {
        success = true;
      }
      assert.equal(success, true, "should not be able to get shared lock");

      await ex_release();

      success = false;
      try {
        await (await anotherShared.acquire(2))()
        success = true;
      } catch {
        success = false;
      }
      assert.equal(success, true, "should be able to get shared lock");


    } finally {
      await release();
    }


  }
}