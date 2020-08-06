import {
  BigInteger, bigInt,
  SexticTwist, SignOfX
} from './types';
import Fq from './fq';
import Fq2 from './fq2';
import Fq12 from './fq12';
import PointG1 from './point-g1';
import PointG2 from './point-g2';
import Fq6 from './fq6';

// line function
function dblLineWithoutP(Q: PointG2): [Fq6, PointG2] {
  const curve = Q.curve;

  let [Qx, Qy, Qz] = [Q.x, Q.y, Q.z];
  let t0 = Qz.square();
  let t4 = Qx.multiply(Qy);
  const t1 = Q.y.square();
  let t3 = t0.add(t0);
  t4 = t4.div(bigInt['2']);
  const t5 = t0.add(t1);
  t0 = t0.add(t3);
  const t2 = t0.multiply(PointG2.CURVE_B(curve));
  t0 = Qx.square();
  t3 = t2.add(t2);
  t3 = t3.add(t2);
  Qx = t1.subtract(t3);
  t3 = t3.add(t1);
  Qx = Qx.multiply(t4);
  t3 = t3.div(bigInt['2']);
  let T0 = t3.square();
  let T1 = t2.square();
  T0 = T0.subtract(T1);
  T1 = T1.add(T1);
  T0 = T0.subtract(T1);
  t3 = Qy.add(Qz);
  Qy = T0;
  t3 = t3.square();
  t3 = t3.subtract(t5);
  Qz = t1.multiply(t3);
  const la = t2.subtract(t1);
  const lc = t0;
  const lb = t3;

  return [
    new Fq6(curve, [
      la, lb, lc
    ]),
    new PointG2(curve, Qx, Qy, Qz)
  ];
}

function addLineWithoutP(R: PointG2, Q: PointG2): [Fq6, PointG2] {
  const curve = R.curve;

  let [Rx, Ry, Rz] = [R.x, R.y, R.z];
  const [Qx, Qy] = [Q.x, Q.y];
  const t1 = (Rx.subtract(Rz.multiply(Qx)));
  const t2 = (Ry.subtract(Rz.multiply(Qy)));
  let t3 = t1.square();
  Rx = t3.multiply(R.x);
  let t4 = t2.square();
  t3 = t3.multiply(t1);
  t4 = t4.multiply(Rz);
  t4 = t4.add(t3);
  t4 = t4.subtract(Rx);
  t4 = t4.subtract(Rx);
  Rx = Rx.subtract(t4);

  let T1: Fq2, T2: Fq2;

  T1 = t2.multiply(Rx);
  T2 = t3.multiply(Ry);
  T2 = T1.subtract(T2);
  Ry = T2;
  Rx = t1.multiply(t4);
  Rz = t3.multiply(Rz);
  const lc = t2.negate();
  T1 = t2.multiply(Q.x);
  T2 = t1.multiply(Q.y);
  T1 = T1.subtract(T2);
  const lb = t1;
  const la = T1;

  const l = new Fq6(curve, [la, lb, lc]);
  return [
    l, new PointG2(curve, Rx, Ry, Rz)
  ];
}

/**
 * l = (a, b, c) => (a, b * P.y, c * P.x)
 *
 * @param l
 * @param P
 */
function updateLine(l: Fq6, P: PointG1): Fq6 {
  const curve = P.curve;
  let [c10, c11] = l.c[1].c;
  let [c20, c21] = l.c[2].c;
  c10 = c10.multiply(P.y);
  c11 = c11.multiply(P.y);
  c20 = c20.multiply(P.x);
  c21 = c21.multiply(P.x);
  return new Fq6(curve, [
    new Fq2(curve, l.c[0].c),
    new Fq2(curve, [c10, c11]),
    new Fq2(curve, [c20, c21])
  ]);
}

function dblLine(Q: PointG2, P: PointG1): [Fq6, PointG2] {
  let l: Fq6;
  let _Q: PointG2 = Q;
  [l, _Q] = dblLineWithoutP(_Q);
  l = updateLine(l, P);
  return [l, _Q];
}

/**
 *
 * @param R
 * @param Q
 * @param P
 * @return [l, R]
 */
function addLine(R: PointG2, Q: PointG2, P: PointG1): [Fq6, PointG2] {
  let l: Fq6;
  let _R: PointG2;
  // eslint-disable-next-line
  [l, _R] = addLineWithoutP(R, Q);
  l = updateLine(l, P);
  return [l, _R];
}

/**
 * adjP = (P.x * 3, -P.y)
 * remark : returned value is NOT on a curve
 * https://github.com/herumi/mcl/blob/49e6633eaa9bda8a9713fb9ad3a23c1fcf205329/include/mcl/bn.hpp#L1572
 * @param P
 */
function makeAdjP(P: PointG1): PointG1 {
  return new PointG1(
    P.curve,
    P.x.add(P.x).add(P.x),
    P.y.negate(),
    Fq.ZERO(P.curve)
  );
}

function convertFp6toFp12(x: Fq6): Fq12 {
  const curve = x.curve;
  const f2zero = Fq2.ZERO(curve);
  if (curve.sexticTwist === SexticTwist.M_TYPE) {
    // (a, b, c) -> (a, c, 0, 0, b, 0)
    const ya = new Fq6(curve, [x.c[0], x.c[2], f2zero]);
    const yb = new Fq6(curve, [f2zero, x.c[1], f2zero]);
    return new Fq12(curve, [ya, yb]);
  } else {
    // (a, b, c) -> (b, 0, 0, c, a, 0)
    const ya = new Fq6(curve, [x.c[1], f2zero, f2zero]);
    const yb = new Fq6(curve, [x.c[2], x.c[0], f2zero]);
    return new Fq12(curve, [ya, yb]);
  }
}

/* eslint-disable */
function Fp6mul_01(x: Fq6, d: Fq2, e: Fq2): Fq6 {
  const [a, b, c] = x.c;
  let t0: Fq2, t1: Fq2;
  let AD: Fq2, CE: Fq2, BE: Fq2, CD: Fq2, T: Fq2;
  AD = a.multiply(d);
  CE = c.multiply(e);
  BE = b.multiply(e);
  CD = c.multiply(d);
  t0 = a.add(b);
  t1 = d.add(e);
  T = t0.multiply(t1);
  T = T.subtract(AD);
  T = T.subtract(BE);
  const zb = T;
  CE = CE.mulByNonresidue();
  AD = AD.add(CE);
  const za = AD;
  BE = BE.add(CD);
  const zc = BE;
  return new Fq6(x.curve, [za, zb, zc]);
}

function mul_041(z: Fq12, x: Fq6): Fq12 {
  const curve = z.curve;

  const [a, b, c] = x.c;
  const [z0, z1] = z.c;
  let t0: Fq6;
  let t1: Fq2;
  let z0x0: Fq6;
  let z1x1a: Fq2, z1x1b: Fq2, z1x1c: Fq2;

  z1x1a = z1.c[2].multiply(b);
  z1x1a = z1x1a.mulByNonresidue();
  z1x1b = z1.c[0].multiply(b);
  z1x1c = z1.c[1].multiply(b);
  t1 = x.c[1].add(c);
  t0 = z0.add(z1);
  z0x0 = Fp6mul_01(z0, a, c);
  t0 = Fp6mul_01(t0, a, t1);
  let zb = t0.subtract(z0x0);
  zb = zb.subtract(new Fq6(curve, [z1x1a, z1x1b, z1x1c]));
  z1x1c = z1x1c.mulByNonresidue();
  const zaa = z0x0.c[0].add(z1x1c);
  const zab = z0x0.c[1].add(z1x1a);
  const zac = z0x0.c[2].add(z1x1b);

  const za = new Fq6(curve, [zaa, zab, zac]);

  return new Fq12(curve, [za, zb]);
}
/* eslint-enable */

function mul_403(z: Fq12, x: Fq6): Fq12 {
  const curve = z.curve;
  const [a, b, c] = x.c;
  let [z0, z1] = z.c;
  let t0: Fq6;
  let z1x1: Fq6;
  // Fp2::add(t1, x.b, c);
  const t1: Fq2 = x.c[1].add(c);
  t0 = z0.add(z1);
  const z0x0: Fq6 = z0.multiplyByFq2(b);
  z1x1 = Fp6mul_01(z1, c, a);
  t0 = Fp6mul_01(t0, t1, a);
  z1 = t0.subtract(z0x0);
  z1 = z1.subtract(z1x1);
  z1x1 = new Fq6(curve, [
    z1x1.c[0], z1x1.c[1], z1x1.c[2].mulByNonresidue()
  ]);
  z0 = new Fq6(curve, [
    z0x0.c[0].add(z1x1.c[2]),
    z0x0.c[1].add(z1x1.c[0]),
    z0x0.c[2].add(z1x1.c[1])
  ]);
  return new Fq12(curve, [z0, z1]);
}

function mulSparse(z: Fq12, x: Fq6): Fq12 {
  if (x.curve.sexticTwist === SexticTwist.M_TYPE) {
    return mul_041(z, x);
  } else {
    return mul_403(z, x);
  }
}

function mulSparse2(x: Fq6, y: Fq6): Fq12 {
  let z = convertFp6toFp12(x);
  z = mulSparse(z, y);
  return z;
}

function g2Frobenius(S: PointG2) {
  const curve = S.curve;
  const g2 = curve.gTbl[0];
  const g3 = curve.gTbl[3];
  return new PointG2(
    S.curve,
    S.x.frobenius().multiply(g2),
    S.y.frobenius().multiply(g3),
    S.z.frobenius()
  );
}

export function millerLoop(_P: PointG1, _Q: PointG2): Fq12 {
  const curve = _P.curve;

  let f: Fq12;

  const P = _P.affine(); // normalize
  let Q = _Q.affine(); // normalize

  if (Q.isZero()) {
    return Fq12.ONE(curve);
  }

  // assert(BN::param.siTbl[1] == 1);
  let T: PointG2 = Q;
  let negQ: PointG2;

  if (curve.useNAF) {
    negQ = Q.negate();
  } else {
    negQ = PointG2.ZERO(curve);
  }

  let d: Fq6, e: Fq6;
  const adjP: PointG1 = makeAdjP(P);
  [d, T] = dblLine(T, adjP);
  [e, T] = addLine(T, Q, P);
  f = mulSparse2(d, e);
  for (let i = 2; i < curve.siTbl.length; i++) {
    [e, T] = dblLine(T, adjP);
    // Fp12::sqr(f, f);
    f = f.square();
    f = mulSparse(f, e);
    if (curve.siTbl[i]) {
      if (curve.siTbl[i] > 0) {
        [e, T] = addLine(T, Q, P);
      } else {
        [e, T] = addLine(T, negQ, P);
      }
      f = mulSparse(f, e);
    }
  }
  if (curve.signOfX === SignOfX.NEGATIVEX) {
    f = new Fq12(curve, [
      f.c[0], f.c[1].negate()
    ]);
  }
  if (curve.isBLS12) return f;
  if (curve.signOfX === SignOfX.NEGATIVEX) {
    T = T.negate();
  }

  Q = g2Frobenius(Q);
  [d, T] = addLine(T, Q, P);
  Q = g2Frobenius(Q);
  Q = Q.negate();
  [e, T] = addLine(T, Q, P);
  const ft: Fq12 = mulSparse2(d, e);
  f = f.multiply(ft);
  return f;
}

export function pairing(P: PointG1, Q: PointG2, withFinalExponent: boolean = true): Fq12 {
  if (P.isZero() || Q.isZero()) throw new Error('No pairings at point of Infinity');
  P.assertValidity();
  Q.assertValidity();
  const res = millerLoop(P, Q);
  return withFinalExponent ? res.finalExponentiate() : res;
}


// export function pairing2(P: PointG1, Q: PointG2, withFinalExponent: boolean = true): Fq12 {
//   if (P.isZero() || Q.isZero()) throw new Error('No pairings at point of Infinity');
//   P.assertValidity();
//   Q.assertValidity();
//   const res = ate(Q, P);
//   return withFinalExponent ? res.finalExponentiate() : res;
// }
