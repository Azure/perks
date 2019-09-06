/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Exception } from '@azure-tools/tasks';
import * as events from 'events';

export class UnintializedPromiseException extends Exception {
  constructor(message = 'Promise was not initialized prior to use.', public exitCode: number = 1) {
    super(message, exitCode);
    Object.setPrototypeOf(this, UnintializedPromiseException.prototype);
  }
}

export interface IEvent<TSender extends events.EventEmitter, TArgs> {
  Subscribe(fn: (sender: TSender, args: TArgs) => void): () => void;
  Unsubscribe(fn: (sender: TSender, args: TArgs) => void): void;
  Dispatch(args: TArgs): void;
}

export class EventDispatcher<TSender extends EventEmitter, TArgs> implements IEvent<TSender, TArgs> {
  private _instance: TSender;
  private _name: string;
  private _subscriptions = new Array<() => void>();

  constructor(instance: TSender, name: string) {
    this._instance = instance;
    this._name = name;
  }

  UnsubscribeAll() {
    // call all the unsubscribes
    for (const each of this._subscriptions) {
      each();
    }
    // and clear the subscriptions.
    this._subscriptions.length = 0;
  }

  Subscribe(fn: (sender: TSender, args: TArgs) => void): () => void {
    if (fn) {
      this._instance.addListener(this._name, fn);
    }
    const unsub = () => { this.Unsubscribe(fn); };
    this._subscriptions.push(unsub);
    return unsub;
  }

  Unsubscribe(fn: (sender: TSender, args: TArgs) => void): void {
    if (fn) {
      this._instance.removeListener(this._name, fn);
    }
  }

  Dispatch(args: TArgs): void {
    this._instance.emit(this._name, this._instance, args);
  }
}

export class EventEmitter extends events.EventEmitter {
  private _subscriptions: Map<string, any> = new Map();

  constructor() {
    super();
    this._init(this);
  }

  protected static Event<TSender extends EventEmitter, TArgs>(target: TSender, propertyKey: string) {
    const init = target._init;
    target._init = (instance: TSender) => {
      const i = instance;
      // call previous init
      init.bind(instance)(instance);

      instance._subscriptions.set(propertyKey, new EventDispatcher<TSender, TArgs>(instance, propertyKey));

      const prop: PropertyDescriptor = {
        enumerable: true,
        get: () => {
          return instance._subscriptions.get(propertyKey);
        }
      };
      Object.defineProperty(instance, propertyKey, prop);
    };
  }

  protected _init(t: EventEmitter) {
  }
}

export class EventEmitterPromise<T> extends EventEmitter implements Promise<T> {
  public constructor(private promise: Promise<T> | undefined) {
    super();
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    if (!this.promise) {
      throw new UnintializedPromiseException();
    }
    return this.promise.finally(onfinally);
  }

  public initialize(promise: Promise<T>) {
    this.promise = promise;
    return this;
  }

  get [Symbol.toStringTag]() {
    if (!this.promise) {
      throw new UnintializedPromiseException();
    }
    return this.promise[Symbol.toStringTag];
  }
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    if (!this.promise) {
      throw new UnintializedPromiseException();
    }
    return this.promise.then(onfulfilled, onrejected);
  }
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
    if (!this.promise) {
      throw new UnintializedPromiseException();
    }
    return this.promise.catch(onrejected);
  }
}
export type Subscribe = (instance: Progress) => void;

export class Progress extends EventEmitter {
  @EventEmitter.Event public Progress!: IEvent<Progress, number>;
  @EventEmitter.Event public End!: IEvent<Progress, null>;
  @EventEmitter.Event public Start!: IEvent<Progress, null>;
  @EventEmitter.Event public Message!: IEvent<Progress, string>;

  private started = false;

  public constructor(initialize: Subscribe) {
    super();
    if (initialize) {
      initialize(this);
    }
  }

  public NotifyProgress(percent: number) {
    if (!this.started) {
      this.started = true;
      this.Start.Dispatch(null);
    }
    this.Progress.Dispatch(percent);
  }

  public NotifyEnd() {
    this.End.Dispatch(null);
  }

  public NotifyMessage(text: string) {
    this.Message.Dispatch(text);
  }
}
