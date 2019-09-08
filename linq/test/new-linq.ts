import { suite, test, slow, timeout, skip, only } from 'mocha-typescript';
import * as assert from 'assert';
import { values, length, } from '../new-linq';

@suite class NewLinq {

  private anArray = ['A', 'B', 'C', 'D', 'E'];

  @test async 'distinct'() {

    const items = ['one', 'two', 'two', 'three'];
    const distinct = values(items).distinct().toArray();
    assert.equal(length(distinct), 3);

    const dic = {
      happy: 'hello',
      sad: 'hello',
      more: 'name',
      maybe: 'foo',
    };

    const result = values(dic).distinct().toArray();
    assert.equal(length(distinct), 3);
  }

  @test async 'iterating thru collections'() {
    // items are items.
    assert.equal([...values(this.anArray)].join(','), this.anArray.join(','));

    assert.equal(values(this.anArray).count(), 5);

  }


}

