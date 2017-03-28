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

export function isIterable<T>(value: any): value is Iterable<T> {
  return typeof value === 'object' && value !== null && Symbol.iterator in value;
}

export function isObject(value: any): value is Object;
export function isObject<T, U extends Associative<T>>(value: any): value is U;
export function isObject(value: any): value is Object {
  return typeof value === 'object' && value !== null;
}

export function isPlainObject(value: any): value is Object {
  return isObject(value) && Object.constructor === Object;
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

export function identity<T>(value: T): T {
  return value;
}
