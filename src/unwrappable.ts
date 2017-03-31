import {identity, isDefined} from './functions';

/**
 * An object that implements `Unwrappable` is capable of serializing itself to a native type, such
 * as a plain object or array.
 *
 * @export
 * @interface Unwrappable
 * @template T The expected type of the return value
 */
export interface Unwrappable<T> {
  '[@unwrap]'(): T;
}

/**
 * Checks whether the input argument implements the `Unwrappable<T>` interface, and narrows the type
 * and narrows the type accordingly.
 *
 * @export
 * @template T
 * @param {object} value
 * @returns {value is Unwrappable<T>}
 */
export function isUnwrappable<T>(value: object): value is Unwrappable<T> {
  return '[@unwrap]' in <any>value;
}

/**
 * Unwraps an instance of a `Unwrappable` object as a plain JavaScript value or object. The nature
 * of the return value is determined by the implementation of the `Unwrappable` interface pertaining
 * to the input argument.
 *
 * @export
 * @template T The type of value to be unwrapped (for type matching only - no type checking is performed)
 * @param {Unwrappable<T>} value An instance of an object that implements the `Unwrappable` interface
 * @returns {T} An unwrapped (plain) object or value
 */
export function unwrap<T>(value: Unwrappable<T>): T {
  const fn = value['[@unwrap]'];
  return isDefined(fn) ? fn.apply(value) : identity(value);
}


