import {
  BigintTuple, ICurve
} from './types';
import {
  bitLen
} from './utils';
import {
  FQP
} from './intl';
import Curve from './curve';
import Fq from './fq';

const S_CURVE = Symbol('curve');
export default class Fq2 extends FQP<Fq2, Fq, [Fq, Fq]> {
  private readonly [S_CURVE]: Curve;

  static fromTuple(curve: Curve, t: BigintTuple): Fq2 {
    return new Fq2(curve, [new Fq(curve, t[0]), new Fq(curve, t[1])]);
  }

  public static ROOT(curve: Curve) {
    return new Fq(curve, -1n);
  }

  public static MAX_BITS(curve: Curve) {
    return bitLen(curve.P) * 2;
  }

  public static ZERO(curve: Curve) {
    return new Fq2(curve, [0n, 0n]);
  }

  public static ONE(curve: Curve) {
    return new Fq2(curve, [1n, 0n]);
  }

  public static fromConstant(curve: Curve, c: bigint) {
    return Fq2.fromTuple(curve, [c, 0n]);
  }

  public readonly c: [Fq, Fq];

  public toTuple(): [bigint, bigint] {
    return [this.c[0].value, this.c[1].value];
  }

  constructor(curve: Curve, coeffs: [Fq, Fq] | [bigint, bigint] | bigint[]) {
    super();
    if (coeffs.length !== 2) throw new Error('Expected array with 2 elements');
    coeffs.forEach((c: any, i: any) => {
      if (typeof c === 'bigint') coeffs[i] = new Fq(curve, c);
    });
    this.c = coeffs as [Fq, Fq];
    this[S_CURVE] = curve;
  }

  public get curve() {
    return this[S_CURVE];
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

  public sign(): bigint {
    const p1 = this.c[0].value & 1n;
    const p2 = this.c[1].value & 1n;
    const u = this.c[0].isZero() ? 1n : 0n;
    return p1 ^ ((p1^p2) & u);
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

  // = mul by xi
  mulByNonresidue() {
    return this.multiply(Fq2.fromTuple(this.curve, this.curve.nonresidues.fp2 as BigintTuple));
  }

  square() {
    const c0 = this.c[0];
    const c1 = this.c[1];
    const a = c0.add(c1);
    const b = c0.subtract(c1);
    const c = c0.add(c0);
    return new Fq2(this.curve, [a.multiply(b), c.multiply(c1)]); //(2(a+b)) * b => 2ab+2bb = 2(ab+bb)
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

  divQNR(): Fq2 {
    // assume QNR=2^i+sqrt(-1)
    const z = new Fq2(this.curve, [Fq.fromConstant(this.curve, BigInt(1 << this.curve.QNRI)), Fq.ONE(this.curve)]);
    return this.multiply(z.invert());
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
  frobeniusMap(power: number): Fq2 {
    return new Fq2(this.curve, [this.c[0], this.c[1].multiply(this.curve.frobeniusCoeffses.fq2[power % 2])]);
  }

  /**
   *
   Frobenius
   i^2 = -1
   (a + bi)^p = a + bi^p in Fp
   = a + bi if p = 1 mod 4
   = a - bi if p = 3 mod 4
   */
  frobenius(): Fq2 {
    const pmod4 = Fq.Pmod4(this.curve);
    let y: Fq2;
    if (pmod4 === 1n) {
      y = this;
    } else {
      y = new Fq2(this.curve, [this.c[0], this.c[1].negate()]);
    }
    return y;
  }

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

  public sqrt(): Fq2 {
    let w1 = this.c[1];
    let w2 = this.c[0];
    w1 = w1.multiply(w1);
    w2 = w2.multiply(w2);
    w1 = w1.add(w2);
    w1 = w1.sqrt();
    w2 = this.c[0];
    w2 = w2.add(w1);
    w2 = w2.div(2n);
    if (w2.qr().valueOf() != 1n) {
      w2 = this.c[0];
      w2 = w2.subtract(w1);
      w2 = w2.div(2n);
    }
    w2 = w2.sqrt();
    const c0 = w2;
    w2 = w2.add(w2);
    w2 = w2.invert();
    const c1 = this.c[1].multiply(w2);
    return new Fq2(this.curve, [c0, c1]);
  }

  public qr(): bigint {
    const w = this.conjugate()
      .multiply(this);
    return w.c[0].qr();
  }

  // public mulxi(): Fq2 {
  //   const x = this;
  //   const xi_a = this.curve.nonresidues.fp2[0];
  //   if (xi_a === 1n) {
  //     const t = x.c[0].add(x.c[1]);
  //     const ya = x.c[0].subtract(x.c[1]);
  //     return new Fq2(this.curve, [ya, t]);
  //   } else {
  //     let t = x.c[0].multiply(xi_a);
  //     t = t.subtract(x.c[1]);
  //     let yb = x.c[1].multiply(xi_a);
  //     yb = yb.add(x.c[0]);
  //     return new Fq2(this.curve, [t, yb]);
  //   }
  // }
}
