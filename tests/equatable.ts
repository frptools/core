import {assert} from 'chai';
import {
  Equatable,
  isEquatable,
  isEqual
} from '../src';

class Person implements Equatable {
  constructor(public name: string) {}
  '[@equals]'(other: Animal|Person): boolean {
    return !!other && this.name === other.name;
  }

  [Symbol.iterator](): Iterator<string> {
    return [this.name][Symbol.iterator]();
  }
}

class Animal implements Equatable {
  constructor(public name: string) {}
  '[@equals]'(other: Animal|Person): boolean {
    return !!other && this.name === other.name;
  }

  [Symbol.iterator](): Iterator<string> {
    return [this.name][Symbol.iterator]();
  }
}

suite('[Equatable]', () => {
  suite('isEquatable()', () => {
    test('returns true if the argument implements Equatable', () => {
      assert.isTrue(isEquatable(new Person('Bob')));
    });

    test('returns false if the argument does not implement Equatable', () => {
      assert.isFalse(isEquatable({name: 'Bob'}));
    });
  });

  suite('isEqual()', () => {
    test('returns true if the two arguments are equivalent according to their respective implementations of Equatable', () => {
      const bob1 = new Person('Bob');
      const bob2 = new Person('Bob');
      const bob3 = new Animal('Bob');
      assert.isTrue(isEqual(bob1, bob2));
      assert.isTrue(isEqual(bob1, bob3));
    });

    test('returns false if the two arguments are not equivalent according to their respective implementations of Equatable', () => {
      const bob = new Person('Bob');
      const sam = new Person('Sam');
      const jane = new Person('Jane');
      assert.isFalse(isEqual(bob, sam));
      assert.isFalse(isEqual(bob, jane));
      assert.isFalse(isEqual(sam, jane));
    });
  });
});