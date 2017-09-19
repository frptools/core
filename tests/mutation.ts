import * as Mutation from '../src/mutation';
import { assert } from 'chai';
import { PersistentStructure } from '../src';

class Widget implements PersistentStructure {
  constructor (public name: string, public component: Component, mctx: Mutation.Context = Mutation.immutable()) {
    this['@@mctx'] = mctx;
  }

  readonly '@@mctx': Mutation.Context;

  '@@clone' (mctx: Mutation.Context): Widget {
    return new Widget(this.name, this.component, mctx);
  }
}

class Component implements PersistentStructure {
  constructor (public foo: number = 0, public bar: number = 0, mctx: Mutation.Context = Mutation.immutable()) {
    this['@@mctx'] = mctx;
  }

  readonly '@@mctx': Mutation.Context;

  '@@clone' (mctx: Mutation.Context): Component {
    return new Component(this.foo, this.bar, mctx);
  }
}

suite('[Mutation]', () => {
  let initial: Widget;
  setup(() => initial = new Widget('x', new Component(3, 7)));

  suite('begin()', () => {
    test('returns a mutable clone if the argument is frozen', () => {
      const value = Mutation.modify(initial);
      assert.notStrictEqual(initial, value);
      assert.isFalse(Mutation.isMutable(initial));
      assert.isTrue(Mutation.isMutable(value));
    });

    test('returns the same value if the argument is already mutable', () => {
      const value0 = Mutation.modify(initial);
      const value1 = Mutation.modify(value0);
      assert.strictEqual(value0, value1);
      assert.isFalse(Mutation.isMutable(initial));
      assert.isTrue(Mutation.isMutable(value1));
    });
  });

  suite('end()', () => {
    setup(() => initial = Mutation.modify(initial));

    test('freezes the input value and returns it', () => {
      const value = Mutation.commit(initial);
      assert.strictEqual(initial, value);
      assert.isFalse(Mutation.isMutable(value));
    });

    test('does not freeze the mutation context until all nested scopes are exited', () => {
      const value0 = Mutation.modify(initial);
      const value1 = Mutation.modify(initial);
      assert.strictEqual(value0, value1);
      assert.isTrue(Mutation.isMutable(value1));

      const value2 = Mutation.commit(value0);
      assert.strictEqual(value1, value2);
      assert.isTrue(Mutation.isMutable(value2));

      const value3 = Mutation.commit(value0);
      assert.strictEqual(value1, value3);
      assert.isTrue(Mutation.isMutable(value3));

      const value4 = Mutation.commit(value2);
      assert.strictEqual(value4, value1);
      assert.isFalse(Mutation.isMutable(value4));
    });
  });

  suite('join()', () => {
    test('throws an error if the entered-into context is frozen', () => {
      const a = new Component();
      assert.throws(() => Mutation.modifyAsSubordinate(Mutation.immutable(), a));
    });

    test('returns the last argument without changes if it is already a member of the specified mutation context', () => {
      const mctx = Mutation.mutable();
      const sctx = Mutation.asSubordinateContext(mctx);
      const a = new Component(0, 0, mctx);
      const b = new Component(0, 0, sctx);
      assert.strictEqual(b, Mutation.modifyAsSubordinate(a, b));
      assert.strictEqual(b['@@mctx'], sctx);
      assert.isTrue(Mutation.isMutable(a));
      assert.isTrue(Mutation.isMutable(b));
      assert.isTrue(Mutation.isContextOwner(a));
      assert.isFalse(Mutation.isContextOwner(b));
    });

    test('returns a mutable clone of the last argument if initially frozen', () => {
      const a = new Component(0, 0, Mutation.mutable());
      const b = new Component(0, 0);
      const c = Mutation.modifyAsSubordinate(a, b);
      assert.isFalse(Mutation.isMutable(b));
      assert.isTrue(Mutation.isMutable(c));
    });

    test('returns a mutable clone of the last argument if mutable but attached to a different mutation context', () => {
      const owner = new Component(0, 0, Mutation.mutable());
      const other = new Component(0, 0, Mutation.mutable());
      const subordinate = Mutation.modifyAsSubordinate(owner, other);
      assert.notStrictEqual(other, subordinate);
      assert.isTrue(Mutation.isMutable(other));
      assert.isTrue(Mutation.isMutable(subordinate));
      assert.isFalse(Mutation.areContextsRelated(owner, other));
      assert.isTrue(Mutation.areContextsRelated(owner, subordinate));
    });

    test('the returned value cannot ever be frozen directly', () => {
      const a = new Component(0, 0, Mutation.mutable());
      const b = Mutation.modifyAsSubordinate(a, new Component(0, 0));
      assert.isTrue(Mutation.isMutable(Mutation.commit(b)));
      assert.isTrue(Mutation.isMutable(Mutation.commit(b)));
      assert.isTrue(Mutation.isMutable(Mutation.commit(b)));
    });

    test('all values attached to a context become frozen when the owning context is frozen', () => {
      const a = new Component(0, 0, Mutation.mutable());
      const b = Mutation.modifyAsSubordinate(a, new Component(0, 0));
      const c = Mutation.modifyAsSubordinate(a, new Component(1, 1));
      assert.isTrue(Mutation.isMutable(a));
      assert.isTrue(Mutation.isMutable(b));
      assert.isTrue(Mutation.isMutable(c));

      Mutation.commit(a);
      assert.isTrue(Mutation.isImmutable(a));
      assert.isTrue(Mutation.isImmutable(b));
      assert.isTrue(Mutation.isImmutable(c));
    });
  });

  suite('modifyChild()', () => {
    // ## DEV [[
    test('throws an error if the parent is immutable', () => {
      assert.throws(() => Mutation.modifyProperty(initial, 'component'));
    });
    // ]] ##

    test('returns the child as-is if already aligned with the parent mutation context', () => {
      const parent = Mutation.modify(initial);
      const child = Mutation.modifyAsSubordinate(parent, initial.component);
      parent.component = child;
      assert.strictEqual(Mutation.modifyProperty(parent, 'component'), child);
    });

    test('replaces and returns the child with a clone using the parent mutation context', () => {
      const parent = Mutation.modify(initial);
      assert.strictEqual(initial.component, parent.component);
      assert.isTrue(Mutation.isImmutable(parent.component));

      const child = Mutation.modifyProperty(parent, 'component');
      assert.strictEqual(parent.component, child);
      assert.notStrictEqual(initial.component, child);
      assert.isTrue(Mutation.isMutable(child));
      assert.isTrue(Mutation.areContextsRelated(parent, child));
    });
  });
});