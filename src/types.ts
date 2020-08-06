import * as bigInt from 'big-integer';
import { BigInteger } from 'big-integer';

export {
  bigInt,
  BigInteger
};

export type Bytes = Uint8Array | string;
export type PrivateKey = Bytes | BigInteger | number;

export type BufferConstructor<T extends Uint8Array> = {
  from(data: number[]): T;
};

export function bufferAlloc<T extends Uint8Array>(bufferConstructor: BufferConstructor<T>, size: number): T {
  return bufferConstructor.from(new Array<number>(size));
}

// Finite field
export interface Field<T> {
  isZero(): boolean;
  equals(rhs: T): boolean;
  negate(): T;
  add(rhs: T): T;
  subtract(rhs: T): T;
  invert(): T;
  multiply(rhs: T | BigInteger): T;
  square(): T;
  pow(n: BigInteger): T;
  div(rhs: T | BigInteger): T;
}

export type FieldStatic<T extends Field<T>> = {
  ZERO(curve: Curve): T;
  ONE(curve: Curve): T;
  fromConstant(curve: Curve, c: BigInteger): T;
};

export interface IECPoint<T extends Field<T>> {
  isInf(): boolean;
  equals(rhs: IECPoint<T>): boolean;
  negate(): this;
  double(): this;
  add(rhs: IECPoint<T>): this;
  validatePoint(): boolean;
}

export type BigintTuple = [
  BigInteger, BigInteger
];
export type BigintFour = [
  BigInteger, BigInteger, BigInteger, BigInteger
];
export type BigintSix = [
  BigInteger, BigInteger, BigInteger,
  BigInteger, BigInteger, BigInteger
];
export type BigintTwelve = [
  BigInteger, BigInteger, BigInteger, BigInteger,
  BigInteger, BigInteger, BigInteger, BigInteger,
  BigInteger, BigInteger, BigInteger, BigInteger
];

export type NativeBigintTuple = [
  bigint, bigint
];
export type NativeBigintFour = [
  bigint, bigint, bigint, bigint
];
export type NativeBigintSix = [
  bigint, bigint, bigint,
  bigint, bigint, bigint
];
export type NativeBigintTwelve = [
  bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint
];

export enum CurveType {
  WEIERSTRASS = 0,
  EDWARDS = 1,
  MONTGOMERY = 2,
}

export enum SexticTwist {
  D_TYPE = 0,
  M_TYPE = 1,
}

export enum SignOfX {
  NEGATIVEX = 0,
  POSITIVEX = 1,
}

export enum PairingFriendly {
  BN = 0,
  BLS = 1,
}

export interface INonResidues {
  fp: BigInteger[];
  fp2: BigInteger[];
}

export interface ICurve {
  name: string;

  curveType: CurveType;
  sexticTwist: SexticTwist;
  signOfX: SignOfX;
  pairingFriendly: PairingFriendly;

  QNRI: number;
  EFS: number;

  nonresidues: INonResidues;

  A: BigInteger;
  B: BigInteger;
  B2: [BigInteger, BigInteger];

  // x (only positive)
  x: BigInteger;

  // a characteristic
  P: BigInteger;

  // an order
  r: BigInteger;

  // a cofactor
  h: BigInteger;

  Gx: BigInteger;
  Gy: BigInteger;

  G2x: [BigInteger, BigInteger];
  G2y: [BigInteger, BigInteger];
}

import Curve from './curve';
