/**
 * An object that implements `Unwrappable` is capable of serializing itself to a native type, such
 * as a plain object or array. If children of the object will also be unwrapped, implement
 * `NestableUnwrappable` instead, in order to prevent infinite recursion when circular references
 * are encountered during descent.
 *
 * @export
 * @interface Unwrappable
 * @template T The expected type of the return value
 */
export interface Unwrappable<T> {
  '[@unwrap]'(): T;
}

/**
 * An object that implements `NestableUnwrappable` is capable of recursively serializing itself and
 * its children to a native type, such as a plain object or array.
 *
 * @export
 * @interface NestableUnwrappable
 * @extends {Unwrappable<T>}
 * @template T The type of value being unwrapped
 */
export interface NestableUnwrappable<T> extends Unwrappable<T> {
  '[@unwrap]'(target?: T): T;
  '[@unwrap:init]'(): T;
}

/**
 * Checks whether the input argument implements the `Unwrappable<T>` interface, and narrows the type
 * accordingly.
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
 * Checks whether the input argument implements the `NestableUnwrappable<T>` interface, and narrows
 * the type accordingly.
 *
 * @export
 * @template T
 * @param {object} value
 * @returns {value is NestableUnwrappable<T>}
 */
export function isNestableUnwrappable<T>(value: object): value is NestableUnwrappable<T> {
  return '[@unwrap:init]' in <any>value;
}

const CIRCULARS = new WeakMap<any, any>();

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
export function unwrap<T>(source: any): T {
  if(!isUnwrappable<T>(source)) {
    return source;
  }
  if(CIRCULARS.has(source)) {
    return CIRCULARS.get(source);
  }
  var value: T;
  if(isNestableUnwrappable<T>(source)) {
    var target = source['[@unwrap:init]']();
    CIRCULARS.set(source, target);
    value = source['[@unwrap]'](target);
    CIRCULARS.delete(source);
  }
  else {
    value = source['[@unwrap]']();
  }
  return value;
}
