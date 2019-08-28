/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Server, ListenOptions } from 'net';
import { ManualPromise } from './manual-promise';
import { Delay, When } from './task-functions';
import { ExclusiveLockUnavailableException, SharedLockUnavailableException } from './exception';
import { promisify } from './node-promisify';
import { tmpdir } from 'os';
import { unlink as fsUnlink, readFile as fsReadFile, writeFile as fsWriteFile } from 'fs';
import { createHash } from 'crypto';

const unlink = promisify(fsUnlink);
const readFile = promisify(fsReadFile);
const writeFile = promisify(fsWriteFile);

/* eslint-disable */

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
function distill(content: any) {
  const hash = createHash('sha256').update(JSON.stringify(content)).digest();
  const port = hash.readUInt16BE(2) | 4096; // 4096+
  let host = `${(hash.readUInt16BE(4) | 0x10) + 0x7f000000}`;
  if (process.platform === 'darwin') {
    host = `${0x7f000001}`;
  }
  return { port, host };
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
  /*@internal*/public readonly options: ListenOptions;
  /**
   * 
   * @param name - the resource name to create a Mutex for. Multiple instances (across processes) using the same name are operating on the same lock.
   */
  public constructor(private name: string) {
    if (process.platform === 'win32') {
      this.pipe = `\\\\.\\pipe\\${sanitize(name)}`;
      this.options = { path: this.pipe, exclusive: true };
    } else {
      const pretendName = `${tmpdir()}/pipe_${sanitize(name)}`;
      this.options = { ...distill(pretendName), exclusive: true };
      this.pipe = `${tmpdir()}/pipe_${sanitize(name)}:${this.options.port}`;
    }
  }

  /**
   * Asynchronously acquires the lock. Will wait for up {@link timeoutMS} milliseconds
   * @throws ExclusiveLockUnavailableException - if the timeout is reached before the lock can be acquired.
   * @param timeoutMS - the length of time in miliiseconds to wait for a lock.
   * @param delayMS - the length of time in milliseconds to retry the lock.
   * @returns - the release function to release the lock.
   */
  public async acquire(timeoutMS: number = 20000, delayMS: number = 100): Promise<() => Promise<void>> {
    const fail = Date.now() + timeoutMS;
    do {
      try {
        // try to get the lock to the pipe
        const server = new Server();

        // possible events after listen
        const completed = When(server, 'listening', 'error');

        // listening will trigger when we've acquired the pipe handle 
        server.listen(this.options);

        // don't let this keep the process alive.
        server.unref();

        // wait to see if we can listen to the pipe or fail trying.
        await completed;

        // yes, we did, setup the release function
        const closedServer = new ManualPromise<void>();

        // the release function is returned to the consumer
        return async () => {
          // ensure that releasing twice isn't harmful.
          if (!closedServer.isCompleted) {
            server.close(() => closedServer.resolve());
            await closedServer;
          }
        };
      } catch {
        // not really releavent why it failed. Pause for a moment.
        await Delay(delayMS);
      }
      // check if we're past the allowable time.
    } while (fail > Date.now());

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
  public constructor(private name: string = 'unnamed') {
  }

  /**
   * Asynchronously acquires the lock. Will wait for up {@link timeoutMS} milliseconds
   * @throws ExclusiveLockUnavailableException - if the timeout is reached before the lock can be acquired.
   * @param timeoutMS - the length of time in miliiseconds to wait for a lock.
   * @param delayMS - unused.
   * @returns - the release function to release the lock.
   */
  public async acquire(timeoutMS: number = 20000, delayMS: number = 100): Promise<() => Promise<void>> {
    // delayMS isn't really relavent in this case, since all aqui
    const fail = Date.now() + timeoutMS;

    if (this.promise) {
      do {
        // wait for its release, or we use up what's left of the timeout.
        // since multiple consumers can be waiting for the promise to fulfil, 
        // the previous promise holder can resolve, someone else can take it's place 
        // before we get a chance to act.
        await Promise.race([this.promise, Delay(fail - Date.now())]);
      } while (this.promise && fail > Date.now());
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
        this.promise = undefined;
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
  private readonly busyLock: Mutex;
  private readonly personalLock: Mutex;
  private readonly file: string;

  public constructor(private name: string) {
    this.exclusiveLock = new Mutex(`${sanitize(name)}.exclusive-lock`);
    this.busyLock = new Mutex(`${sanitize(name)}.busy-lock`);
    this.personalLock = new Mutex(`${sanitize(name)}.${Math.random() * 10000}.personal-lock`);

    this.file = `${tmpdir()}/${sanitize(name)}.lock`;
  }

  private async readConnections(): Promise<Array<ListenOptions>> {
    // get the list of names.
    let connections = new Array<ListenOptions>();
    try {
      const list = JSON.parse(await readFile(this.file, 'utf8'));
      for (const each of list) {
        if (await this.isLocked(each)) {
          connections.push(each);
        }
      }
    } catch {
    }

    return connections;
  }

  private async writeConnections(connections: Array<ListenOptions>): Promise<void> {
    // write the list of names.
    if (connections && connections.length > 0) {
      // write the list of names into the file.
      await writeFile(this.file, JSON.stringify(connections, null, 2));
    } else {
      try {
        // no names in list, file should be deleted
        await unlink(this.file);
      } catch {
        // shh! 
      }
    }
  }

  private async isLocked(options: ListenOptions): Promise<boolean> {
    const server = new Server();
    try {
      // possible events after listen
      const completed = When(server, 'listening', 'error');

      // listening will trigger when we've acquired the pipe handle 
      server.listen(options);

      // wait to see if we can listen to the pipe or fail trying.
      await completed;

      // the pipe opened! It's not locked
      await server.close();

      return false;
    } catch {
      server.close();
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
  public async acquire(timeoutMS: number = 20000, delayMS: number = 100): Promise<() => Promise<void>> {
    // ensure we're the only one that can muck with things for now.

    const releaseBusy = await this.busyLock.acquire(timeoutMS, delayMS);
    try {
      // get our personal lock
      const releasePersonal = await this.personalLock.acquire();

      const activeLocks = await this.readConnections();

      activeLocks.push(this.personalLock.options);

      await this.writeConnections(activeLocks);

      await releaseBusy();

      return async () => {
        // release our personal lock
        await releasePersonal();

        // try to remove our name from the list 
        try {
          const releaseBusy = await this.busyLock.acquire(timeoutMS, delayMS);
          try {
            await this.writeConnections(await this.readConnections());
          } finally {
            // regardless, release the busy lock!
            await releaseBusy();
          }

        } catch {
          // if it fails no, worry, someone else can clean it up.
        }
      };
    } catch (e) {
      throw new SharedLockUnavailableException(this.name, timeoutMS);
    } finally {
      // release the busy lock!
      await releaseBusy();
    }
  }

  public get activeLockCount(): Promise<number> {
    return (async () => {
      return (await this.readConnections()).length;
    })();
  }

  public get isExclusiveLocked(): Promise<boolean> {
    return (async () => {
      try {
        // try to lock it
        const release = (await this.exclusive(0));
        await release();
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
  public async exclusive(timeoutMS: number = 20000, delayMS: number = 100): Promise<() => Promise<void>> {

    const busyRelease = await this.busyLock.acquire(timeoutMS, delayMS);

    // ensure we're the only one that can muck with things for now.
    const exclusiveRelease = await this.exclusiveLock.acquire(timeoutMS, delayMS);

    try {
      // make sure we're the only one who has an shared lock
      const activeLocks = await this.readConnections();
      if (activeLocks.length === 0 || (activeLocks.length === 1 && JSON.stringify(activeLocks[0]) === JSON.stringify(this.personalLock.options))) {
        return async () => {
          await exclusiveRelease();
          await busyRelease();
        };
      }
    } catch {

    }
    // we didn't return the exclusive Lock, 
    // release it and throw...
    await exclusiveRelease();
    await busyRelease();

    throw new ExclusiveLockUnavailableException(this.name, timeoutMS);
  }
}
