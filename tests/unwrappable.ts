import {assert} from 'chai';
import {Unwrappable, isUnwrappable, unwrap} from '../src';

class Person implements Unwrappable<any> {
  constructor(private _name: string) {}
  '@@unwrap'(): any {
    return {name: this._name};
  }
}

suite('[Unwrappable]', () => {
  suite('isUnwrappable()', () => {
    test('returns true if the argument implements Unwrappable', () => {
      assert.isTrue(isUnwrappable(new Person('Bob')));
    });

    test('returns false if the argument does not implement Unwrappable', () => {
      assert.isFalse(isUnwrappable({_name: 'Bob'}));
    });
  });

  suite('unwrap()', () => {
    test('returns the unwrapped version of the argument', () => {
      assert.deepEqual(unwrap(new Person('Bob')), {name: 'Bob'});
    });

    test('returns the original argument if it does not implement Unwrappable', () => {
      const bob = {_name: 'Bob'};
      assert.strictEqual(unwrap(<any>bob), bob);
    });
  });
});