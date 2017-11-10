/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export class Lazy<T> {
  private promise: { obj: T } | null = null;

  public constructor(private factory: () => T) {
  }

  public get Value(): T {
    if (this.promise === null) {
      this.promise = { obj: this.factory() };
    }
    return this.promise.obj;
  }
}