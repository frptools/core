import {assert} from 'chai';
import {
  Hashable,
  isHashable,
  hash,
  hashArray,
  hashArgs,
  combineHash,
  hashObject,
  hashMiscRef,
  hashIterator,
  hashPlainObject,
  hashNumber,
  hashString
} from '../src';

class Person implements Hashable {
  constructor(
    public name: string,
    public age: number
  ) {}

  '@@hash'(): number {
    return this.name.length + this.age;
  }
}

suite('[Hashable]', () => {
  suite('isHashable()', () => {
    test('returns true if the argument implements Hashable', () => {
      assert.isTrue(isHashable(new Person('Bob', 30)));
    });

    test('returns false if the argument does not implement Hashable', () => {
      assert.isFalse(isHashable({name: 'Bob', age: 30}));
    });
  });

  suite('hash()', () => {
    test('returns the same value as hashString() if a string argument is supplied', () => {
      const a = 'a', b = 'abcxyz', c = 'the quick brown fox';
      assert.strictEqual(hash(a), hashString(a));
      assert.strictEqual(hash(b), hashString(b));
      assert.strictEqual(hash(c), hashString(c));
    });

    test('returns the same value as hashNumber() if a numeric argument is supplied', () => {
      const a = 32.23567, b = 128, c = 10000000;
      assert.strictEqual(hash(a), hashNumber(a));
      assert.strictEqual(hash(b), hashNumber(b));
      assert.strictEqual(hash(c), hashNumber(c));
    });

    test('returns the same value as hashObject() if an object argument is supplied', () => {
      const a = [2, 4, 6], b = {a: 128}, c = new Person('Bob', 42), d = new (class Test {});
      assert.strictEqual(hash(a), hashObject(a));
      assert.strictEqual(hash(b), hashObject(b));
      assert.strictEqual(hash(c), hashObject(c));
      assert.strictEqual(hash(d), hashObject(d));
    });
  });

  suite('hashArray()', () => {
    test('returns different hash values for arrays that contain different sequences of values', () => {
      const a = hashArray([22, 'test', {a: true}]);
      const b = hashArray([22, 'TEST', {a: true}]);
      const c = hashArray([22, 'test', {a: true}, null]);
      assert.isNumber(a);
      assert.isNumber(b);
      assert.isNumber(c);
      assert.notStrictEqual(a, b);
      assert.notStrictEqual(a, c);
      assert.notStrictEqual(b, c);
    });

    test('returns the same hash values for arrays that contain equivalent sequences of values', () => {
      const a = hashArray([22, 'test', {a: true, x: 789}]);
      const b = hashArray([22, 'test', {a: true, x: 789}]);
      assert.isNumber(a);
      assert.isNumber(b);
      assert.strictEqual(a, b);
    });
  });

  suite('hashArgs()', () => {
    test('returns different hash values for argument lists that contain different sequences of values', () => {
      const a = hashArgs(22, 'test', {a: true});
      const b = hashArgs(22, 'TEST', {a: true});
      const c = hashArgs(22, 'test', {a: true}, null);
      assert.isNumber(a);
      assert.isNumber(b);
      assert.isNumber(c);
      assert.notStrictEqual(a, b);
      assert.notStrictEqual(a, c);
      assert.notStrictEqual(b, c);
    });

    test('returns the same hash values for argument lists that contain equivalent sequences of values', () => {
      const a = hashArgs(22, 'test', {a: true, x: 789});
      const b = hashArgs(22, 'test', {a: true, x: 789});
      assert.isNumber(a);
      assert.isNumber(b);
      assert.strictEqual(a, b);
    });
  });

  suite('combineHash()', () => {
    test('returns hash values that are different to the input arguments', () => {
      const a = hash('hello');
      const b = hash(123);
      const c = combineHash(a, b);
      const d = combineHash(b, c);
      assert.isNumber(a);
      assert.isNumber(b);
      assert.isNumber(c);
      assert.isNumber(d);
      assert.notStrictEqual(a, b);
      assert.notStrictEqual(a, c);
      assert.notStrictEqual(a, d);
      assert.notStrictEqual(b, c);
      assert.notStrictEqual(b, d);
      assert.notStrictEqual(c, d);
    });
  });

  suite('hashObject()', () => {
    test('uses the custom hash function provided if the argument implements Hashable', () => {
      assert.strictEqual(hashObject(new Person('Bob', 42)), 45);
    });

    test('returns the same value as hashPlainObject() if the argument is a plain object', () => {
      const arg = {a: true, x: 789};
      assert.strictEqual(hashObject(arg), hashPlainObject(arg));
    });

    test('returns the same value as hashArray() if the argument is an array', () => {
      const arg = [2, 'Bob', {a: true}];
      assert.strictEqual(hashObject(arg), hashArray(arg));
    });

    test('returns the same value as hashIterator() if the argument is iterable', () => {
      const arg = new Set([2, 'Bob', {a: true}]);
      assert.strictEqual(hashObject(arg), hashIterator(arg[Symbol.iterator]()));
    });

    test('returns the same value on successive calls', () => {
      class Test {}
      const arg = new Test();
      const h = hashObject(arg);
      assert.isNumber(h);
      assert.notStrictEqual(h, 0);
      assert.strictEqual(hashObject(arg), h);
    });
  });

  suite('hashMiscRef()', () => {
    test('returns different hash values for different inputs', () => {
      const fn1 = function Test() {};
      const fn2 = function Test() {};
      const a = hashMiscRef(fn1);
      const b = hashMiscRef(fn2);
      assert.isNumber(a);
      assert.isNumber(b);
      assert.notStrictEqual(a, 0);
      assert.notStrictEqual(b, 0);
      assert.notStrictEqual(a, b);
    });
  });

  suite('hashIterator()', () => {
    test('returns different hash values for iterators that output different sequences of values', () => {
      const a = hashIterator([22, 'test', {a: true}][Symbol.iterator]());
      const b = hashIterator([22, 'TEST', {a: true}][Symbol.iterator]());
      const c = hashIterator([22, 'test', {a: true}, null][Symbol.iterator]());
      assert.isNumber(a);
      assert.isNumber(b);
      assert.isNumber(c);
      assert.notStrictEqual(a, b);
      assert.notStrictEqual(a, c);
      assert.notStrictEqual(b, c);
    });

    test('returns the same hash values for iterators that output equivalent sequences of values', () => {
      const a = hashIterator([22, 'test', {a: true, x: 789}][Symbol.iterator]());
      const b = hashIterator([22, 'test', {a: true, x: 789}][Symbol.iterator]());
      assert.isNumber(a);
      assert.isNumber(b);
      assert.strictEqual(a, b);
    });
  });

  suite('hashPlainObject()', () => {
    test('returns different hash values for objects with different sets of keys and values', () => {
      const a = hashPlainObject({a: 32});
      const b = hashPlainObject({a: 32, b: 'test'});
      const c = hashPlainObject({b: 'test'});
      assert.isNumber(a);
      assert.isNumber(b);
      assert.isNumber(c);
      assert.notStrictEqual(a, b);
      assert.notStrictEqual(a, c);
      assert.notStrictEqual(b, c);
    });

    test('returns the same hash values for different objects that have the same keys and values', () => {
      const a = hashPlainObject({a: 32, b: 'test'});
      const b = hashPlainObject({a: 32, b: 'test'});
      assert.isNumber(a);
      assert.isNumber(b);
      assert.strictEqual(a, b);
    });
  });

  suite('hashNumber()', () => {
    test('returns different hash values for different numbers', () => {
      const a = hashNumber(32.23567);
      const b = hashNumber(128);
      const c = hashNumber(10000000);
      assert.isNumber(a);
      assert.isNumber(b);
      assert.isNumber(c);
      assert.notStrictEqual(a, b);
      assert.notStrictEqual(a, c);
      assert.notStrictEqual(b, c);
    });
  });

  suite('hashString()', () => {
    test('returns different hash values for different strings', () => {
      const bob = hashString('Bob');
      const sam = hashString('Sam');
      const jane = hashString('Jane');
      assert.isNumber(bob);
      assert.isNumber(sam);
      assert.isNumber(jane);
      assert.notStrictEqual(bob, sam);
      assert.notStrictEqual(bob, jane);
      assert.notStrictEqual(sam, jane);
    });
  });
});