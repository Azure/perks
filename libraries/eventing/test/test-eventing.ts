import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as tasks from '@azure/tasks'
import * as assert from "assert";

import { IEvent, EventEmitter } from "../main";

export class MyClass extends EventEmitter {

  @EventEmitter.Event public Debug!: IEvent<MyClass, string>;

  public go() {
    this.Debug.Dispatch("Hello");
  }
}

@suite class Eventing {

  @test async "Do Events Work"() {
    let instance = new MyClass();
    let worksWithSubscribe = "no";
    let worksLikeNode = "no"

    instance.on("Debug", (inst: MyClass, s: string) => {
      worksLikeNode = s;
    })

    var unsub = instance.Debug.Subscribe((instance, args) => {
      worksWithSubscribe = args;
    });

    instance.go();

    // test out subscribe
    assert.equal(worksLikeNode, "Hello");
    assert.equal(worksWithSubscribe, "Hello");

    // test out unsubscribe      
    worksWithSubscribe = "no";
    unsub();

    assert.equal(worksWithSubscribe, "no");
  }
}
