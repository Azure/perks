/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Server } from 'net';
import { ManualPromise } from "./manual-promise"
import { Delay, When } from "./task-functions"
import { ExclusiveLockUnavailableException, SharedLockUnavailableException } from "./exception"
import { promisify } from "./node-promisify";
import { tmpdir } from "os"
import { unlink as fs_unlink, readFile as fs_readFile, writeFile as fs_writeFile } from 'fs';

const unlink = promisify(fs_unlink);
const readFile = promisify(fs_readFile);
const writeFile = promisify(fs_writeFile);

function sanitize(input: string, replacement: string = '_') {
  const illegalCharacters = /[\/\?<>\\:\*\|":]/g;
  const controlCharacters = /[\x00-\x1f\x80-\x9f]/g;
  const reservedCharacters = /^\.+$/;
  const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  const trailingSpaces = /[\. ]+$/;

  return input
    .replace(illegalCharacters, replacement)
    .replace(controlCharacters, replacement)
    .replace(reservedCharacters, replacement)
    .replace(reservedNames, replacement)
    .replace(trailingSpaces, replacement);
}

/**
 * An interface for Exclusive Locking objects.
 */
export interface IExclusive {

  /**
   * Acquire an exclusive lock to the resource.
   * 
   * @throws ExclusiveLockUnavailableException - if the timeout is reached before the lock can be acquired.
   * @param timeoutMS - the length of time in miliiseconds to wait for a lock.
   * @param delayMS - the length of time in milliseconds to retry the lock.
   * @returns - the release function to release the lock.
   */
  acquire(timeoutMS?: number, delayMS?: number): Promise<() => Promise<void>>;
}

/**
 * An system-wide Exclusive lock for a named resource. 
 * 
 * This is implemented using an exclusive named pipe.
 */
export class Mutex implements IExclusive {
  /*@internal*/public readonly pipe: string;

  /**
   * 
   * @param name - the resource name to create a Mutex for. Multiple instances (across processes) using the same name are operating on the same lock.
   */
  public constructor(private name: string) {
    this.pipe = `\\\\?\\pipe\\${name}`;
  }

  /**
   * Asynchronously acquires the lock. Will wait for up {@link timeoutMS} milliseconds
   * @throws ExclusiveLockUnavailableException - if the timeout is reached before the lock can be acquired.
   * @param timeoutMS - the length of time in miliiseconds to wait for a lock.
   * @param delayMS - the length of time in milliseconds to retry the lock.
   * @returns - the release function to release the lock.
   */
  public async acquire(timeoutMS: number = 20000, delayMS: number = 50): Promise<() => Promise<void>> {
    const fail = Date.now() + timeoutMS;
    do {
      try {
        // try to get the lock to the pipe
        const server = new Server();

        // possible events after listen
        const completed = When(server, 'listening', 'error');

        // listening will trigger when we've acquired the pipe handle 
        server.listen({ path: this.pipe, exclusive: true });

        // wait to see if we can listen to the pipe or fail trying.
        await completed;

        // yes, we did, setup the release function
        const done = new ManualPromise<void>();

        // the release function is returned to the consumer
        return async () => {
          // ensure that releasing twice isn't harmful.
          if (!done.isCompleted) {
            server.close(() => done.resolve());
            await done;
          }
        };
      } catch {
        // not really releavent why it failed. Pause for a moment.
        await Delay(delayMS);
      }

      // check if we're past the allowable time.
    } while (fail > Date.now())

    // we were unable to get the lock before the timeout. 
    throw new ExclusiveLockUnavailableException(this.name, timeoutMS);
  }
}

/**
 * A process-local exclusive lock, bound to the object instance.
 */
export class CriticalSection implements IExclusive {
  private promise: ManualPromise<void> | undefined;

  /**
   * @constructor - Creates an instance of a CriticalSection
   * 
   * @param name - a cosmetic name for the 'resource'. Note: multiple CriticalSection instances with the same do not offer exclusivity, it's tied to the object instance.
   */
  public constructor(private name: string = "unnamed") {
  }

  /**
   * Asynchronously acquires the lock. Will wait for up {@link timeoutMS} milliseconds
   * @throws ExclusiveLockUnavailableException - if the timeout is reached before the lock can be acquired.
   * @param timeoutMS - the length of time in miliiseconds to wait for a lock.
   * @param delayMS - unused.
   * @returns - the release function to release the lock.
   */
  public async acquire(timeoutMS: number = 20000, delayMS: number = 50): Promise<() => Promise<void>> {
    // delayMS isn't really relavent in this case, since all aqui
    const fail = Date.now() + timeoutMS;

    if (this.promise) {
      do {
        // wait for its release, or we use up what's left of the timeout.
        // since multiple consumers can be waiting for the promise to fulfil, 
        // the previous promise holder can resolve, someone else can take it's place 
        // before we get a chance to act.
        await Promise.race([this.promise, Delay(fail - Date.now())]);
      } while (this.promise && fail > Date.now())
    }
    // check to see if the promise is still around, which indicates
    // that we must have timed out.
    if (this.promise) {
      throw new ExclusiveLockUnavailableException(this.name, timeoutMS);
    }

    // there is no outstanding promise now, we can create one
    const myPromise = new ManualPromise<void>();
    this.promise = myPromise;

    // the release function is returned to the consumer
    return async () => {
      // ensure that releasing twice isn't harmful.
      if (!myPromise.isCompleted) {
        this.promise = undefined
        myPromise.resolve();
      }
    };
  }
}


/**
 * Offers a lock where many consumers can acquire, but an exclusive lock can only be gained if 
 * the consumer is the only one who has a shared lock.
 */
export class SharedLock {
  private readonly exclusiveLock: Mutex;
  private readonly personalLock: Mutex;
  private readonly file: string;

  public constructor(private name: string) {
    this.exclusiveLock = new Mutex(`${sanitize(name)}.exclusive-lock`);
    this.personalLock = new Mutex(`${sanitize(name)}.${Math.random() * 10000}.personal-lock`);

    this.file = `${tmpdir()}/${sanitize(name)}.lock`;
  }

  private async readNames(): Promise<Array<string>> {
    // get the list of names.
    let results = new Array<string>();
    try {
      const list = JSON.parse(await readFile(this.file, 'utf8'));
      for (const each of list) {
        if (await this.isLocked(each)) {
          results.push(each);
        }
      }
    } catch {
    }

    return results;
  }

  private async writeNames(names: Array<string>): Promise<void> {
    // write the list of names.
    if (names && names.length > 0) {
      // write the list of names into the file.
      await writeFile(this.file, JSON.stringify(names, null, 2));
    } else {
      try {
        // no names in list, file should be deleted
        await unlink(this.file)
      } catch {
        // shh! 
      }
    }
  }

  private async isLocked(lockName: string): Promise<boolean> {
    try {
      const server = new Server();

      // possible events after listen
      const completed = When(server, 'listening', 'error');

      // listening will trigger when we've acquired the pipe handle 
      server.listen({ path: lockName, exclusive: true });

      // wait to see if we can listen to the pipe or fail trying.
      await completed;

      // the pipe opened! It's not locked
      await server.close()
      return false;
    } catch {
    }
    // the pipe is locked
    return true;
  }

  /**
  * Asynchronously acquires a shared lock. Will wait for up {@link timeoutMS} milliseconds
  * @throws SharedLockUnavailableException - if the timeout is reached before the lock can be acquired.
  * @param timeoutMS - the length of time in miliiseconds to wait for a lock.
  * @param delayMS - the polling interval for the exclusive lock during initialization.
  * @returns - the release function to release the shared lock.
  */
  public async acquire(timeoutMS: number = 20000, delayMS: number = 50): Promise<() => Promise<void>> {
    // ensure we're the only one that can muck with things for now.
    const done = await this.exclusiveLock.acquire(timeoutMS, delayMS);
    try {
      // get our personal lock
      const personal = await this.personalLock.acquire();

      const activeLocks = await this.readNames();

      activeLocks.push(this.personalLock.pipe);

      await this.writeNames(activeLocks);

      await done();
      return async () => {
        // release our personal lock
        await personal();

        // try to remove our name from the list 
        try {
          const release = await this.exclusiveLock.acquire(timeoutMS, delayMS);
          try {
            await this.writeNames(await this.readNames());
          } finally {
            // regardless, release the exclusive lock!
            await release();
          }

        } catch {
          // if it fails no, worry, someone else can clean it up.
        }
      }
    } catch (e) {
      throw new SharedLockUnavailableException(this.name, timeoutMS);
    } finally {
      // release the exclusive lock!
      await done();
    }
  }

  public get activeLockCount(): Promise<number> {
    return (async () => {
      return (await this.readNames()).length;
    })();
  }

  public get isExclusiveLocked(): Promise<boolean> {
    return (async () => {
      try {
        // try to lock it
        await (await this.exclusive(9))();
        return false;
      } catch {
      }
      return true;
    })();
  }

  /**
   * Asynchronously acquires an exclusive lock. Will wait for up {@link timeoutMS} milliseconds
   * 
   * Will only permit a lock if there are no other shared locks 
   * 
   * @throws ExclusibveLockUnavailableException - if the timeout is reached before the lock can be acquired.
   * @param timeoutMS - the length of time in miliiseconds to wait for a lock.
   * @param delayMS - the polling interval for the exclusive lock during initialization.
   * @returns - the release function to release the exclusive lock.
   */
  public async exclusive(timeoutMS: number = 20000, delayMS: number = 50): Promise<() => Promise<void>> {
    // ensure we're the only one that can muck with things for now.
    const done = await this.exclusiveLock.acquire(timeoutMS, delayMS);

    try {
      // make sure we're the only one who has an shared lock
      const activeLocks = await this.readNames();
      if (activeLocks.length === 0 || (activeLocks.length === 1 && activeLocks[0] === this.personalLock.pipe)) {
        return done;
      }

    } catch {

    }
    // we didn't return the exclusive Lock, 
    // release it and throw...
    await done();

    throw new ExclusiveLockUnavailableException(this.name, timeoutMS);
  }
}