import {isIterable, isObject} from './functions';

export interface Equatable {
  '[@equals]'(other: any): boolean;
}

/**
 * Checks whether the specified argument implements `Equatable`.
 *
 * @export
 * @param {object} value
 * @returns {value is Equatable}
 */
export function isEquatable(value: object): value is Equatable {
  return '[@equals]' in <any>value;
}

/**
 * Checks whether two `Equatable` objects have equivalent data. If both objects implement
 * `Equatable` but are of different iterable types, their values are iterated over in tandem, and
 * checked for either strict equality, or with `isEqual` if both child values implement `Equatable`.
 *
 * @export
 * @param {Equatable} a
 * @param {Equatable} b
 * @returns {boolean} true if both arguments have the same internal
 */
export function isEqual(a: Equatable, b: Equatable): boolean {
  if(a === b || (a.constructor === b.constructor && a['[@equals]'](b))) {
    return true;
  }

  if(isIterable(a) && isIterable(b)) {
    var ita = a[Symbol.iterator]();
    var itb = b[Symbol.iterator]();
    do {
      var ca = ita.next();
      var cb = itb.next();
      if(ca.done !== cb.done) {
        return false;
      }
      if(!ca.done) {
        var va = ca.value, vb = cb.value;
        if(va !== vb && !(isObject(va) && isEquatable(va) && isObject(vb) && isEquatable(vb) && isEqual(va, vb))) {
          return false;
        }
      }
    } while(!ca.done);
  }

  return true;
}