import {assert} from 'chai';
import {
  Persistent,
  MutationContext,
  frozenContext,
  asMutable,
  doneMutating,
  isPersistent,
  isMutable,
  isImmutable,
  isSameMutationContext
} from '../src';

class Person implements Persistent {
  constructor(
    public readonly name: string,
    mctx: MutationContext = frozenContext()
  ) {
    this['[@mctx]'] = mctx;
  }
  '[@mctx]': MutationContext;
  '[@clone]'(mctx: MutationContext): Person {
    return new Person(this.name, mctx);
  }
}

suite('[Persistent]', () => {
  suite('isPersistent()', () => {
    test('returns true if the argument implements the Persistent interface', () => {
      assert.isTrue(isPersistent(new Person('Bob')));
    });

    test('returns false if the argument does not implement the Persistent interface', () => {
      assert.isFalse(isPersistent({name: 'Bob'}));
    });
  });

  suite('asMutable()', () => {
    test('returns the same instance if already mutable', () => {
      const bob = asMutable(new Person('Bob'));
      const bob2 = asMutable(bob);
      assert.strictEqual(bob, bob2);
    });

    test('returns a new instance if immutable', () => {
      const bob = asMutable(new Person('Bob'));
      const bob2 = asMutable(bob);
      assert.strictEqual(bob, bob2);
    });

    test('the returned instance is always mutable', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(asMutable(new Person('Sam')));
      assert.isTrue(isMutable(bob));
      assert.isTrue(isMutable(sam));
    });
  });

  suite('asMutable(join)', () => {
    test('throws an error if the joined context is already frozen', () => {
      const bob = new Person('Bob');
      const sam = new Person('Sam');
      assert.throws(() => asMutable(sam, bob));
      assert.throws(() => asMutable(sam, doneMutating(asMutable(sam))));
    });

    test('returns the same instance if already part of the joined context', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      assert.strictEqual(asMutable(sam, bob), sam);
    });

    test('returns a new instance if not part of the joined context', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'));
      assert.notStrictEqual(asMutable(sam, bob), sam);
    });

    test('the returned instance is always mutable', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      const sam2 = asMutable(sam, bob);
      assert.isTrue(isMutable(sam));
      assert.isTrue(isMutable(sam2));
    });
  });

  suite('doneMutating()', () => {
    test('has no effect on a structure that is not attached to an active mutation context', () => {
      const bob = new Person('Bob');
      assert.strictEqual(doneMutating(bob), bob);
    });

    test('freezes the mutation context if it originated with the specified structure', () => {
      const bob = asMutable(new Person('Bob'));
      assert.strictEqual(doneMutating(bob), bob);
      assert.isTrue(isImmutable(bob));
    });

    test('does not freeze the mutation context if it originated with a different structure', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      const sam2 = doneMutating(sam);
      assert.strictEqual(sam, sam2);
      assert.isTrue(isMutable(sam2));
      assert.isTrue(isMutable(bob));
    });

    test('other structures associated with the same mutation context simultaneously become immutable', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      doneMutating(bob);
      assert.isTrue(isImmutable(bob));
      assert.isTrue(isImmutable(sam));
    });
  });

  suite('isMutable()', () => {
    test('returns true if attached to an active mutation context that originated with the specified structure', () => {
      const bob = asMutable(new Person('Bob'));
      assert.isTrue(isMutable(bob));
    });

    test('returns true if attached to an active mutation context that did not originate with the specified structure', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      assert.isTrue(isMutable(sam));
    });

    test('returns false if not attached to an active mutation context', () => {
      assert.isFalse(isMutable(new Person('Bob')));
      assert.isFalse(isMutable(doneMutating(asMutable(new Person('Bob')))));
    });
  });

  suite('isImmutable()', () => {
    test('returns false if attached to an active mutation context that originated with the specified structure', () => {
      const bob = asMutable(new Person('Bob'));
      assert.isFalse(isImmutable(bob));
    });

    test('returns false if attached to an active mutation context that did not originate with the specified structure', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      assert.isFalse(isImmutable(sam));
    });

    test('returns true if not attached to an active mutation context', () => {
      assert.isTrue(isImmutable(new Person('Bob')));
      assert.isTrue(isImmutable(doneMutating(asMutable(new Person('Bob')))));
    });
  });

  suite('isSameMutationContext()', () => {
    test('returns false if either structure is attached to a frozen mutation context', () => {
      assert.isFalse(isSameMutationContext(new Person('Bob'), new Person('Sam')));
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      doneMutating(bob);
      assert.isFalse(isSameMutationContext(bob, sam));
    });

    test('returns false if the structures are attached to different mutation contexts', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'));
      const jane = asMutable(new Person('Jane'), sam);
      assert.isFalse(isSameMutationContext(bob, sam));
      assert.isFalse(isSameMutationContext(bob, jane));
    });

    test('returns true if both structures are attached to the same active mutation context', () => {
      const bob = asMutable(new Person('Bob'));
      const sam = asMutable(new Person('Sam'), bob);
      const jane = asMutable(new Person('Jane'), sam);
      assert.isTrue(isSameMutationContext(bob, sam));
      assert.isTrue(isSameMutationContext(bob, jane));
      assert.isTrue(isSameMutationContext(sam, jane));
    });
  });
});