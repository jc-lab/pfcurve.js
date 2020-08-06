import {
  BigInteger, bigInt,
  Field, FieldStatic, ICurve
} from './types';
import {
  mod, powMod, bitLen
} from './utils';
import Curve from './curve';

export default class Fr implements Field<Fr> {
  public readonly curve: Curve;

  static isValid(curve: Curve, b: BigInteger): boolean {
    return b <= curve.P;
  }

  isValid(): boolean {
    return this.value <= this.curve.P;
  }

  readonly value: BigInteger;
  constructor(curve: Curve, value: BigInteger) {
    this.curve = curve;
    this.value = mod(value, this.order);
  }

  public get order(): BigInteger {
    return this.curve.r;
  }

  public get maxBits() {
    return bitLen(this.curve.r);
  }

  public static MAX_BITS(curve: Curve) {
    return bitLen(curve.r);
  }

  public static ZERO(curve: Curve) {
    return new Fr(curve, bigInt.zero);
  }

  public static ONE(curve: Curve) {
    return new Fr(curve, bigInt.one);
  }

  public static fromConstant(curve: Curve, c: BigInteger) {
    return new Fr(curve, c);
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  equals(rhs: Fr): boolean {
    return this.value.equals(rhs.value);
  }

  negate(): Fr {
    return new Fr(this.curve, this.value.negate());
  }

  invert(): Fr {
    let [x0, x1, y0, y1] = [bigInt.one, bigInt.zero, bigInt.zero, bigInt.one];
    let a = this.order;
    let b = this.value;
    let q: BigInteger;
    while (!a.isZero()) {
      [q, b, a] = [b.divide(a), a, b.mod(a)];
      [x0, x1] = [x1, x0.subtract(q.multiply(x1))];
      [y0, y1] = [y1, y0.subtract(q.multiply(y1))];
    }
    return new Fr(this.curve, x0);
  }

  add(rhs: Fr): Fr {
    return new Fr(this.curve, this.value.add(rhs.value));
  }

  square(): Fr {
    return new Fr(this.curve, this.value.square());
  }

  pow(n: BigInteger): Fr {
    return new Fr(this.curve, powMod(this.value, n, this.order));
  }

  subtract(rhs: Fr): Fr {
    return new Fr(this.curve, this.value.subtract(rhs.value));
  }

  multiply(rhs: Fr | BigInteger): Fr {
    if (rhs instanceof Fr) rhs = rhs.value;
    return new Fr(this.curve, this.value.multiply(rhs));
  }

  div(rhs: Fr | BigInteger): Fr {
    const inv = bigInt.isInstance(rhs) ? new Fr(this.curve, rhs).invert().value : rhs.invert();
    return this.multiply(inv);
  }
  legendre(): Fr {
    return this.pow((this.order.subtract(bigInt.one)).divide(bigInt['2']));
  }
  // Tonelli-Shanks algorithm
  sqrt(): Fr | undefined {
    if (!this.legendre().equals(new Fr(this.curve, bigInt.one))) return;
    const P = this.order;
    let q: BigInteger, s: number, z: BigInteger;
    for (q = P.subtract(bigInt.one), s = 0; q.mod(bigInt['2']).isZero(); q = q.divide(bigInt['2']), s++);
    if (s == 1) return this.pow((P.add(bigInt['1'])).divide(bigInt['4']));
    for (z = bigInt['2']; z < P && new Fr(this.curve, z).legendre().value.notEquals(P.subtract(bigInt.one)); z = z.add(bigInt.one));

    let c = powMod(z, q, P);
    let r = powMod(this.value, (q.add(bigInt.one)).divide(bigInt['2']), P);
    let t = powMod(this.value, q, P);

    let t2 = bigInt.zero;
    while (!mod(t.subtract(bigInt.one), P).isZero()) {
      t2 = mod(t.square(), P);
      let i;
      for (i = 1; i < s; i++) {
        if (mod(t2.subtract(bigInt.one), P).isZero()) break;
        t2 = mod(t2.square(), P);
      }
      const b = powMod(c, bigInt(1 << (s - i - 1)), P);
      r = mod(r.multiply(b), P);
      c = mod(b.square(), P);
      t = mod(t.multiply(c), P);
      s = i;
    }
    return new Fr(this.curve, r);
  }

  toString() {
    return '0x' + this.value.toString(16).padStart(64, '0');
  }
}

// @ts-ignore
const typeTester: FieldStatic<Fr> = Fr;
typeTester;
