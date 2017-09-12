import {PersistentStructure} from './Mutation';
import {Equatable} from './equatable';
import {Hashable} from './hashable';
import {Unwrappable, RecursiveUnwrappable} from './unwrappable';

export type Concrete = string | number | boolean | symbol | object;

export type Primitive = string | number | boolean | symbol | null | undefined;

export type Defined = Concrete|null;

export type Ref<T> = {value: T};

export interface Associative<T = any> {
  [key: string]: T;
  [key: number]: T;
}

export interface DataStructure<U> extends PersistentStructure, Equatable, Hashable, Unwrappable<U> {}
export interface RecursiveDataStructure<U> extends PersistentStructure, Equatable, Hashable, RecursiveUnwrappable<U> {}

export type FilterFn<T> = (value: T, index: number) => any;

export type KeyedFilterFn<K, V> = (value: V, key: K, index: number) => any;

export type MapFn<T, U> = (value: T, index: number) => U;

export type KeyedMapFn<K, V, U> = (value: V, key: K, index: number) => U;

export type ReduceFn<T, U> = (accum: U, value: T, index: number) => U;

export type KeyedReduceFn<K, V, U> = (accum: U, value: V, key: K, index: number) => U;

export type ForEachFn<T> = (value: T, index: number) => any;

export type KeyedForEachFn<K, V> = (value: V, key: K, index: number) => any;

export type SelectorFn<T, U> = (value: T) => U;

export type KeyedSelectorFn<K, V, U> = (value: V, key: K) => U;

export type ComparatorFn<T> = (a: T, b: T) => number;
