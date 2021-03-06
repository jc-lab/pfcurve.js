import {
  BigInteger, bigInt,
  ICurve, BigintFour, FieldStatic, NativeBigintFour
} from './types';
import {
  FQP
} from './intl';
import Curve from './curve';
import Fq from './fq';
import Fq2 from './fq2';

const S_CURVE = Symbol('curve');
export default class Fq4 extends FQP<Fq4, Fq2, [Fq2, Fq2]> {
  private readonly [S_CURVE]: Curve;

  static fromTuple(curve: Curve, t: BigintFour | NativeBigintFour): Fq4 {
    const q = (t as any[]).map<Fq>(v => (typeof v === 'bigint' || bigInt.isInstance(v)) ? new Fq(curve, v) : v);
    return new Fq4(curve, [
      new Fq2(curve, [q[0], q[1]]),
      new Fq2(curve, [q[2], q[3]])
    ]);
  }

  public static ZERO(curve: Curve) {
    return new Fq4(curve, [Fq2.ZERO(curve), Fq2.ZERO(curve)]);
  }

  public static ONE(curve: Curve) {
    return new Fq4(curve, [Fq2.ONE(curve), Fq2.ZERO(curve)]);
  }

  public static fromConstant(curve: Curve, c: BigInteger) {
    return Fq4.fromTuple(curve, [c, bigInt.zero, bigInt.zero, bigInt.zero]);
  }

  public toTuple(): BigintFour {
    return this.c.reduce(
      (out, cur) => {
        out.push(...cur.toTuple());
        return out;
      },
      [] as BigInteger[]
    ) as BigintFour;
    // return [...this.c.map(v => v.toTuple())] as any;
  }

  constructor(curve: Curve, public readonly c: [Fq2, Fq2]) {
    super();
    if (c.length !== 2) throw new Error('Expected array with 2 elements');
    this[S_CURVE] = curve;
  }

  public get curve() {
    return this[S_CURVE];
  }

  init(triple: [Fq2, Fq2]) {
    return new Fq4(this.curve, triple);
  }
  toString() {
    return `Fq4(${this.c[0]} + ${this.c[1]} * v)`;
  }
  // conjugate(): Fq2 {
  //   return this.c[0].subtract(this.c[1]);
  // }

  multiply(rhs: Fq4 | BigInteger) {
    if (bigInt.isInstance(rhs))
      return new Fq4(this.curve, [this.c[0].multiply(rhs), this.c[1].multiply(rhs)]);
    let [c0, c1] = this.c;
    const [r0, r1] = rhs.c;
    const t1 = c0.multiply(r0);
    const t2 = c1.multiply(r1);
    const t3 = r0.add(r1);
    c1 = c1.add(c0);
    c1 = c1.multiply(t3);
    c1 = c1.subtract(t1);
    c1 = c1.subtract(t2);
    c0 = t1.add(t2.mulQNR());
    return new Fq4(this.curve, [c0, c1]);
  }

  multiplyByFq2(rhs: Fq2): Fq4 {
    return new Fq4(this.curve, this.map((c) => c.multiply(rhs)));
  }


  mulQNR() {
    return new Fq4(this.curve, [this.c[1].mulQNR(), this.c[0]]);
  }

  square() {
    let [c0, c1] = this.c;
    let t0 = c0.add(c1).multiply(c0.add(c1.mulQNR()));
    c1 = c1.multiply(c0);
    t0 = t0.subtract(c1);
    t0 = t0.subtract(c1.mulQNR());
    c1 = c1.add(c1);
    c0 = t0;
    return new Fq4(this.curve, [
      c0, c1
    ]);
  }

  invert() {
    const [c0, c1] = this.c;
    const w = this.conjugate();
    let t0 = c0.square().subtract(c1.square().mulQNR());
    t0 = t0.invert();
    return new Fq4(this.curve, [
      w.c[0].multiply(t0),
      w.c[1].multiply(t0)
    ]);
  }
}

// @ts-ignore
const typeTester: FieldStatic<Fq4> = Fq4;
typeTester;

