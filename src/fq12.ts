import {
  BigintFour, BigintSix, BigintTwelve, FieldStatic, ICurve, PairingFriendly, SexticTwist, SignOfX
} from './types';
import {
  FQP
} from './intl';
import Fq from './fq';
import Fq2 from './fq2';
import Fq4 from './fq4';

export default class Fq12 extends FQP<Fq12, Fq4, [Fq4, Fq4, Fq4]> {
  public static ZERO(curve: ICurve) {
    return new Fq12(curve, [Fq4.ZERO(curve), Fq4.ZERO(curve), Fq4.ZERO(curve)]);
  }

  public static ONE(curve: ICurve) {
    return new Fq12(curve, [Fq4.ONE(curve), Fq4.ZERO(curve), Fq4.ZERO(curve)]);
  }

  public static fromConstant(curve: ICurve, c: bigint) {
    return Fq2.fromTuple(curve, [c, 0n]);
  }

  static fromTuple(curve: ICurve, t: BigintTwelve): Fq12 {
    return new Fq12(curve, [
      Fq4.fromTuple(curve, t.slice(0, 4) as BigintFour),
      Fq4.fromTuple(curve, t.slice(4, 8) as BigintFour),
      Fq4.fromTuple(curve, t.slice(8, 12) as BigintFour),
    ]);
  }

  public toTuple(): BigintSix {
    return this.c.reduce(
      (out, cur) => {
        out.push(...cur.toTuple());
        return out;
      },
      [] as bigint[]
    ) as BigintSix;
    // return [...this.c.map(v => v.toTuple())] as any;
  }

  constructor(public readonly curve: ICurve, public readonly c: [Fq4, Fq4, Fq4]) {
    super();
    if (c.length !== 3) throw new Error('Expected array with 3 elements');
  }
  init(c: [Fq4, Fq4, Fq4]) {
    return new Fq12(this.curve, c);
  }
  toString() {
    return `Fq12(${this.c[0]} + ${this.c[1]} * w + ${this.c[2]} * w^2)`;
  }

  multiply(rhs: Fq12 | bigint) {
    if (typeof rhs === 'bigint')
      return new Fq12(this.curve, [this.c[0].multiply(rhs), this.c[1].multiply(rhs), this.c[2].multiply(rhs)]);
    let [c0, c1, c2] = this.c;
    const [r0, r1, r2] = rhs.c;
    const zero_c = r2.isZero();
    const zero_b = r1.isZero();
    let Z1: Fq4, Z2: Fq4, Z3: Fq4;
    let T0: Fq4, T1: Fq4;

    const Z0 = c0.multiply(r0);
    if (!zero_b) {
      Z2 = c1.multiply(r1);
    }
    T0 = c0.add(c1);
    T1 = r0.add(r1);
    Z1 = T0.multiply(T1);
    Z1 = Z1.subtract(Z0);
    if (!zero_b) {
      // @ts-ignore
      Z1 = Z1.subtract(Z2);
    }
    T0 = c1.add(c2);
    T1 = r1.add(r2);
    Z3 = T0.multiply(T1);
    if (!zero_b) {
      // @ts-ignore
      Z3 = Z3.subtract(Z2);
    }
    T0 = c0.add(c2);
    T1 = r0.add(r2);
    T0 = T0.multiply(T1);
    if (!zero_b) {
      // @ts-ignore
      Z2 = Z2.add(T0);
    } else {
      Z2 = T0;
    }
    Z2 = Z2.subtract(Z0);
    c1 = Z1;
    if (!zero_c) {
      T0 = c2.multiply(r2);
      Z2 = Z2.subtract(T0);
      Z3 = Z3.subtract(T0);
      c1 = c1.add(T0.mulQNR());
    }
    c0 = Z0.add(Z3.mulQNR());
    c2 = Z2;
    return new Fq12(this.curve, [
      c0, c1, c2
    ]);
  }

  square() {
    let [c0, c1, c2] = this.c;
    const a = c0.square();
    let b = c1.multiply(c2);
    b = b.add(b);
    const c = c2.square();
    let d = c0.multiply(c1);
    d = d.add(d);
    c2 = c2.add(c0.add(c1));
    c2 = c2.square();
    c0 = a.add(b.mulQNR());
    c1 = d.add(c.mulQNR());
    c2 = c2.subtract(a.add(b).add(c).add(d));
    return new Fq12(this.curve, [
      c0, c1, c2
    ]);
  }


  // # unitary squaring
  usqr() {
    let [a, b, c] = this.c;
    let t0: Fq4, t1: Fq4, t2: Fq4, t3: Fq4;
    t0 = a;
    a = a.square();
    t3 = a;
    a = a.add(a);
    a = a.add(t3);
    t0 = t0.conjugate();
    t0 = t0.add(t0);
    a = a.subtract(t0);
    t1 = c;
    t1 = t1.square();
    t1 = t1.mulQNR();
    t3 = t1;
    t1 = t1.add(t1);
    t1 = t1.add(t3);
    t2 = b;
    t2 = t2.square();
    t3 = t2;
    t2 = t2.add(t2);
    t2 = t2.add(t3);

    b = b.conjugate();
    b = b.add(b);
    c = c.conjugate();
    c = c.add(c);
    c = c.negate();
    b = b.add(t1);
    c = c.add(t2);

    return new Fq12(this.curve, [a,b,c]);
  }

  invert() {
    const [c0, c1, c2] = this.c;

    const wa = c0.multiply(c0).subtract(c1.multiply(c2).mulQNR());
    const wb = (c2.multiply(c2)).mulQNR().subtract(c0.multiply(c1));
    const wc = c1.multiply(c1).subtract(c0.multiply(c2));
    let f = (
      (c1.multiply(wc)).mulQNR()
        .add(c0.multiply(wa))
        .add(c2.multiply(wb).mulQNR()));
    f = f.invert();
    return new Fq12(this.curve, [
      wa.multiply(f), wb.multiply(f), wc.multiply(f)
    ]);
  }

  conjugate() {
    return this.init([
      this.c[0].conjugate(),
      this.c[1].conjugate().negate(),
      this.c[2].conjugate()
    ]);
  }

  // multiply line functions
  smul(other: Fq12) {
    const [c00, c01] = this.c[0].c;
    const [c10, c11] = this.c[1].c;
    const [c20, c21] = this.c[2].c;
    const [r00, r01] = other.c[0].c;
    const [r10, r11] = other.c[1].c;
    const [r20, r21] = other.c[2].c;

    let ca: Fq4, cb: Fq4, cc: Fq4;

    let w1: Fq2, w2: Fq2, w3: Fq2;
    let ta: Fq2, tb: Fq2, tc: Fq2, td: Fq2, te: Fq2;

    if (this.curve.sexticTwist == SexticTwist.D_TYPE) {
      w1 = c00.multiply(r00);
      w2 = c01.multiply(r01);
      w3 = c10.multiply(r10);

      ta = c00.add(c01);
      tb = r00.add(r01);
      tc = ta.multiply(tb);
      tc = tc.subtract(w1.add(w2));

      ta = c00.add(c10);
      tb = r00.add(r10);
      td = ta.multiply(tb);
      td = td.subtract(w1.add(w3));

      ta = c01.add(c10);
      tb = r01.add(r10);
      te = ta.multiply(tb);
      te = te.subtract(w2.add(w3));

      w1 = w1.add(w2.mulQNR());
      ca = new Fq4(this.curve, [w1, tc]);
      cb = new Fq4(this.curve, [td, te]);
      cc = new Fq4(this.curve, [w3, Fq2.ZERO(this.curve)]);
    } else {
      w1 = c00.multiply(r00);
      w2 = c01.multiply(r01);
      w3 = c21.multiply(r21);

      ta = c00.add(c01);
      tb = r00.add(r01);
      tc = ta.multiply(tb);
      tc = tc.subtract(w1.add(w2));

      ta = c00.add(c21);
      tb = r00.add(r21);
      td = ta.multiply(tb);
      td = td.subtract(w1.add(w3));

      ta = c01.add(c21);
      tb = r01.add(r21);
      te = ta.multiply(tb);
      te = te.subtract(w2.add(w3));

      w1 = w1.add(w2.mulQNR());
      ca = new Fq4(this.curve, [w1, tc]);
      cb = new Fq4(this.curve, [w3.mulQNR(), Fq2.ZERO(this.curve)]);
      cb = cb.times_i();
      cc = new Fq4(this.curve, [te.mulQNR(), td]);
    }
    return new Fq12(this.curve, [ca, cb, cc]);
  }

  powq() {
    let [a,b,c] = this.c;
    const X = new Fq2(this.curve, [new Fq(this.curve, this.curve.Fra), new Fq(this.curve, this.curve.Frb)]);
    const X2 = X.square();
    a = a.powq();
    b = b.powq().multiplyByFq2(X);
    c = c.powq().multiplyByFq2(X2);
    return new Fq12(this.curve, [a, b, c]);
  }

  finalExponentiate() {
    let t0: Fq12, r: Fq12, x: bigint, x0: Fq12, x1: Fq12, x2: Fq12, x3: Fq12, x4: Fq12, x5: Fq12, y0: Fq12, y1: Fq12, y2: Fq12, y3: Fq12;
    let res: Fq12;

    r = this;

    // final exp - easy part
    t0 = r;
    r = r.conjugate();

    r = r.multiply(t0.invert());

    t0 = r;
    r = r.powq();
    r = r.powq();
    r = r.multiply(t0);

    // final exp - hard part
    x = this.curve.x;

    if (this.curve.pairingFriendly == PairingFriendly.BN) {
      res = r;

      t0 = res;
      t0 = t0.powq();
      x0 = t0;
      x0 = x0.powq();

      x0 = x0.multiply(res.multiply(t0));
      x0 = x0.powq();

      x1 = res;
      x1 = x1.conjugate();
      x4 = res.pow(x);
      if (this.curve.signOfX == SignOfX.POSITIVEX) {
        x4 = x4.conjugate();
      }
      x3 = x4;
      x3 = x3.powq();

      x2 = x4.pow(x);
      if (this.curve.signOfX == SignOfX.POSITIVEX) {
        x2 = x2.conjugate();
      }

      x5 = x2;
      x5 = x5.conjugate();
      t0 = x2.pow(x);
      if (this.curve.signOfX == SignOfX.POSITIVEX) {
        t0 = t0.conjugate();
      }

      x2 = x2.powq();
      res = x2;
      res = res.conjugate();
      x4 = x4.multiply(res);
      x2 = x2.powq();

      res = t0;
      res = res.powq();
      t0 = t0.multiply(res);

      t0 = t0.usqr();
      t0 = t0.multiply(x4);
      t0 = t0.multiply(x5);
      res = x3.multiply(x5);
      res = res.multiply(t0);
      t0 = t0.multiply(x2);
      res = res.usqr();
      res = res.multiply(t0);
      res = res.usqr();
      t0 = res.multiply(x1);
      res = res.multiply(x0);
      t0 = t0.usqr();
      res = res.multiply(t0);

    } else {  // its a BLS curve
      // Ghamman & Fouotsa Method
      y0 = r;
      y0 = y0.usqr();
      y1 = y0.pow(x);
      if (this.curve.signOfX == SignOfX.NEGATIVEX) {
        y1 = y1.conjugate();
      }
      x = x / 2n;
      y2 = y1.pow(x);
      if (this.curve.signOfX == SignOfX.NEGATIVEX) {
        y2 = y2.conjugate();
      }
      x *= 2n;

      y3 = r;
      y3 = y3.conjugate();
      y1 = y1.multiply(y3);
      y1 = y1.conjugate();
      y1 = y1.multiply(y2);

      y2 = y1.pow(x);
      if (this.curve.signOfX == SignOfX.NEGATIVEX) {
        y2 = y2.conjugate();
      }
      y3 = y2.pow(x);
      if (this.curve.signOfX == SignOfX.NEGATIVEX) {
        y3 = y3.conjugate();
      }
      y1 = y1.conjugate();
      y3 = y3.multiply(y1);

      y1 = y1.conjugate();
      y1 = y1.powq();
      y1 = y1.powq();
      y1 = y1.powq();

      y2 = y2.powq();
      y2 = y2.powq();

      y1 = y1.multiply(y2);

      y2 = y3.pow(x);
      if (this.curve.signOfX == SignOfX.NEGATIVEX) {
        y2 = y2.conjugate();
      }
      y2 = y2.multiply(y0);
      y2 = y2.multiply(r);
      y1 = y1.multiply(y2);
      y3 = y3.powq();
      y1 = y1.multiply(y3);
      res = y1;
    }
    return res;
  }
}

// @ts-ignore
const typeTester: FieldStatic<Fq12> = Fq12;
typeTester;
