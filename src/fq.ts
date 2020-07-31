import {
  Field, FieldStatic, ICurve
} from './types';
import {
  mod, powMod, bitLen, sqrtMod
} from './utils';

export default class Fq implements Field<Fq> {
  public readonly curve: ICurve;

  readonly value: bigint;
  constructor(curve: ICurve, value: bigint) {
    this.curve = curve;
    this.value = mod(value, this.order);
  }

  public get order(): bigint {
    return this.curve.P;
  }

  public get maxBits() {
    return bitLen(this.curve.P);
  }

  public static ORDER(curve: ICurve) {
    return curve.P;
  }

  public static MAX_BITS(curve: ICurve) {
    return bitLen(curve.P);
  }

  public static ZERO(curve: ICurve) {
    return new Fq(curve, 0n);
  }

  public static ONE(curve: ICurve) {
    return new Fq(curve, 1n);
  }

  public static fromConstant(curve: ICurve, c: bigint) {
    return new Fq(curve, c);
  }

  isSquare(): boolean {
    const a = this.sqrt();
    const b = a.square();
    return a.equals(b);
  }

  isZero(): boolean {
    return this.value === 0n;
  }

  equals(rhs: Fq): boolean {
    return this.value === rhs.value;
  }

  negate(): Fq {
    return new Fq(this.curve, -this.value);
  }

  invert(): Fq {
    let [x0, x1, y0, y1] = [1n, 0n, 0n, 1n];
    let a = this.order;
    let b = this.value;
    let q;
    while (a !== 0n) {
      [q, b, a] = [b / a, a, b % a];
      [x0, x1] = [x1, x0 - q * x1];
      [y0, y1] = [y1, y0 - q * y1];
    }
    return new Fq(this.curve, x0);
  }

  add(rhs: Fq): Fq {
    return new Fq(this.curve, this.value + rhs.value);
  }

  qr(): bigint {
    return powMod(this.value, (this.order - 1n) / 2n, this.order);
  }

  square(): Fq {
    return new Fq(this.curve, this.value * this.value);
  }

  sqrt(): Fq {
    return new Fq(this.curve, sqrtMod(this.value, this.order));
  }

  pow(n: bigint): Fq {
    return new Fq(this.curve, powMod(this.value, n, this.order));
  }

  subtract(rhs: Fq): Fq {
    return new Fq(this.curve, this.value - rhs.value);
  }

  multiply(rhs: Fq | bigint): Fq {
    if (rhs instanceof Fq) rhs = rhs.value;
    return new Fq(this.curve, this.value * rhs);
  }

  div(rhs: Fq | bigint): Fq {
    const inv = typeof rhs === 'bigint' ? new Fq(this.curve, rhs).invert().value : rhs.invert();
    return this.multiply(inv);
  }

  muli(rhs: bigint) {
    return new Fq(this.curve, this.value * rhs % this.order);
  }

  toString() {
    const str = this.value.toString(16).padStart(96, '0');
    return str.slice(0, 2) + '.' + str.slice(-2);
  }
}

// @ts-ignore
const typeTester: FieldStatic<Fq> = Fq;
typeTester;
