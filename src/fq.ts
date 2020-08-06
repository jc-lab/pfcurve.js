import {
  BigInteger, bigInt,
  Field, FieldStatic, ICurve
} from './types';
import {
  mod, powMod, bitLen, sqrtMod
} from './utils';
import Curve from './curve';

const S_CURVE = Symbol('curve');
export default class Fq implements Field<Fq> {
  private readonly [S_CURVE]: Curve;

  readonly value: BigInteger;
  constructor(curve: Curve, value: BigInteger | bigint) {
    this[S_CURVE] = curve;
    value = bigInt.isInstance(value) ? value : bigInt(value);
    this.value = mod(value, this.order);
  }

  public get curve() {
    return this[S_CURVE];
  }

  public get order(): BigInteger {
    return this[S_CURVE].P;
  }

  public get maxBits() {
    return bitLen(this.curve.P);
  }

  public static ORDER(curve: Curve) {
    return curve.P;
  }

  public static Pmod4(curve: Curve) {
    return Fq.ORDER(curve).mod(bigInt['4']);
  }

  public static MAX_BITS(curve: Curve) {
    return bitLen(curve.P);
  }

  public static ZERO(curve: Curve) {
    return new Fq(curve, bigInt.zero);
  }

  public static ONE(curve: Curve) {
    return new Fq(curve, bigInt.one);
  }

  public static fromConstant(curve: Curve, c: BigInteger) {
    return new Fq(curve, c);
  }

  isSquare(): boolean {
    const a = this.sqrt();
    const b = a.square();
    return a.equals(b);
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  equals(rhs: Fq): boolean {
    return this.value.equals(rhs.value);
  }

  negate(): Fq {
    return new Fq(this.curve, this.value.negate());
  }

  invert(): Fq {
    let [x0, x1, y0, y1] = [bigInt.one, bigInt.zero, bigInt.zero, bigInt.one];
    let a = this.order;
    let b = this.value;
    let q: BigInteger;
    while (!a.isZero()) {
      [q, b, a] = [b.divide(a), a, b.mod(a)];
      [x0, x1] = [x1, x0.subtract(q.multiply(x1))];
      [y0, y1] = [y1, y0.subtract(q.multiply(y1))];
    }
    return new Fq(this.curve, x0);
  }

  add(rhs: Fq): Fq {
    return new Fq(this.curve, this.value.add(rhs.value));
  }

  qr(): BigInteger {
    return powMod(this.value, (this.order.subtract(bigInt.one)).divide(bigInt['2']), this.order);
  }

  square(): Fq {
    return new Fq(this.curve, this.value.square());
  }

  sqrt(): Fq {
    return new Fq(this.curve, sqrtMod(this.value, this.order));
  }

  pow(n: BigInteger): Fq {
    return new Fq(this.curve, powMod(this.value, n, this.order));
  }

  subtract(rhs: Fq): Fq {
    return new Fq(this.curve, this.value.subtract(rhs.value));
  }

  multiply(rhs: Fq | BigInteger): Fq {
    if (rhs instanceof Fq) rhs = rhs.value;
    return new Fq(this.curve, this.value.multiply(rhs));
  }

  div(rhs: Fq | BigInteger): Fq {
    const inv = bigInt.isInstance(rhs) ? new Fq(this.curve, rhs).invert().value : rhs.invert();
    return this.multiply(inv);
  }

  muli(rhs: BigInteger) {
    return new Fq(this.curve, this.value.multiply(rhs).mod(this.order));
  }

  toString() {
    const str = this.value.toString(16).padStart(96, '0');
    return str.slice(0, 2) + '.' + str.slice(-2);
  }
}

// @ts-ignore
const typeTester: FieldStatic<Fq> = Fq;
typeTester;
