/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { OutstandingTaskAlreadyCompletedException, AggregateException } from './exception';

export class OutstandingTaskAwaiter {
  private locked: boolean = false;
  private outstandingTasks: Array<Promise<any>> = [];
  private errors: Array<any> = [];

  public async Wait(): Promise<void> {
    this.locked = true;
    await Promise.all(this.outstandingTasks);
    if (this.errors.length) {
      if (this.errors.length == 1) {
        throw this.errors[0];
      }
      throw new AggregateException(this.errors);
    }
  }

  public async Await<T>(task: Promise<T>): Promise<T> {
    if (this.locked) {
      throw new OutstandingTaskAlreadyCompletedException();
    }
    this.outstandingTasks.push(task.catch((e) => {
      // console.error("Yes. errors in the await.")
      this.errors.push(e);
    }));

    return task;
  }
}