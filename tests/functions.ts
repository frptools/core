import {assert} from 'chai';
import {
  isDefined,
  isUndefined,
  isNull,
  isNotNull,
  isNothing,
  isNotNothing,
  isIterable,
  isObject,
  isPlain,
  identity,
  error,
  notImplemented,
  abs,
  min,
  max,
} from '../src';

suite('[Functions]', () => {
  suite('isDefined()', () => {
    test('returns true if the value is defined', () => {
      assert.isTrue(isDefined(1));
      assert.isTrue(isDefined(null));
      assert.isTrue(isDefined(0));
      assert.isTrue(isDefined('string'));
      assert.isTrue(isDefined({obj: 1}));
    });

    test('returns false if the value is undefined', () => {
      assert.isFalse(isDefined(void 0));
    });
  });

  suite('isUndefined()', () => {
    test('returns true if the value is undefined', () => {
      assert.isTrue(isUndefined(void 0));
    });

    test('returns false if the value is defined', () => {
      assert.isFalse(isUndefined(1));
      assert.isFalse(isUndefined(null));
      assert.isFalse(isUndefined(0));
      assert.isFalse(isUndefined('string'));
      assert.isFalse(isUndefined({obj: 1}));
    });
  });

  suite('isNull()', () => {
    test('returns true if the value is null', () => {
      assert.isTrue(isNull(null));
    });

    test('returns false if the value is not null', () => {
      assert.isFalse(isNull(1));
      assert.isFalse(isNull(void 0));
      assert.isFalse(isNull(0));
      assert.isFalse(isNull('string'));
      assert.isFalse(isNull({obj: 1}));
    });
  });

  suite('isNotNull()', () => {
    test('returns true if the value is not null', () => {
      assert.isTrue(isNotNull(1));
      assert.isTrue(isNotNull(void 0));
      assert.isTrue(isNotNull(0));
      assert.isTrue(isNotNull('string'));
      assert.isTrue(isNotNull({obj: 1}));
    });

    test('returns false if the value is null', () => {
      assert.isFalse(isNotNull(null));
    });
  });

  suite('isNothing()', () => {
    test('returns true if the value is null or undefined', () => {
      assert.isTrue(isNothing(void 0));
      assert.isTrue(isNothing(null));
    });

    test('returns false if the value is not null or undefined', () => {
      assert.isFalse(isNothing(1));
      assert.isFalse(isNothing(0));
      assert.isFalse(isNothing('string'));
      assert.isFalse(isNothing({obj: 1}));
    });
  });

  suite('isNotNothing()', () => {
    test('returns false if the value is null or undefined', () => {
      assert.isFalse(isNotNothing(void 0));
      assert.isFalse(isNotNothing(null));
    });

    test('returns true if the value is not null or undefined', () => {
      assert.isTrue(isNotNothing(1));
      assert.isTrue(isNotNothing(0));
      assert.isTrue(isNotNothing('string'));
      assert.isTrue(isNotNothing({obj: 1}));
    });
  });

  suite('isIterable()', () => {
    test('returns true if the value has a Symbol.iterator property', () => {
      assert.isTrue(isIterable(new Set()));
    });

    test('returns false if the value does not have a Symbol.iterator property', () => {
      assert.isFalse(isIterable({}));
    });
  });

  suite('isObject()', () => {
    test('returns true if the value is an object type and is not null', () => {
      assert.isTrue(isObject(new Set()));
      assert.isTrue(isObject({}));
    });

    test('returns false if the value is not an object type or is null', () => {
      assert.isFalse(isObject(null));
      assert.isFalse(isObject(123));
    });
  });

  suite('isPlain()', () => {
    test('returns true if the value\'s constructor is Object', () => {
      assert.isTrue(isPlain({a: 1}));
    });

    test('returns false if the value\'s constructor is not Object', () => {
      assert.isFalse(isPlain(new Set()));
    });
  });

  suite('identity()', () => {
    test('returns the same value as the input argument', () => {
      assert.strictEqual(identity(void 0), void 0);
      assert.strictEqual(identity(identity), identity);
      assert.strictEqual(identity(null), null);
      assert.strictEqual(identity(false), false);
      assert.strictEqual(identity('test'), 'test');
    });
  });

  suite('error()', () => {
    test('throws an error with the specified error message', () => {
      var message = 'test error';
      assert.throws(() => error(message), /^test error$/);
    });
  });

  suite('notImplemented()', () => {
    test('throws a "Not implemented" error', () => {
      assert.throws(() => notImplemented(), /not implemented/i);
    });
  });

  suite('abs()', () => {
    test('returns the absolute value of the argument', () => {
      assert.strictEqual(abs(123), 123);
      assert.strictEqual(abs(-123), 123);
      assert.strictEqual(abs(123.456), 123.456);
      assert.strictEqual(abs(-123.456), 123.456);
    });
  });

  suite('min()', () => {
    test('returns the minimum value out of the two input arguments', () => {
      assert.strictEqual(min(5, 5), 5);
      assert.strictEqual(min(-5, 5), -5);
      assert.strictEqual(min(5, -5), -5);
      assert.strictEqual(min(5, 15), 5);
      assert.strictEqual(min(15, 5), 5);
      assert.strictEqual(min(123.456, 123.789), 123.456);
      assert.strictEqual(min(123.789, 123.456), 123.456);
    });
  });

  suite('max()', () => {
    test('returns the maximum value out of the two input arguments', () => {
      assert.strictEqual(max(5, 5), 5);
      assert.strictEqual(max(-5, 5), 5);
      assert.strictEqual(max(5, -5), 5);
      assert.strictEqual(max(5, 15), 15);
      assert.strictEqual(max(15, 5), 15);
      assert.strictEqual(max(123.456, 123.789), 123.789);
      assert.strictEqual(max(123.789, 123.456), 123.789);
    });
  });
});