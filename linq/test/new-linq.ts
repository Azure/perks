import { suite, test } from '@testdeck/mocha';
import * as assert from 'assert';
import { length, linq } from '../new-linq';

@suite class NewLinq {

  private anArray = ['A', 'B', 'C', 'D', 'E'];

  @test async 'distinct'() {

    const items = ['one', 'two', 'two', 'three'];
    const distinct = linq.values(items).distinct().toArray();
    assert.equal(length(distinct), 3);

    const dic = {
      happy: 'hello',
      sad: 'hello',
      more: 'name',
      maybe: 'foo',
    };

    const result = linq.values(dic).distinct().toArray();
    assert.equal(length(distinct), 3);
  }

  @test async 'iterating thru collections'() {
    // items are items.
    assert.equal([...linq.values(this.anArray)].join(','), this.anArray.join(','));

    assert.equal(linq.values(this.anArray).count(), 5);

  }


}
