import {bufferAlloc, BufferConstructor, CurveType, Field, FieldStatic, ICurve, PrivateKey} from './types';
import {bitGet, toBigInt, toBytesBE} from './utils';
import {normalizePrivKey} from './intl';
import {ProjectivePoint} from './point-base';
import Fq from './fq';

export default class PointG1 extends ProjectivePoint<Fq, PointG1> {
  public static readonly Field: FieldStatic<Fq> = Fq;

  public static BASE(curve: ICurve) {
    return new PointG1(
      curve,
      new Fq(curve, curve.Gx),
      new Fq(curve, curve.Gy),
      Fq.ONE(curve)
    );
  }

  public static ZERO(curve: ICurve) {
    return new PointG1(
      curve,
      Fq.ONE(curve),
      Fq.ONE(curve),
      Fq.ZERO(curve)
    );
  }

  public static INF(curve: ICurve) {
    return new PointG1(
      curve,
      Fq.ZERO(curve),
      Fq.ONE(curve),
      curve.curveType === CurveType.EDWARDS ? Fq.ONE(curve) : Fq.ZERO(curve)
    );
  }

  constructor(curve: ICurve, x: Fq, y: Fq, z: Fq) {
    super(curve, x, y, z, Fq, PointG1);
  }

  public static RHS(curve: ICurve, x: bigint): Fq {
    const fx = Fq.fromConstant(curve, x);
    const fa = PointG1.CURVE_A(curve);
    const fb = PointG1.CURVE_B(curve);

    /*
    *
    *
    if curve.CurveType == WEIERSTRASS:
        return x * x * x + ECp.A * x + ECp.B
    if curve.CurveType == EDWARDS:
        return (ECp.A * x * x - Fp(1)) * ((ECp.B * x * x - Fp(1)).inverse())
    if curve.CurveType == MONTGOMERY:
        return x * x * x + ECp.A * x * x + x
    * */

    switch (curve.curveType) {
    case CurveType.WEIERSTRASS:
      return fx.multiply(fx.multiply(x).add(fa)).add(fb);
    case CurveType.EDWARDS:
      return fa.multiply(fx.square()).subtract(Fq.ONE(curve))
        .multiply(
          fb.multiply(fx.square()).subtract(Fq.ONE(curve)).invert()
        );
    case CurveType.MONTGOMERY:
      return fx.pow(3n).add(fa.multiply(fx.pow(3n)));
    }
    throw new Error('Unknown curve type');
  }

  public isInf() {
    if ((this.curve.curveType === CurveType.WEIERSTRASS)) {
      if ((this.x.isZero() && this.z.isZero())) {
        return true;
      }
    }
    if ((this.curve.curveType === CurveType.EDWARDS)) {
      if ((this.x.isZero() && (this.y === this.z))) {
        return true;
      }
    }
    if ((this.curve.curveType === CurveType.MONTGOMERY)) {
      if (this.z.isZero()) {
        return true;
      }
    }
    return false;
  }

  public equals(rhs: ProjectivePoint<Fq, PointG1>) {
    const a1 = this.x.multiply(rhs.z);
    const a2 = rhs.x.multiply(this.z);
    const b1 = this.y.multiply(rhs.z);
    const b2 = rhs.y.multiply(this.z);
    if (!a1.equals(a2)) {
      return false;
    }
    if (this.curve.curveType !== CurveType.MONTGOMERY) {
      if (!b1.equals(b2)) {
        return false;
      }
    }
    return true;
  }

  public negate(): this {
    if (this.isInf()) {
      return PointG1.INF(this.curve) as any;
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
    let A: Fq, AA: Fq, B: Fq, BB: Fq, C: Fq, D: Fq, H: Fq, J: Fq, b: bigint, t0: Fq, t1: Fq, t2: Fq, t3: Fq, x3: Fq, y3: Fq, z3: Fq;
    if (this.curve.curveType === CurveType.WEIERSTRASS) {
      if (this.curve.A === 0n) {
        t0 = y;
        t0 = (t0.multiply(t0));
        t1 = y;
        t1 = (t1.multiply(z));
        t2 = z;
        t2 = (t2.multiply(t2));
        z = (t0.add(t0));
        z = z.add(z);
        z = z.add(z);
        t2 = t2.multiply(this.curve.B + this.curve.B + this.curve.B);
        x3 = (t2.multiply(z));
        y3 = (t0.add(t2));
        z = z.multiply(t1);
        t1 = (t2.add(t2));
        t2 = t2.add(t1);
        t0 = t0.subtract(t2);
        y3 = y3.multiply(t0);
        y3 = y3.add(x3);
        t1 = x.multiply(y);
        x = t0;
        x = x.multiply(t1);
        x = x.add(x);
        y = y3;
      } else {
        t0 = x;
        t1 = y;
        t2 = z;
        t3 = x;
        z3 = z;
        y3 = Fq.ZERO(this.curve);
        x3 = Fq.ZERO(this.curve);
        b = this.curve.B;
        t0 = t0.multiply(t0);
        t1 = t1.multiply(t1);
        t2 = t2.multiply(t2);
        t3 = t3.multiply(y);
        t3 = t3.add(t3);
        z3 = z3.multiply(x);
        z3 = z3.add(z3);
        y3 = (t2.multiply(b));
        y3 = y3.subtract(z3);
        x3 = (y3.add(y3));
        y3 = y3.add(x3);
        x3 = (t1.subtract(y3));
        y3 = y3.add(t1);
        y3 = y3.multiply(x3);
        x3 = x3.multiply(t3);
        t3 = (t2.add(t2));
        t2 = t2.add(t3);
        z3 = z3.multiply(b);
        z3 = z3.subtract(t2);
        z3 = z3.subtract(t0);
        t3 = (z3.add(z3));
        z3 = z3.add(t3);
        t3 = (t0.add(t0));
        t0 = t0.add(t3);
        t0 = t0.subtract(t2);
        t0 = t0.multiply(z3);
        y3 = y3.add(t0);
        t0 = (y.multiply(z));
        t0 = t0.add(t0);
        z3 = z3.multiply(t0);
        x3 = x3.subtract(z3);
        t0 = t0.add(t0);
        t1 = t1.add(t1);
        z3 = (t0.multiply(t1));
        x = x3;
        y = y3;
        z = z3;
      }
    }
    if (this.curve.curveType === CurveType.EDWARDS) {
      C = x;
      D = y;
      H = z;
      J = Fq.ZERO(this.curve);
      x = x.multiply(y);
      x = x.add(x);
      C = C.multiply(C);
      D = D.multiply(D);
      if (new Fq(this.curve, this.curve.A).equals(new Fq(this.curve, (-1n)))) {
        C = C.negate();
      }
      y = (C.add(D));
      H = H.multiply(H);
      H = H.add(H);
      z = y;
      J = y;
      J = J.subtract(H);
      x = x.multiply(J);
      C = C.subtract(D);
      y = y.multiply(C);
      z = z.multiply(J);
    }
    if (this.curve.curveType === CurveType.MONTGOMERY) {
      A = x;
      B = x;
      AA = Fq.ZERO(this.curve);
      BB = Fq.ZERO(this.curve);
      C = Fq.ZERO(this.curve);
      A = A.add(z);
      AA = (A.multiply(A));
      B = B.subtract(z);
      BB = (B.multiply(B));
      C = AA;
      C = (AA.subtract(BB));
      x = (AA.multiply(BB));

      A = C.multiply((this.curve.A + 2n) / 2n / 2n);
      BB = BB.add(A);
      z = BB.multiply(C);
    }
    return this.getPoint(x, y, z);
  }

  public add(rhs: ProjectivePoint<Fq, PointG1>): this {
    let {x, y, z} = this;
    let A: Fq, B: Fq, C: Fq, D: Fq, E: Fq, F: Fq, G: Fq, b: bigint, t0: Fq, t1: Fq, t2: Fq, t3: Fq, t4: Fq, x3: Fq, y3: Fq, z3: Fq;

    if (this.isZero()) return rhs as this;
    if (rhs.isZero()) return this;

    if (this.curve.curveType === CurveType.WEIERSTRASS) {
      if (this.curve.A === 0n) {
        b = (this.curve.B + this.curve.B + this.curve.B);
        t0 = x;
        t0 = t0.multiply(rhs.x);
        t1 = y;
        t1 = t1.multiply(rhs.y);
        t2 = z;
        t2 = (t2.multiply(rhs.z));
        t3 = x;
        t3 = t3.add(y);
        t4 = (rhs.x.add(rhs.y));
        t3 = t3.multiply(t4);
        t4 = (t0.add(t1));

        t3 = t3.subtract(t4);
        t4 = (y.add(z));
        x3 = (rhs.y.add(rhs.z));

        t4 = t4.multiply(x3);
        x3 = (t1.add(t2));

        t4 = t4.subtract(x3);
        x3 = (x.add(z));
        y3 = (rhs.x.add(rhs.z));
        x3 = x3.multiply(y3);
        y3 = (t0.add(t2));
        y3 = (x3.subtract(y3));
        x3 = (t0.add(t0));
        t0 = t0.add(x3);
        t2 = t2.multiply(b);

        z3 = (t1.add(t2));
        t1 = t1.subtract(t2);
        y3 = y3.multiply(b);

        x3 = (y3.multiply(t4));
        t2 = (t3.multiply(t1));
        x3 = (t2.subtract(x3));
        y3 = y3.multiply(t0);
        t1 = t1.multiply(z3);
        y3 = y3.add(t1);
        t0 = t0.multiply(t3);
        z3 = z3.multiply(t4);
        z3 = z3.add(t0);

        x = x3;
        y = y3;
        z = z3;
      } else {
        t0 = x;
        t1 = y;
        t2 = z;
        t3 = x;
        t4 = rhs.x;
        z3 = Fq.ZERO(this.curve);
        y3 = rhs.x;
        x3 = rhs.y;
        b = this.curve.B;
        t0 = t0.multiply(rhs.x);
        t1 = t1.multiply(rhs.y);
        t2 = t2.multiply(rhs.z);
        t3 = t3.add(y);
        t4 = t4.add(rhs.y);
        t3 = t3.multiply(t4);
        t4 = (t0.add(t1));
        t3 = t3.subtract(t4);
        t4 = (y.add(z));
        x3 = x3.add(rhs.z);
        t4 = t4.multiply(x3);
        x3 = (t1.add(t2));
        t4 = t4.subtract(x3);
        x3 = (x.add(z));
        y3 = y3.add(rhs.z);
        x3 = x3.multiply(y3);
        y3 = (t0.add(t2));
        y3 = (x3.subtract(y3));
        z3 = (t2.multiply(b));
        x3 = (y3.subtract(z3));
        z3 = (x3.add(x3));
        x3 = x3.add(z3);
        z3 = (t1.subtract(x3));
        x3 = x3.add(t1);
        y3 = y3.multiply(b);
        t1 = (t2.add(t2));
        t2 = t2.add(t1);
        y3 = y3.subtract(t2);
        y3 = y3.subtract(t0);
        t1 = (y3.add(y3));
        y3 = y3.add(t1);
        t1 = (t0.add(t0));
        t0 = t0.add(t1);
        t0 = t0.subtract(t2);
        t1 = (t4.multiply(y3));
        t2 = (t0.multiply(y3));
        y3 = (x3.multiply(z3));
        y3 = y3.add(t2);
        x3 = x3.multiply(t3);
        x3 = x3.subtract(t1);
        z3 = z3.multiply(t4);
        t1 = (t3.multiply(t0));
        z3 = z3.add(t1);
        x = x3;
        y = y3;
        z = z3;
      }
    }
    if (this.curve.curveType === CurveType.EDWARDS) {
      A = z;
      B = Fq.ZERO(this.curve);
      C = x;
      D = y;
      E = Fq.ZERO(this.curve);
      F = Fq.ZERO(this.curve);
      G = Fq.ZERO(this.curve);
      b = this.curve.B;
      A = A.multiply(rhs.z);
      B = (A.multiply(A));
      C = C.multiply(rhs.x);
      D = D.multiply(rhs.y);
      E = (C.multiply(D));
      E = E.multiply(b);
      F = (B.subtract(E));
      G = (B.add(E));
      if ((this.curve.A === 1n)) {
        E = (D.subtract(C));
      }
      C = C.add(D);
      B = (x.add(y));
      D = rhs.x.add(rhs.y);
      B = B.multiply(D);
      B = B.subtract(C);
      B = B.multiply(F);
      x = (A.multiply(B));
      if ((this.curve.A === 1n)) {
        C = (E.multiply(G));
      }
      if (new Fq(this.curve, this.curve.A).equals(new Fq(this.curve, (-1n)))) {
        C = C.multiply(G);
      }
      y = (A.multiply(C));
      z = F;
      z = z.multiply(G);
    }
    return this.getPoint(x, y, z);
  }

  // For Montgomery use only
  // public dadd(Q: ProjectivePoint<Fq>, W: ProjectivePoint<Fq>) {
  //   let {x, y, z} = this;
  //   let A: Fq, B: Fq, C: Fq, CB: Fq, D: Fq, DA: Fq;
  //   A = x;
  //   B = x;
  //   C = Q.x;
  //   D = Q.x;
  //   A = A.add(z);
  //   B = B.subtract(z);
  //   C = C.add(Q.z);
  //   D = D.subtract(Q.z);
  //   DA = (D.multiply(A));
  //   CB = (C.multiply(B));
  //   A = (DA.add(CB));
  //   A = A.multiply(A);
  //   B = (DA.subtract(CB));
  //   B = B.multiply(B);
  //   x = A;
  //   z = (W.x.multiply(B));
  //   return this.getPoint(x, y, z);
  // }

  // static fromCompressedHex(curve: ICurve, hex: Bytes) {
  //   const compressedValue = bytesToNumberBE(hex);
  //   const bflag = mod(compressedValue, POW_2_383) / POW_2_382;
  //   if (bflag === 1n) {
  //     return this.ZERO;
  //   }
  //   const x = mod(compressedValue, POW_2_381);
  //   const fullY = mod(x ** 3n + new Fq(curve, curve.b).value, curve.P);
  //   let y = powMod(fullY, (curve.P + 1n) / 4n, curve.P);
  //   if (powMod(y, 2n, curve.P) - fullY !== 0n) {
  //     throw new Error('The given point is not on G1: y**2 = x**3 + b');
  //   }
  //   const aflag = mod(compressedValue, POW_2_382) / POW_2_381;
  //   if ((y * 2n) / curve.P !== aflag) {
  //     y = curve.P - y;
  //   }
  //   const p = new PointG1(curve, new Fq(curve, x), new Fq(curve, y), new Fq(curve, 1n));
  //   return p;
  // }

  public static fromX(curve: ICurve, x: bigint, s: bigint = 0n) {
    const fx = new Fq(curve, x);
    const rhs = PointG1.RHS(curve, x);
    if (rhs.qr() !== 1n) {
      throw new Error('qr != 1');
    }
    const fz = Fq.ONE(curve);
    let fy: Fq | undefined = undefined;
    if (curve.curveType != CurveType.MONTGOMERY) {
      fy = rhs.sqrt();
      if (bitGet(fy.value, 0) != s) {
        fy = fy.negate();
      }
    }
    if (!fy) {
      fy = Fq.ZERO(curve);
    }
    return new PointG1(curve, fx, fy, fz);
  }

  public static fromXY(curve: ICurve, x: bigint, y: bigint, s: bigint = 0n) {
    const fx = new Fq(curve, x);
    const fy = new Fq(curve, y);
    const rhs = PointG1.RHS(curve, x);

    if (!fy.square().equals(rhs)) {
      throw new Error('y*y != rhs');
    }
    const fz = Fq.ONE(curve);

    return new PointG1(curve, fx, fy, fz);
  }

  public static fromPrivateKey(curve: ICurve, privateKey: PrivateKey): PointG1 {
    return PointG1.BASE(curve).multiply(normalizePrivKey(curve, privateKey));
  }

  getXS(): [bigint, bigint] {
    if (this.isInf()) {
      return [0n, 0n];
    }
    const [x, y] = this.toAffine();
    if (this.curve.curveType === CurveType.MONTGOMERY) {
      return [x.value, 0n];
    }
    return [x.value, bitGet(y.value, 0)];
  }

  // Can be compressed to just x
  public toBytes(): Buffer;
  public toBytes(compress: boolean): Buffer;
  public toBytes<TBUF extends Uint8Array>(compress: boolean, bufferConstructor: BufferConstructor<TBUF>): TBUF;
  public toBytes<TBUF extends Uint8Array>(_compress?: boolean, bufferConstructor?: BufferConstructor<TBUF>): TBUF {
    const compress = (typeof _compress === 'undefined') ? true : _compress;
    const _bufferConstructor: BufferConstructor<TBUF> = bufferConstructor ? bufferConstructor : Buffer as any;

    const FS = this.curve.EFS;
    let PK: TBUF;
    let W = toBytesBE(_bufferConstructor, this.x.value);
    if (this.curve.curveType === CurveType.MONTGOMERY) {
      return W;
    }
    if (compress) {
      const [x, b] = this.getXS();
      PK = bufferAlloc(_bufferConstructor, FS + 1);
      if (b === 0n) {
        PK[0] = 2;
      } else {
        PK[0] = 3;
      }
      for (let i = 0; i < W.length; i++) {
        PK[1 + i] = W[i];
      }
    } else {
      PK = bufferAlloc(_bufferConstructor, 2 * FS + 1);
      PK[0] = 4;
      for (let i = 0; i < W.length; i++) {
        PK[1 + i] = W[i];
      }
      W = toBytesBE(_bufferConstructor, this.y.value.toString(16));
      for (let i = 0; i < W.length; i++) {
        PK[1 + FS + i] = W[i];
      }
    }
    return PK;
  }

  public static fromBytes(curve: ICurve, w: Uint8Array): PointG1 {
    const FS = curve.EFS;
    if (curve.curveType === CurveType.MONTGOMERY) {
      const x = toBigInt(w.subarray(0, FS));
      return PointG1.fromX(curve, x);
    }
    const t = w[0];
    const sp1 = FS + 1;
    const sp2 = sp1 + FS;
    const x = toBigInt(w.subarray(1, sp1));
    if (t === 4) {
      const y = toBigInt(w.subarray(sp1, sp2));
      return PointG1.fromXY(curve, x, y);
    } else {
      if (t === 2) {
        return PointG1.fromX(curve, x, 0n);
      } else if (t === 3) {
        return PointG1.fromX(curve, x, 1n);
      }
      throw new Error('Wrong value');
    }
  }

  // Sparse multiplication against precomputed coefficients
  // millerLoop(P: PointG2): Fq12 {
  //   return millerLoop(this.curve, P.pairingPrecomputes(), this.toAffine());
  // }

  protected _curveA(): Fq {
    return new Fq(this.curve, this.curve.A);
  }

  protected _curveB(): Fq {
    return new Fq(this.curve, this.curve.B);
  }

  public static CURVE_A(curve: ICurve): Fq {
    return new Fq(curve, curve.A);
  }

  public static CURVE_B(curve: ICurve): Fq {
    return new Fq(curve, curve.B);
  }
}
