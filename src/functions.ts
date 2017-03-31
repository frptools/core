export function isDefined<T>(value: T|undefined): value is T {
  return value !== void 0;
}

export function isUndefined<T>(value: T|undefined): value is undefined {
  return value === void 0;
}

export function isNull<T>(value: T|null): value is null {
  return value === null;
}

export function isNotNull<T>(value: T|null): value is null {
  return value !== null;
}

/**
 * Checks if the value is null or undefined
 *
 * @export
 * @template T The expected type of the value
 * @param {(T|null|undefined)} value A value to test
 * @returns {(value is null|undefined)} true if the value is null or undefined, otherwise false
 */
export function isNothing<T>(value: T|null|undefined): value is null|undefined {
  return value === void 0 || value === null;
}

/**
 * Checks that the value is neither null nor undefined
 *
 * @export
 * @template T The expected type of the value
 * @param {(T|null|undefined)} value A value to test
 * @returns {value is T} false if the value is null or undefined, otherwise true
 */
export function isNotNothing<T>(value: T|null|undefined): value is T {
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
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null;
}

/**
 * Checks that an object has a plain Object constructor
 *
 * @export
 * @param {object} value
 * @returns {value is Object} true if the object's constructor is `Object`
 */
export function isPlain(value: object): value is object {
  return value.constructor === Object;
}

export function identity<T>(value: T): T {
  return value;
}

/**
 * Throws an error with the specified error message
 *
 * @export
 * @param {any} message The error message
 * @returns {never}
 */
export function error(message): never {
  throw new Error(message);
}

/**
 * Throws a default "Not implemented" error
 *
 * @export
 * @returns {never}
 */
export function notImplemented(): never {
  throw Error('Not implemented');
}

/**
 * Fast, minimal implementation of Math.abs()
 *
 * @export
 * @param {number} value
 * @returns {number} The absolute value of the input argument
 */
export function abs(value: number): number {
  return value < 0 ? -value : value;
}

/**
 * Fast, minimal implementation of Math.min()
 *
 * @export
 * @param {number} a
 * @param {number} b
 * @returns {number} The smaller of the two arguments, or the first argument if both are equal
 */
export function min(a: number, b: number): number {
  return a <= b ? a : b;
}

/**
 * Fast, minimal implementation of Math.max()
 *
 * @export
 * @param {number} a
 * @param {number} b
 * @returns {number} The marger of the two arguments, or the first argument if both are equal
 */
export function max(a: number, b: number): number {
  return a >= b ? a : b;
}
