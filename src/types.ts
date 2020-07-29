export type Bytes = Uint8Array | string;
export type PrivateKey = Bytes | bigint | number;

// Finite field
export interface Field<T> {
  isZero(): boolean;
  equals(rhs: T): boolean;
  negate(): T;
  add(rhs: T): T;
  subtract(rhs: T): T;
  invert(): T;
  multiply(rhs: T | bigint): T;
  square(): T;
  pow(n: bigint): T;
  div(rhs: T | bigint): T;
}

export type FieldStatic<T extends Field<T>> = { ZERO(curve: ICurve): T; ONE(curve: ICurve): T };

export interface IECPoint<T extends Field<T>> {
  isInf(): boolean;
  equals(rhs: IECPoint<T>): boolean;
  negate(): this;
  double(): this;
  add(rhs: IECPoint<T>): this;
  validatePoint(): boolean;
}

export type BigintTuple = [bigint, bigint];

// prettier-ignore
export type BigintFour = [
  bigint, bigint, bigint, bigint
];

// prettier-ignore
export type BigintSix = [
  bigint, bigint, bigint,
  bigint, bigint, bigint,
];

// prettier-ignore
export type BigintTwelve = [
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

export interface ICurve {
  curveType: CurveType;
  sexticTwist: SexticTwist;
  signOfX: SignOfX;
  pairingFriendly: PairingFriendly;

  QNRI: number;
  EFS: number;

  // a characteristic
  P: bigint;
  // an order
  r: bigint;
  // a cofactor
  h: bigint;
  Gx: bigint;
  Gy: bigint;
  A: bigint;
  B: bigint;
  B2: [bigint, bigint];

  G2x: [bigint, bigint];
  G2y: [bigint, bigint];

  // x (only positive)
  x: bigint;

  Fra: bigint;
  Frb: bigint;
}
