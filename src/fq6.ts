import {
  ICurve, BigintSix, FieldStatic
} from './types';
import {
  FQP
} from './intl';
import Curve from './curve';
import Fq2 from './fq2';

const S_CURVE = Symbol('curve');
export default class Fq6 extends FQP<Fq6, Fq2, [Fq2, Fq2, Fq2]> {
  private readonly [S_CURVE]: Curve;

  static fromTuple(curve: Curve, t: BigintSix): Fq6 {
    return new Fq6(curve, [new Fq2(curve, t.slice(0, 2)), new Fq2(curve, t.slice(2, 4)), new Fq2(curve, t.slice(4, 6))]);
  }

  public static ZERO(curve: Curve) {
    return new Fq6(curve, [Fq2.ZERO(curve), Fq2.ZERO(curve), Fq2.ZERO(curve)]);
  }

  public static ONE(curve: Curve) {
    return new Fq6(curve, [Fq2.ONE(curve), Fq2.ZERO(curve), Fq2.ZERO(curve)]);
  }

  public static fromConstant(curve: Curve, c: bigint) {
    return Fq6.fromTuple(curve, [c, 0n, 0n, 0n, 0n, 0n]);
  }

  public toTuple(): BigintSix {
    return this.c.reduce(
      (out, cur) => {
        out.push(...cur.toTuple());
        return out;
      },
      [] as bigint[]
    ) as BigintSix;
  }

  constructor(curve: Curve, public readonly c: [Fq2, Fq2, Fq2]) {
    super();
    if (c.length !== 3) throw new Error('Expected array with 3 elements');
    this[S_CURVE] = curve;
  }

  public get curve() {
    return this[S_CURVE];
  }

  init(triple: [Fq2, Fq2, Fq2]) {
    return new Fq6(this.curve, triple);
  }

  toString() {
    return `Fq6(${this.c[0]} + ${this.c[1]} * v, ${this.c[2]} * v^2)`;
  }
  // conjugate(): Fq2 {
  //   return this.c[0].subtract(this.c[1]);
  // }

  multiply(rhs: Fq6 | bigint) {
    if (typeof rhs === 'bigint')
      return new Fq6(this.curve, [this.c[0].multiply(rhs), this.c[1].multiply(rhs), this.c[2].multiply(rhs)]);
    const [c0, c1, c2] = this.c;
    const [r0, r1, r2] = rhs.c;
    const t0 = c0.multiply(r0); // c0 * o0
    const t1 = c1.multiply(r1); // c1 * o1
    const t2 = c2.multiply(r2); // c2 * o2
    return new Fq6(this.curve, [
      // t0 + (c1 + c2) * (r1 * r2) - (T1 + T2) * (u + 1)
      t0.add(c1.add(c2).multiply(r1.add(r2)).subtract(t1.add(t2)).mulByNonresidue()),
      // (c0 + c1) * (r0 + r1) - (T0 + T1) + T2 * (u + 1)
      c0.add(c1).multiply(r0.add(r1)).subtract(t0.add(t1)).add(t2.mulByNonresidue()),
      // T1 + (c0 + c2) * (r0 + r2) - T0 + T2
      t1.add(c0.add(c2).multiply(r0.add(r2)).subtract(t0.add(t2))),
    ]);
  }


  // Multiply by quadratic nonresidue v.
  mulByNonresidue() {
    return new Fq6(this.curve, [this.c[2].mulByNonresidue(), this.c[0], this.c[1]]);
  }
  // Sparse multiplication
  multiplyBy1(b1: Fq2): Fq6 {
    return new Fq6(this.curve, [
      this.c[2].multiply(b1).mulByNonresidue(),
      this.c[0].multiply(b1),
      this.c[1].multiply(b1),
    ]);
  }
  // Sparse multiplication
  multiplyBy01(b0: Fq2, b1: Fq2): Fq6 {
    const [c0, c1, c2] = this.c;
    const t0 = c0.multiply(b0); // c0 * b0
    const t1 = c1.multiply(b1); // c1 * b1
    return new Fq6(this.curve, [
      // ((c1 + c2) * b1 - T1) * (u + 1) + T0
      c1.add(c2).multiply(b1).subtract(t1).mulByNonresidue().add(t0),
      // (b0 + b1) * (c0 + c1) - T0 - T1
      b0.add(b1).multiply(c0.add(c1)).subtract(t0).subtract(t1),
      // (c0 + c2) * b0 - T0 + T1
      c0.add(c2).multiply(b0).subtract(t0).add(t1),
    ]);
  }

  multiplyByFq2(rhs: Fq2): Fq6 {
    return new Fq6(this.curve, this.map((c) => c.multiply(rhs)));
  }

  square() {
    const [c0, c1, c2] = this.c;
    const t0 = c0.square(); // c0^2
    const t1 = c0.multiply(c1).multiply(2n); // 2 * c0 * c1
    const t3 = c1.multiply(c2).multiply(2n); // 2 * c1 * c2
    const t4 = c2.square(); // c2^2
    return new Fq6(this.curve, [
      t3.mulByNonresidue().add(t0), // T3 * (u + 1) + T0
      t4.mulByNonresidue().add(t1), // T4 * (u + 1) + T1
      // T1 + (c0 - c1 + c2)^2 + T3 - T0 - T4
      t1.add(c0.subtract(c1).add(c2).square()).add(t3).subtract(t0).subtract(t4),
    ]);
  }

  invert() {
    const [c0, c1, c2] = this.c;
    const t0 = c0.square().subtract(c2.multiply(c1).mulByNonresidue()); // c0^2 - c2 * c1 * (u + 1)
    const t1 = c2.square().mulByNonresidue().subtract(c0.multiply(c1)); // c2^2 * (u + 1) - c0 * c1
    const t2 = c1.square().subtract(c0.multiply(c2)); // c1^2 - c0 * c2
    // 1/(((c2 * T1 + c1 * T2) * v) + c0 * T0)
    const t4 = c2.multiply(t1).add(c1.multiply(t2)).mulByNonresidue().add(c0.multiply(t0)).invert();
    return new Fq6(this.curve, [t4.multiply(t0), t4.multiply(t1), t4.multiply(t2)]);
  }

  // Raises to q**i -th power
  frobeniusMap(power: number) {
    return new Fq6(this.curve, [
      this.c[0].frobeniusMap(power),
      this.c[1].frobeniusMap(power).multiply(this.curve.frobeniusCoeffses.fq6[0][power % 6]),
      this.c[2].frobeniusMap(power).multiply(this.curve.frobeniusCoeffses.fq6[1][power % 6]),
    ]);
  }

  mul_tau() {
    const tx = this.c[1];
    const ty = this.c[0];
    const tz = this.c[2].mulByNonresidue();
    // const tz = a.c[2].mul_xi();
    return new Fq6(this.curve, [tz, ty, tx]);
  }
}

// @ts-ignore
const typeTester: FieldStatic<Fq6> = Fq6;
typeTester;

