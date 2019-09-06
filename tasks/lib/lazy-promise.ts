/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export class LazyPromise<T> implements Promise<T> {
  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this.Value.finally(onfinally);
  }
  private promise: Promise<T> | null = null;

  public constructor(private factory: () => Promise<T>) {
  }

  private get Value(): Promise<T> {
    if (this.promise === null) {
      this.promise = this.factory();
    }
    return this.promise;
  }

  get [Symbol.toStringTag]() {
    return this.Value[Symbol.toStringTag];
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    return this.Value.then(onfulfilled, onrejected);
  }
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
    return this.Value.catch(onrejected);
  }

}
