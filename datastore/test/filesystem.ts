import { suite, test } from '@testdeck/mocha';
import * as assert from 'assert';
import { MemoryFileSystem } from '../main';

@suite class FileSystemTests {

  @test async 'Simple memory filesystem test'() {
    const f = new MemoryFileSystem(new Map<string, string>([['readme.md', '# this is a test\n see https://aka.ms/autorest'], ['other.md', '#My Doc.']]));
    let n = 0;
    for (const name of await f.EnumerateFileUris()) {
      n++;
    }
    assert.equal(n, 2);
    assert.equal(await f.ReadFile(MemoryFileSystem.DefaultVirtualRootUri + 'other.md'), '#My Doc.');
  }
}

