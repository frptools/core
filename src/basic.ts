import {Associative} from './types';

export function isDefined<T>(value: T|undefined): value is T {
  return value !== void 0;
}

export function isUndefined<T>(value: T|undefined): value is undefined {
  return value === void 0;
}

export function isNullOrUndefined<T>(value: T|null|undefined): value is null|undefined {
  return value === void 0 || value === null;
}

export function hasValue<T>(value: T|null|undefined): value is T {
  return value !== void 0 && value !== null;
}

/**
 * Checks whether the object can be iterated over
 *
 * @export
 * @template T The type of values to be iterated over
 * @param {*} value A value to check
 * @returns {value is Iterable<T>} true if the argument is iterable
 */
export function isIterable<T>(value: object): value is Iterable<T> {
  return Symbol.iterator in <any>value;
}

/**
 * Checks that the value is an instance of a non-null object
 *
 * @export
 * @param {*} value A value to test
 * @returns {value is Object} true if the value is a non-null object instance
 */
export function isObject(value: any): value is Object;
/**
 * Checks that the value is an instance of a non-null object. This overload narrows the return type
 * to `Associative<T>`, though this is a convenience; the logic performing the type check is the
 * same for all overloads.
 *
 * @export
 * @template T The type of values in the object
 * @template U A type that is compatible with Associative<T>
 * @param {*} value
 * @returns {value is U} true if the value is a non-null object instance (narrows to `U`)
 */
export function isObject<T, U extends Associative<T>>(value: any): value is U;
export function isObject(value: any): value is Object {
  return typeof value === 'object' && value !== null;
}

/**
 * Checks that an object has a plain Object constructor
 *
 * @export
 * @param {object} value
 * @returns {value is Object} true if the object's constructor is `Object`
 */
export function isPlain(value: object): value is Object {
  return Object.constructor === Object;
}

export function identity<T>(value: T): T {
  return value;
}

export function error(message): never {
  throw new Error(message);
}

export function notImplemented(): never {
  throw Error('Not implemented');
}

export function abs(value: number): number {
  return value < 0 ? -value : value;
}

export function min(a: number, b: number): number {
  return a <= b ? a : b;
}

export function max(a: number, b: number): number {
  return a >= b ? a : b;
}
