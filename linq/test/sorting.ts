import { suite, test, slow, timeout, skip, only } from 'mocha-typescript';
import * as assert from 'assert';
import { sort } from '../sort';

@suite class SortTest {

  @test async 'numbers'() {

    assert.deepStrictEqual(sort.numericly.ascendingInvalidLast(['x', 5, 4, 0, 3, 2, 1, 'x'], each => typeof each === 'number' ? each : undefined), [0, 1, 2, 3, 4, 5, 'x', 'x'], "Numbers ascendingInvalidLast ")
    assert.deepStrictEqual(sort.numericly.descendingInvalidLast(['x', 3, 4, 0, 5, 2, 1, 'x'], each => typeof each === 'number' ? each : undefined), [5, 4, 3, 2, 1, 0, 'x', 'x'], "Number descendingInvalidLast")

    assert.deepStrictEqual(sort.numericly.ascendingInvalidFirst(['x', 5, 4, 0, 3, 2, 1, 'x'], each => typeof each === 'number' ? each : undefined), ['x', 'x', 0, 1, 2, 3, 4, 5], "Numbers ascendingInvalidFirst")
    assert.deepStrictEqual(sort.numericly.descendingInvalidFirst(['x', 3, 4, 0, 5, 2, 1, 'x'], each => typeof each === 'number' ? each : undefined), ['x', 'x', 5, 4, 3, 2, 1, 0], "Numbers descendingInvalidFirst")

    assert.deepStrictEqual(sort.textually.ascendingInvalidLast([undefined, 'Z', 'B', 'C', 'D', 'E', undefined], each => each), ['B', 'C', 'D', 'E', 'Z', undefined, undefined], "Strings ascendingInvalidLast")
    assert.deepStrictEqual(sort.textually.descendingInvalidLast([undefined, 'Z', 'B', 'C', 'D', 'E', undefined], each => each), ['Z', 'E', 'D', 'C', 'B', undefined, undefined], "Strings descendingInvalidLast")

    // todo: come revisit these, as undefined values go to the end.
    //assert.deepStrictEqual(sort.textually.ascendingInvalidFirst([undefined, 'Z', 'B', 'C', 'D', 'E', undefined], each => each), [undefined, undefined, 'B', 'C', 'D', 'E', 'Z'], "Strings ascendingInvalidFirst")
    //assert.deepStrictEqual(sort.textually.descendingInvalidFirst([undefined, 'Z', 'B', 'C', 'D', 'E', undefined], each => each), [undefined, undefined, 'Z', 'E', 'D', 'C', 'B'], "Strings descendingInvalidFirst")

  }
}
