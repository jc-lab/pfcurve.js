import {
  ICurve, PairingFriendly, SexticTwist, SignOfX
} from './types';
import {
  bitGet, bitLen
} from './utils';
import Fq from './fq';
import Fq2 from './fq2';
import Fq4 from './fq4';
import Fq12 from './fq12';
import PointG1 from './point-g1';
import PointG2 from './point-g2';

// line function
function dbl(A: PointG2): [Fq2, Fq2, Fq2] {
  const curve = A.curve;

  let [CC, YY, BB] = [A.x, A.y, A.z];
  let AA = YY.multiply(BB);
  CC = CC.square();
  YY = YY.square();
  BB = BB.square();

  AA = AA.add(AA);
  AA = AA.negate();
  AA = AA.mulQNR();
  BB = BB.muli(3n * curve.B);
  CC = CC.muli(3n);
  if (curve.sexticTwist == SexticTwist.D_TYPE) {
    YY = YY.mulQNR();
    CC = CC.mulQNR();
  }
  if (curve.sexticTwist == SexticTwist.M_TYPE) {
    BB = BB.mulQNR();
  }
  BB=BB.subtract(YY);
  A = A.double();
  return [AA,BB,CC];
}

function add(A: PointG2 , B: PointG2): [Fq2, Fq2, Fq2] {
  const curve = A.curve;

  const [X1, Y1, Z1] = [A.x, A.y, A.z];
  const [X2, Y2] = [B.x, B.y];
  const T1 = (X1.subtract(Z1.multiply(X2)));
  const T2 = (Y1.subtract(Z1.multiply(Y2)));

  let AA = T1;
  const BB = T2.multiply(X2).subtract(T1.multiply(Y2));
  const CC = T2.negate();

  if (curve.sexticTwist == SexticTwist.M_TYPE) {
    AA = AA.mulQNR();
  }

  return [AA,BB,CC];
}

function g(curve: ICurve, A: PointG2, B: PointG2, Qx: Fq, Qy: Fq): [PointG2, Fq12] {
  let AA: Fq2, BB: Fq2, CC: Fq2;
  let r: PointG2 = A;

  if (A.equals(B)) {
    [AA, BB, CC] = dbl(A);
    r = r.double();
  } else {
    [AA, BB, CC] = add(A, B);
    r = r.add(B);
  }
  CC=CC.muls(Qx);
  AA=AA.muls(Qy);

  const a = new Fq4(curve, [AA,BB]);
  let b: Fq4;
  let c: Fq4;

  if (curve.sexticTwist === SexticTwist.D_TYPE) {
    b = new Fq4(curve, [CC, Fq2.ZERO(curve)]);
    c = Fq4.ZERO(curve);
  } else {
    b = Fq4.ZERO(curve);
    c = new Fq4(curve, [CC, Fq2.ZERO(curve)]).times_i();
  }
  return [r, new Fq12(curve, [a, b, c])];
}

function lbits(curve: ICurve): [number, bigint, bigint] {
  const x = curve.x;
  let n: bigint;
  if (curve.pairingFriendly === PairingFriendly.BN) {
    n = 6n * x;
    if (curve.signOfX === SignOfX.POSITIVEX) {
      n += 2n;
    } else {
      n -= 2n;
    }
  } else {
    n = x;
  }
  const n3 = 3n * n;
  return [bitLen(n3),n3,n];
}

export function ate(_P: PointG2, _Q: PointG1) {
  const curve = _P.curve;
  if (_Q.isInf()) {
    return Fq12.ONE(curve);
  }

  const [nb, n3, n] = lbits(curve);
  const P = _P.affine();
  const [Qx, Qy] = _Q.toAffine();
  let A = P;
  let r = Fq12.ONE(curve);

  let lv: Fq12;
  let lv2: Fq12;

  // miller loop
  for (let i = nb - 2; i > 0; i--) {
    r = r.square();
    [A, lv] = g(curve, A, A, Qx, Qy);

    if ((bitGet(n3, i) == 1n) && (bitGet(n, i) == 0n)) {
      [A, lv2] = g(curve, A, P, Qx, Qy);
      lv = lv.smul(lv2);
    }
    if ((bitGet(n3, i) == 0n) && (bitGet(n, i) == 1n)) {
      [A, lv2] = g(curve, A, P.negate(), Qx, Qy);
      lv = lv.smul(lv2);
    }
    r = r.multiply(lv);
  }

  // adjustment
  if (curve.signOfX === SignOfX.NEGATIVEX) {
    r = r.conjugate();
  }

  if (curve.pairingFriendly === PairingFriendly.BN) {
    let KA = P;
    KA = KA.frobenius();
    if (curve.signOfX === SignOfX.NEGATIVEX) {
      A = A.negate();
    }
    [A, lv] = g(curve, A, KA, Qx, Qy);
    KA = KA.frobenius();
    KA = KA.negate();
    [A, lv2] = g(curve, A, KA, Qx, Qy);
    lv = lv.smul(lv2);
    r = r.multiply(lv);
  }

  return r;
}

export function pairing(P: PointG1, Q: PointG2, withFinalExponent: boolean = true): Fq12 {
  if (P.isZero() || Q.isZero()) throw new Error('No pairings at point of Infinity');
  P.assertValidity();
  Q.assertValidity();
  const res = ate(Q, P);
  return withFinalExponent ? res.finalExponentiate() : res;
}

