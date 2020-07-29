import {
  BigintTuple, ICurve
} from './types';
import {
  bitLen
} from './utils';
import {
  FQP
} from './intl';
import Fq from './fq';

export default class Fq2 extends FQP<Fq2, Fq, [Fq, Fq]> {
  public static ROOT(curve: ICurve) {
    return new Fq(curve, -1n);
  }

  public static MAX_BITS(curve: ICurve) {
    return bitLen(curve.P) * 2;
  }

  public static ZERO(curve: ICurve) {
    return new Fq2(curve, [0n, 0n]);
  }

  public static ONE(curve: ICurve) {
    return new Fq2(curve, [1n, 0n]);
  }

  // public static ORDER(curve: ICurve): bigint {
  //   return curve.P;
  // }
  //
  // public get order(): bigint {
  //   return this.curve.P2;
  // }

  public readonly c: [Fq, Fq];

  public toTuple(): [bigint, bigint] {
    return [this.c[0].value, this.c[1].value];
  }

  constructor(public readonly curve: ICurve, coeffs: [Fq, Fq] | [bigint, bigint] | bigint[]) {
    super();
    if (coeffs.length !== 2) throw new Error('Expected array with 2 elements');
    coeffs.forEach((c: any, i: any) => {
      if (typeof c === 'bigint') coeffs[i] = new Fq(curve, c);
    });
    this.c = coeffs as [Fq, Fq];
  }
  init(tuple: [Fq, Fq]) {
    return new Fq2(this.curve, tuple);
  }
  toString() {
    return `Fq2(${this.c[0]} + ${this.c[1]}×i)`;
  }
  get values(): BigintTuple {
    return this.c.map((c) => c.value) as BigintTuple;
  }

  multiply(rhs: Fq2 | bigint): Fq2 {
    if (typeof rhs === 'bigint')
      return new Fq2(this.curve,
        this.map<Fq, [Fq, Fq]>((c) => c.multiply(rhs))
      );
    // (a+bi)(c+di) = (ac−bd) + (ad+bc)i
    const [c0, c1] = this.c;
    const [r0, r1] = rhs.c;
    const t1 = c0.multiply(r0); // c0 * o0
    const t2 = c1.multiply(r1); // c1 * o1
    // (T1 - T2) + ((c0 + c1) * (r0 + r1) - (T1 + T2))*i
    return new Fq2(this.curve, [t1.subtract(t2), c0.add(c1).multiply(r0.add(r1)).subtract(t1.add(t2))]);
  }

  // multiply by u + 1
  mulByNonresidue() {
    const c0 = this.c[0];
    const c1 = this.c[1];
    return new Fq2(this.curve, [c0.subtract(c1), c0.add(c1)]);
  }

  square() {
    const c0 = this.c[0];
    const c1 = this.c[1];
    const a = c0.add(c1);
    const b = c0.subtract(c1);
    const c = c0.add(c0);
    return new Fq2(this.curve, [a.multiply(b), c.multiply(c1)]);
  }

  public times_i(): Fq2 {
    return new Fq2(this.curve, [
      this.c[1].negate(), this.c[0]
    ]);
  }

  mulQNR(): Fq2 {
    // assume QNR=2^i+sqrt(-1)
    return (this.times_i().add(this.muli(BigInt(1 << this.curve.QNRI))));
  }

  // We wish to find the multiplicative inverse of a nonzero
  // element a + bu in Fp2. We leverage an identity
  //
  // (a + bu)(a - bu) = a^2 + b^2
  //
  // which holds because u^2 = -1. This can be rewritten as
  //
  // (a + bu)(a - bu)/(a^2 + b^2) = 1
  //
  // because a^2 + b^2 = 0 has no nonzero solutions for (a, b).
  // This gives that (a - bu)/(a^2 + b^2) is the inverse
  // of (a + bu). Importantly, this can be computing using
  // only a single inversion in Fp.
  invert() {
    const [a, b] = this.values;
    const factor = new Fq(this.curve, a * a + b * b).invert();
    return new Fq2(this.curve, [factor.multiply(new Fq(this.curve, a)), factor.multiply(new Fq(this.curve, -b))]);
  }

  // Raises to q**i -th power
  // frobeniusMap(power: number): Fq2 {
  //   return new Fq2(this.curve, [this.c[0], this.c[1].multiply(Fq2.FROBENIUS_COEFFICIENTS[power % 2])]);
  // }
  multiplyByB() {
    const [c0, c1] = this.c;
    const t0 = c0.multiply(4n); // 4 * c0
    const t1 = c1.multiply(4n); // 4 * c1
    // (T0-T1) + (T0+T1)*i
    return new Fq2(this.curve,[t0.subtract(t1), t0.add(t1)]);
  }

  muli(rhs: bigint) {
    return new Fq2(
      this.curve,
      [
        this.c[0].muli(rhs), this.c[1].muli(rhs)
      ]
    );
  }

  muls(rhs: Fq) {
    return new Fq2(
      this.curve,
      [
        this.c[0].multiply(rhs), this.c[1].multiply(rhs)
      ]
    );
  }
}
