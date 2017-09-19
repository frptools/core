import { assert } from 'chai';
import {
  Comparable,
  isComparable,
  compare
} from '../src';

class Jug implements Comparable {
  constructor (public volume: number) { }
  '@@compare' (other: Jug): number {
    return this.volume - other.volume;
  }
}

suite('[Comparable]', () => {
  suite('isComparable()', () => {
    test('returns true if the argument implements Comparable', () => {
      assert.isTrue(isComparable(new Jug(1)));
    });

    test('returns false if the argument does not implement Comparable', () => {
      assert.isFalse(isComparable({ volume: 1 }));
    });
  });

  suite('compare()', () => {
    test('return the result of comparing the first argument to the second', () => {
      var large = new Jug(10);
      var small = new Jug(5);
      var small2 = new Jug(5);
      assert.strictEqual(compare(large, small), 5);
      assert.strictEqual(compare(small, large), -5);
      assert.strictEqual(compare(small, small2), 0);
    });
  });
});