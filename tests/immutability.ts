import {assert} from 'chai';
import * as IMM from '../src/immutability';

class Person implements IMM.PersistentStructure {
  constructor(
    public readonly name: string,
    mctx: IMM.MutationContext = IMM.frozenContext()
  ) {
    this['@@mctx'] = mctx;
  }
  '@@mctx': IMM.MutationContext;
  '@@clone'(mctx: IMM.MutationContext): Person {
    return new Person(this.name, mctx);
  }
}

suite('[Immutability]', () => {
  suite('asMutable()', () => {
    test('returns the same instance if already mutable', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const bob2 = IMM.asMutable(bob);
      assert.strictEqual(bob, bob2);
    });

    test('returns a new instance if immutable', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const bob2 = IMM.asMutable(bob);
      assert.strictEqual(bob, bob2);
    });

    test('the returned instance is always mutable', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(IMM.asMutable(new Person('Sam')));
      assert.isTrue(IMM.isMutable(bob));
      assert.isTrue(IMM.isMutable(sam));
    });
  });

  suite('asMutable(join)', () => {
    test('throws an error if the joined context is already frozen', () => {
      const bob = new Person('Bob');
      const sam = new Person('Sam');
      assert.throws(() => IMM.asMutable(sam, bob));
      assert.throws(() => IMM.asMutable(sam, IMM.doneMutating(IMM.asMutable(sam))));
    });

    test('returns the same instance if already part of the joined context', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      assert.strictEqual(IMM.asMutable(sam, bob), sam);
    });

    test('returns a new instance if not part of the joined context', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'));
      assert.notStrictEqual(IMM.asMutable(sam, bob), sam);
    });

    test('the returned instance is always mutable', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      const sam2 = IMM.asMutable(sam, bob);
      assert.isTrue(IMM.isMutable(sam));
      assert.isTrue(IMM.isMutable(sam2));
    });
  });

  suite('doneMutating()', () => {
    test('has no effect on a structure that is not attached to an active mutation context', () => {
      const bob = new Person('Bob');
      assert.strictEqual(IMM.doneMutating(bob), bob);
    });

    test('freezes the mutation context if it originated with the specified structure', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      assert.strictEqual(IMM.doneMutating(bob), bob);
      assert.isTrue(IMM.isImmutable(bob));
    });

    test('does not freeze the mutation context if it originated with a different structure', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      const sam2 = IMM.doneMutating(sam);
      assert.strictEqual(sam, sam2);
      assert.isTrue(IMM.isMutable(sam2));
      assert.isTrue(IMM.isMutable(bob));
    });

    test('other structures associated with the same mutation context simultaneously become immutable', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      IMM.doneMutating(bob);
      assert.isTrue(IMM.isImmutable(bob));
      assert.isTrue(IMM.isImmutable(sam));
    });
  });

  suite('isMutable()', () => {
    test('returns true if attached to an active mutation context that originated with the specified structure', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      assert.isTrue(IMM.isMutable(bob));
    });

    test('returns true if attached to an active mutation context that did not originate with the specified structure', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      assert.isTrue(IMM.isMutable(sam));
    });

    test('returns false if not attached to an active mutation context', () => {
      assert.isFalse(IMM.isMutable(new Person('Bob')));
      assert.isFalse(IMM.isMutable(IMM.doneMutating(IMM.asMutable(new Person('Bob')))));
    });
  });

  suite('isImmutable()', () => {
    test('returns false if attached to an active mutation context that originated with the specified structure', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      assert.isFalse(IMM.isImmutable(bob));
    });

    test('returns false if attached to an active mutation context that did not originate with the specified structure', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      assert.isFalse(IMM.isImmutable(sam));
    });

    test('returns true if not attached to an active mutation context', () => {
      assert.isTrue(IMM.isImmutable(new Person('Bob')));
      assert.isTrue(IMM.isImmutable(IMM.doneMutating(IMM.asMutable(new Person('Bob')))));
    });
  });

  suite('isSameMutationContext()', () => {
    test('returns false if either structure is attached to a frozen mutation context', () => {
      assert.isFalse(IMM.isSameMutationContext(new Person('Bob'), new Person('Sam')));
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      IMM.doneMutating(bob);
      assert.isFalse(IMM.isSameMutationContext(bob, sam));
    });

    test('returns false if the structures are attached to different mutation contexts', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'));
      const jane = IMM.asMutable(new Person('Jane'), sam);
      assert.isFalse(IMM.isSameMutationContext(bob, sam));
      assert.isFalse(IMM.isSameMutationContext(bob, jane));
    });

    test('returns true if both structures are attached to the same active mutation context', () => {
      const bob = IMM.asMutable(new Person('Bob'));
      const sam = IMM.asMutable(new Person('Sam'), bob);
      const jane = IMM.asMutable(new Person('Jane'), sam);
      assert.isTrue(IMM.isSameMutationContext(bob, sam));
      assert.isTrue(IMM.isSameMutationContext(bob, jane));
      assert.isTrue(IMM.isSameMutationContext(sam, jane));
    });
  });

  // suite.only('perf', () => {
  //   test('x10000000', function() {
  //     this.timeout(30000);
  //     var bob = new Person('Bob');
  //     var sam = new Person('Sam');
  //     for(var i = 0; i < 10000000; i++) {
  //       bob = IMM.asMutable(bob);
  //       sam = IMM.asMutable(sam, bob);
  //       IMM.doneMutating(bob);
  //     }
  //   });
  // });
});