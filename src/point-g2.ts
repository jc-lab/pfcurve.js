import {
  CurveType, ICurve, PrivateKey, SexticTwist
} from './types';
import {
  normalizePrivKey
} from './intl';
import {
  ProjectivePoint
} from './point-base';
import Fq from './fq';
import Fq2 from './fq2';

export default class PointG2 extends ProjectivePoint<Fq2> {
  public static BASE(curve: ICurve) {
    return new PointG2(curve, new Fq2(curve, curve.G2x), new Fq2(curve, curve.G2y), Fq2.ONE(curve));
  }

  public static ZERO(curve: ICurve) {
    return new PointG2(curve, Fq2.ONE(curve), Fq2.ONE(curve), Fq2.ZERO(curve));
  }

  public static INF(curve: ICurve) {
    return new PointG2(
      curve,
      Fq2.ZERO(curve),
      Fq2.ONE(curve),
      curve.curveType === CurveType.EDWARDS ? Fq2.ONE(curve) : Fq2.ZERO(curve)
    );
  }

  constructor(curve: ICurve, x: Fq2, y: Fq2, z: Fq2) {
    super(curve, x, y, z, Fq2);
  }

  public isInf(): boolean {
    if (this.x.isZero() || this.z.isZero()) {
      return true;
    }
    return false;
  }

  public equals(rhs: ProjectivePoint<Fq2>) {
    const a1 = this.x.multiply(rhs.z);
    const a2 = rhs.x.multiply(this.z);
    const b1 = this.y.multiply(rhs.z);
    const b2 = rhs.y.multiply(this.z);
    if (!a1.equals(a2)) {
      return false;
    }
    if (!b1.equals(b2)) {
      return false;
    }
    return true;
  }

  public negate(): this {
    if (this.isInf()) {
      return PointG2.INF(this.curve) as any;
    }
    if (this.curve.curveType === CurveType.WEIERSTRASS) {
      return this.getPoint(this.x, this.y.negate(), this.z);
    }
    if (this.curve.curveType === CurveType.EDWARDS) {
      return this.getPoint(this.x.negate(), this.y, this.z);
    }
    return this.getPoint(this.x, this.y, this.z);
  }

  public double() {
    let {x, y, z} = this;
    let iy: Fq2, t0: Fq2, t1: Fq2, t2: Fq2, y3: Fq2;

    iy = y;
    if (this.curve.sexticTwist === SexticTwist.D_TYPE) {
      iy = iy.mulQNR();
    }
    t0 = y;
    t0 = t0.square();
    if (this.curve.sexticTwist === SexticTwist.D_TYPE) {
      t0 = t0.mulQNR();
    }

    t1 = iy;
    t1 = t1.multiply(z);
    t2 = z;
    t2 = t2.square();

    z = t0.add(t0);
    z = z.add(z);
    z = z.add(z);

    t2 = t2.muli(3n * this.curve.B);
    if (this.curve.sexticTwist === SexticTwist.M_TYPE) {
      t2 = t2.mulQNR();
    }
    const x3 = t2.multiply(z);

    y3 = t0.add(t2);
    z = z.multiply(t1);
    t1 = t2.add(t2);
    t2 = t2.add(t1);
    t0 = t0.subtract(t2);
    y3 = y3.multiply(t0);
    y3 = y3.add(x3);
    t1 = x.multiply(iy);
    x = t0;
    x = x.multiply(t1);
    x = x.add(x);
    y = y3;
    return this.getPoint(x, y, z);
  }

  public add(rhs: ProjectivePoint<Fq2>): this {
    let {x, y, z} = this;
    let t0: Fq2, t1: Fq2, t2: Fq2, t3: Fq2, t4: Fq2, x3: Fq2, y3: Fq2, z3: Fq2;

    if (this.isZero()) return rhs as this;
    if (rhs.isZero()) return this;

    t0 = x;
    t0 = t0.multiply(rhs.x);
    t1 = y;
    t1 = t1.multiply(rhs.y);
    t2 = z;
    t2 = t2.multiply(rhs.z);
    t3 = x;
    t3 = t3.add(y);
    t4 = rhs.x.add(rhs.y);
    t3 = t3.multiply(t4);
    t4 = t0.add(t1);

    t3 = t3.subtract(t4);
    if (this.curve.sexticTwist == SexticTwist.D_TYPE) {
      t3 = t3.mulQNR();
    }
    t4 = y.add(z);
    x3 = rhs.y.add(rhs.z);

    t4 = t4.multiply(x3);
    x3 = t1.add(t2);

    t4 = t4.subtract(x3);
    if (this.curve.sexticTwist == SexticTwist.D_TYPE) {
      t4 = t4.mulQNR();
    }

    x3 = x.add(z);
    y3 = rhs.x.add(rhs.z);
    x3 = x3.multiply(y3);
    y3 = t0.add(t2);
    y3 = x3.subtract(y3);

    if (this.curve.sexticTwist == SexticTwist.D_TYPE) {
      t0 = t0.mulQNR();
      t1 = t1.mulQNR();
    }

    x3 = t0.add(t0);
    t0 = t0.add(x3);
    t2 = t2.multiply(3n * this.curve.B);
    if (this.curve.sexticTwist == SexticTwist.M_TYPE) {
      t2 = t2.mulQNR();
    }
    z3 = t1.add(t2);
    t1 = t1.subtract(t2);
    y3 = y3.multiply(3n * this.curve.B);
    if (this.curve.sexticTwist == SexticTwist.M_TYPE) {
      y3 = y3.mulQNR();
    }
    x3 = y3.multiply(t4);
    t2 = t3.multiply(t1);
    x3 = t2.subtract(x3);
    y3 = y3.multiply(t0);
    t1 = t1.multiply(z3);
    y3 = y3.add(t1);
    t0 = t0.multiply(t3);
    z3 = z3.multiply(t4);
    z3 = z3.add(t0);

    x = x3;
    y = y3;
    z = z3;
    return this.getPoint(x, y, z);
  }

  // https://tools.ietf.org/html/draft-irtf-cfrg-hash-to-curve-07#section-3
  // static async hashToCurve(msg: Bytes) {
  //   if (typeof msg === 'string') msg = hexToBytes(msg);
  //   const u = await hash_to_field(msg, 2);
  //   //console.log(`hash_to_curve(msg}) u0=${new Fq2(u[0])} u1=${new Fq2(u[1])}`);
  //   const Q0 = new PointG2(...isogenyMapG2(map_to_curve_SSWU_G2(u[0])));
  //   const Q1 = new PointG2(...isogenyMapG2(map_to_curve_SSWU_G2(u[1])));
  //   const R = Q0.add(Q1);
  //   const P = clearCofactorG2(R);
  //   //console.log(`hash_to_curve(msg) Q0=${Q0}, Q1=${Q1}, R=${R} P=${P}`);
  //   return P;
  // }

  // static fromSignature(hex: Bytes): PointG2 {
  //   const half = hex.length / 2;
  //   const z1 = bytesToNumberBE(hex.slice(0, half));
  //   const z2 = bytesToNumberBE(hex.slice(half));
  //
  //   // indicates the infinity point
  //   const bflag1 = mod(z1, POW_2_383) / POW_2_382;
  //   if (bflag1 === 1n) return this.ZERO;
  //
  //   const x1 = z1 % POW_2_381;
  //   const x2 = z2;
  //   const x = new Fq2([x2, x1]);
  //   let y = x.pow(3n).add(new Fq2(CURVE.b2)).sqrt();
  //   if (!y) throw new Error('Failed to find a square root');
  //
  //   // Choose the y whose leftmost bit of the imaginary part is equal to the a_flag1
  //   // If y1 happens to be zero, then use the bit of y0
  //   const [y0, y1] = y.values;
  //   const aflag1 = (z1 % POW_2_382) / POW_2_381;
  //   const isGreater = y1 > 0n && (y1 * 2n) / P !== aflag1;
  //   const isZero = y1 === 0n && (y0 * 2n) / P !== aflag1;
  //   if (isGreater || isZero) y = y.multiply(-1n);
  //   const point = new PointG2(x, y, Fq2.ONE);
  //   point.assertValidity();
  //   return point;
  // }

  static fromPrivateKey(curve: ICurve, privateKey: PrivateKey) {
    return PointG2.BASE(curve).multiply(normalizePrivKey(curve, privateKey));
  }

  // toSignature() {
  //   if (this.equals(PointG2.ZERO(this.curve))) {
  //     const sum = POW_2_383 + POW_2_382;
  //     return concatBytes(toBytesBE(sum, PUBLIC_KEY_LENGTH), toBytesBE(0n, PUBLIC_KEY_LENGTH));
  //   }
  //   this.assertValidity();
  //   const [[x0, x1], [y0, y1]] = this.toAffine().map((a) => a.values);
  //   const tmp = y1 > 0n ? y1 * 2n : y0 * 2n;
  //   const aflag1 = tmp / CURVE.P;
  //   const z1 = x1 + aflag1 * POW_2_381 + POW_2_383;
  //   const z2 = x0;
  //   return concatBytes(toBytesBE(z1, PUBLIC_KEY_LENGTH), toBytesBE(z2, PUBLIC_KEY_LENGTH));
  // }

  frobenius(): this {
    let X = new Fq2(this.curve, [
      new Fq(this.curve, this.curve.Fra), new Fq(this.curve, this.curve.Frb)
    ]);
    if (this.curve.sexticTwist === SexticTwist.M_TYPE) {
      X = X.invert();
    }
    let X2 = X;
    X2 = X2.square();

    let x = this.x.conjugate();
    let y = this.y.conjugate();
    const z = this.z.conjugate();
    x = x.multiply(X2);
    y = y.multiply(X2);
    y = y.multiply(X);
    return this.getPoint(x, y, z);
  }

  protected _curveA(): Fq2 {
    return new Fq2(this.curve, [this.curve.A, 0n]);
  }

  protected _curveB(): Fq2 {
    return new Fq2(this.curve, this.curve.B2);
  }
}
