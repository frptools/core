import {isDefined} from './functions';

/**
 * All persistent structures must implement this interface in order to participate in batches of
 * mutations among multiple persistent objects of different types. Though designed to allow for
 * batched mutations, `PersistentStructure` and the associated API functions provide a convenient
 * suite of functionality for providing any structural type with persistent/immutable behaviour and
 * associated mutation characteristics.
 *
 * @export
 * @interface PersistentStructure
 */
export interface Persistent {
  /**
   * The associated mutation context. During construction of the first version of a persistent
   * object, use `immutableContext()` if default immutability is required, or `mutableContext()` if
   * the object should be constructed in a mutable state. Do not reassign this property after it has
   * been assigned during construction. Do not ever directly modify its internal properties.
   *
   * @type {MutationContext}
   * @memberOf PersistentStructure
   */
  readonly '[@mctx]': MutationContext;

  /**
   * Create a clone of the structure, retaining all relevant internal properties and state as-is.
   * The method is provided with a new MutationContext instance, which should be assigned to the
   * clone of the object during construction. Internal subordinate persistent substructures should
   * not be cloned at this time. When updates are being applied to a persistent object,
   * substructures should use `asMutable()`, with their owning structure passed in as the joining
   * context.
   *
   * @param {MutationContext} mctx
   * @returns {PersistentStructure}
   *
   * @memberOf PersistentStructure
   */
  '[@clone]'(mctx: MutationContext): Persistent;
}

/**
 * A mutation context stores contextual information with respect to the temporary mutability of a
 * persistent object and zero or more other persistent objects (of the same or differing types) with
 * which it is associated. Once a mutation context has been frozen, it cannot be unfrozen; the
 * associated persistent objects must first be cloned with new mutation contexts. Freezing a
 * mutation context is an in-place operation; given that it indicates that mutability is permitted,
 * the freezing of the context (and all associated persistent objects) is therefore the final
 * mutable operation performed against those objects.
 *
 * @export
 * @class MutationContext
 */
export class MutationContext {
  /**
   * A shared token indicating whether the mutation context is still active, or has become frozen.
   * A one-tuple is used because arrays can be shared by reference among multiple mutation contexts,
   * and the sole element can then be switched from `true` to `false` in order to simultaneously
   * make all associated persistent objects immutable with a single O(1) operation.
   *
   * @type {[boolean]}
   * @memberOf MutationContext
   */
  public readonly token: [boolean];

  /**
   * Indicates whether this MutationContext instance originated with the value to which it is
   * attached. If true, the shared token may be frozen when mutations are complete. If false, then
   * the freezing of the shared token must be performed with reference to the value where the
   * mutation context originated. Note that a non-owned MutationContext instance can itself be
   * shared among many persistent objects. For many objects to participate in a larger mutation
   * batch, it is only necessary to have two MutationContext instances; one for the owner, and one
   * for all subsequent persistent objects that are participating in, but not in control of, the
   * scope of the mutations.
   *
   * @type {boolean}
   * @memberOf MutationContext
   */
  public readonly owner: boolean;

  constructor(token: [boolean], owner: boolean) {
    this.token = token;
    this.owner = owner;
  }
}

const FROZEN = Object.freeze(new MutationContext([false], false));

/**
 * Checks whether the input object implements the `Persistent` interface, and narrows the input type
 * accordingly.
 *
 * @export
 * @param {object} value An object instance to test
 * @returns {value is Persistent} true if the value implements the `Persistent` interface, otherwise false
 */
export function isPersistent(value: object): value is Persistent {
  return '[@mctx]' in <any>value;
}

/**
 * Returns the default frozen mutation context for use with new immutable objects. This function
 * should only be used when constructing the first version of a new persistent object. Any
 * subsequent copies of that object should use `doneMutating()` and related functions.
 *
 * @export
 * @returns {MutationContext} The default frozen mutation context
 */
export function frozenContext(): MutationContext {
  return FROZEN;
}

/**
 * Returns a new mutable context to be associated with, and owned by, a persistent object. This
 * function should only be used when constructing the first version of a new persistent object. Any
 * subsequent updates to that object should use `asMutable()` and related functions.
 *
 * @export
 * @returns {MutationContext}
 */
export function mutableContext(): MutationContext {
  return new MutationContext([true], true);
}

/**
 * Tests whether the value is currently in a mutable state, with changes able to be applied directly
 * to the value, rather than needing to clone the value first.
 *
 * @export
 * @param {PersistentStructure} value A value to test for mutability
 * @returns {boolean} true if the value may be mutated directly, otherwise false
 */
export function isMutable(value: Persistent): boolean {
  return mctx(value).token[0];
}

/**
 * Tests whether the value is currently in an immutable state, requiring a clone to be created if
 * mutations are desired.
 *
 * @export
 * @param {PersistentStructure} value A value to be tested for immutability
 * @returns {boolean} true if direct mutations to the value or its contents are forbidden, otherwise false
 */
export function isImmutable(value: Persistent): boolean {
  return !isMutable(value);
}

/**
 * Tests whether two values are currently part of the same active mutation context, whereby freezing
 * the mutation context of the value where it originated will cause all other values associated with
 * the same mutation context to become immutable also. This function returns false if either value
 * is immutable, even if they were both formerly associated with the same mutation context.
 *
 * @export
 * @param {PersistentStructure} a A value to compare with `b`
 * @param {PersistentStructure} b A value to compare with `a`
 * @returns {boolean} true if both values are associated with the same active mutation context, otherwise false
 */
export function isSameMutationContext(a: Persistent, b: Persistent): boolean {
  return token(a) === token(b);
}

/**
 * Returns a mutable version of the input value. If no joining context is specified, the input value
 * is returned as-is if already mutable, or cloned to a new mutation context otherwise.
 *
 * If a joining context is specified, the return value will use a "shadow" context, i.e. a copy of
 * the joining context that won't directly trigger refreezing of the shared mutability token when
 * `doneMutating()` is called. This allows a persistent structure to make multiple modifications to
 * its internal substructure during a single operation, without unnecessarily re-cloning internal
 * components over the source of several sub-operations.
 *
 * Note that some persistent structures apply partial changes for performance reasons, with the
 * intent to lazily complete the changes only when accesses to the structure would require those
 * changes to be applied. Because such internal changes tend to occur after the initial mutations
 * have finished, and thus the associated mutation context will have become frozen before the lazy
 * completion of the changes is applied, `asMutable()` can return a shadowed mutation context that
 * is technically already frozen. In such cases it is still safe to apply changes to the relevant
 * internal substructures as long as the changes do not change the data, as it is perceived by any
 * external read operations. When applying lazy updates in this way, do not use `isMutable()`;
 * instead, just call `asMutable()` naively, with the assumption that what is returned is safe to
 * update with respect to application of the pending changes that were intended in the prior
 * operation(s).
 *
 * @export
 * @template T The type of the persistent structure
 * @param {T} value The value for which mutability is being requested
 * @param {PersistentStructure} [join] If specified, the returned value will become associated with
 *   the same mutation context as that of the `join` argument
 * @returns {T} A version of the persistent structure that can be freely mutated
 */
export function asMutable<T extends Persistent>(value: T, join?: Persistent): T {
  return isDefined(join)
    ? isSameMutationContext(value, join) ? value : clone(shadowMutationContext(join), value)
    : isMutable(value) ? value : clone(mutableContext(), value);
}

/**
 * Indicates that we have no further intent to mutate the input value from the calling context, then
 * returns the input value, as a convenience. The mutation context associated with the input value
 * is only frozen if it originated with the input value. If it did not, then the mutation context
 * will only become frozen once `doneMutating()` is called against the value where the mutation
 * context originated. Until then, the input value will continue to be mutable, thus facilitating
 * batched operations among multiple values.
 *
 * @export
 * @template T The type of the persistent structure
 * @param {T} value A value for which immediate subsequent mutations are no longer intended
 * @returns {T} The input value
 */
export function doneMutating<T extends Persistent>(value: T): T {
  var mc = mctx(value);
  return isOwner(mc) && freeze(mc), value;
}

/**
 * Returns a mutation context that is subordinate to that of the object it was created for. The
 * returned mutation context matches the mutability of the one from which it is being cloned.
 *
 * @export
 * @param {Persistent} value
 * @returns {MutationContext}
 */
export function shadowMutationContext(value: Persistent): MutationContext {
  var mc = mctx(value);
  return mc.owner ? new MutationContext(mc.token, false) : mc;
}

function token(value: Persistent): [boolean] {
  return mctx(value).token;
}

function freeze(mctx: MutationContext): void {
  mctx.token[0] = false;
}

function isOwner(mctx: MutationContext): boolean {
  return mctx.owner;
}

function mctx(value: Persistent): MutationContext {
  return value['[@mctx]'];
}

function clone<T extends Persistent>(mctx: MutationContext, value: T): T {
  return <T>value['[@clone]'](mctx);
}
