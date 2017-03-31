export interface Comparable {
  '[@compare]'(other: this): number;
}

export function isComparable(value: object): value is Comparable {
  return '[@compare]' in <any>value;
}

export function compare<T extends Comparable>(a: T, b: T): number {
  return a['[@compare]'](b);
}