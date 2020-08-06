import {
  BigInteger, bigInt,
  BigintSix, BigintTwelve, FieldStatic, PairingFriendly, SignOfX, NativeBigintTwelve
} from './types';
import {FQP} from './intl';
import Curve from './curve';
import Fq from './fq';
import Fq2 from './fq2';
import Fq6 from './fq6';
import {
  bitLen, bitGet
} from './utils';

function fq4Square(x0: Fq2, x1: Fq2): [Fq2, Fq2] {
  const a2 = x0.square(),
    b2 = x1.square();
  return [
    b2.mulByNonresidue().add(a2), // b^2 * Nonresidue + a^2
    x0.add(x1).square().subtract(a2).subtract(b2), // (a + b)^2 - a^2 - b^2
  ];
}

function mapToCyclotomic(x: Fq12): Fq12
{
  let z = x.frobenius2(); // z = x^(p^2)
  z = z.multiply(x); // x^(p^2 + 1)
  let y = z.invert();
  z = new Fq12(x.curve, [
    z.c[0], z.c[1].negate()
  ]); // z^(p^6) = conjugate of z
  y = y.multiply(z);
  return y;
}

/*
		Exponentiation over compression for:
		z = x^Param::z.abs()
	*/
function fixed_power(x: Fq12) {
  return x.pow(x.curve.x);
}

function pow_z(x: Fq12)
{
  const curve = x.curve;
  let y: Fq12;

  y = x.cyclotomicExp(curve.x);

  // if (curve.pairingFriendly === PairingFriendly.BN) {
  //   y = fixed_power(x);
  // } else {
  //   const orgX: Fq12 = x;
  //   y = x;
  //   const conj: Fq12 = new Fq12(curve, [x.c[0], x.c[1].negate()]);
  //   for (let i = 1; i < curve.zReplTbl.length; i++) {
  //     y = y.fasterSquare(); // fasterSqr(y);
  //     if (curve.zReplTbl[i] > 0) {
  //       y = y.multiply(orgX);
  //     } else if (curve.zReplTbl[i] < 0) {
  //       y = y.multiply(conj);
  //     }
  //   }
  // }
  if (curve.signOfX === SignOfX.NEGATIVEX) {
    y = y.unitaryInv();
  }
  return y;
}

/*
	Implementing Pairings at the 192-bit Security Level
	D.F.Aranha, L.F.Castaneda, E.Knapp, A.Menezes, F.R.Henriquez
	Section 4
*/
function expHardPartBLS12(x: Fq12)
{
  let a1: Fq12, a3: Fq12, a4: Fq12, a7: Fq12;
  let y: Fq12;
  const a0 = x.unitaryInv(); // a0 = x^-1
  a1 = a0.cyclotomicSquare(); // fasterSqr(a0); // x^-2
  const a2 = pow_z(x); // x^z
  a3 = a2.cyclotomicSquare(); // fasterSqr(a2); // x^2z
  a1 = a1.multiply(a2); // a1 = x^(z-2)
  a7 = pow_z(a1); // a7 = x^(z^2-2z)
  a4 = pow_z(a7); // a4 = x^(z^3-2z^2)
  const a5 = pow_z(a4); // a5 = x^(z^4-2z^3)
  a3 = a3.multiply(a5); // a3 = x^(z^4-2z^3+2z)
  const a6 = pow_z(a3); // a6 = x^(z^5-2z^4+2z^2)

  a1 = a1.unitaryInv(); // x^(2-z)
  a1 = a1.multiply(a6); // x^(z^5-2z^4+2z^2-z+2)
  a1 = a1.multiply(x); // x^(z^5-2z^4+2z^2-z+3) = x^c0
  a3 = a3.multiply(a0); // x^(z^4-2z^3-1) = x^c1
  a3 = a3.frobenius(); // x^(c1 p)
  a1 = a1.multiply(a3); // x^(c0 + c1 p)
  a4 = a4.multiply(a2); // x^(z^3-2z^2+z) = x^c2
  a4 = a4.frobenius2();  // x^(c2 p^2)
  a1 = a1.multiply(a4); // x^(c0 + c1 p + c2 p^2)
  a7 = a7.multiply(x); // x^(z^2-2z+1) = x^c3
  y = a7.frobenius3();
  y = y.multiply(a1);

  return y;
}
/*
	Faster Hashing to G2
	Laura Fuentes-Castaneda, Edward Knapp, Francisco Rodriguez-Henriquez
	section 4.1
	y = x^(d 2z(6z^2 + 3z + 1)) where
	p = p(z) = 36z^4 + 36z^3 + 24z^2 + 6z + 1
	r = r(z) = 36z^4 + 36z^3 + 18z^2 + 6z + 1
	d = (p^4 - p^2 + 1) / r
	d1 = d 2z(6z^2 + 3z + 1)
	= c0 + c1 p + c2 p^2 + c3 p^3
	c0 = 1 + 6z + 12z^2 + 12z^3
	c1 = 4z + 6z^2 + 12z^3
	c2 = 6z + 6z^2 + 12z^3
	c3 = -1 + 4z + 6z^2 + 12z^3
	x -> x^z -> x^2z -> x^4z -> x^6z -> x^(6z^2) -> x^(12z^2) -> x^(12z^3)
	a = x^(6z) x^(6z^2) x^(12z^3)
	b = a / (x^2z)
	x^d1 = (a x^(6z^2) x) b^p a^(p^2) (b / x)^(p^3)
*/
function expHardPartBN(x: Fq12)
{
  let a: Fq12, b: Fq12;
  let a2: Fq12, a3: Fq12;
  let y: Fq12;
  b = pow_z(x); // x^zf
  b = b.cyclotomicSquare(); // fasterSqr(b); // x^2z
  a = b.cyclotomicSquare(); // fasterSqr(b); // x^4z
  a = a.multiply(b); // x^6z
  a2 = pow_z(a); // x^(6z^2)
  a = a.multiply(a2);
  a3 = a2.cyclotomicSquare(); // fasterSqr(a2); // x^(12z^2)
  a3 = pow_z(a3); // x^(12z^3)
  a = a.multiply(a3);
  b = b.unitaryInv();
  b = b.multiply(a);
  a2 = a2.multiply(a);
  a = a.frobenius2();
  a = a.multiply(a2);
  a = a.multiply(x);
  y = x.unitaryInv();
  y = y.multiply(b);
  b = b.frobenius();
  a = a.multiply(b);
  y = y.frobenius3();
  y = y.multiply(a);
  return y;
}

const S_CURVE = Symbol('curve');
export default class Fq12 extends FQP<Fq12, Fq6, [Fq6, Fq6]> {
  private readonly [S_CURVE]: Curve;

  public static ZERO(curve: Curve) {
    return new Fq12(curve, [Fq6.ZERO(curve), Fq6.ZERO(curve)]);
  }

  public static ONE(curve: Curve) {
    return new Fq12(curve, [Fq6.ONE(curve), Fq6.ZERO(curve)]);
  }

  public static fromConstant(curve: Curve, c: BigInteger) {
    return Fq2.fromTuple(curve, [c, bigInt.zero]);
  }

  static fromTuple(curve: Curve, t: BigintTwelve | NativeBigintTwelve): Fq12 {
    const q = (t as any[]).map<Fq>(v => (typeof v === 'bigint' || bigInt.isInstance(v)) ? new Fq(curve, v) : v);
    return new Fq12(curve, [
      new Fq6(curve, [
        new Fq2(curve, [q[0], q[1]]),
        new Fq2(curve, [q[2], q[3]]),
        new Fq2(curve, [q[4], q[5]])
      ]),
      new Fq6(curve, [
        new Fq2(curve, [q[6], q[7]]),
        new Fq2(curve, [q[8], q[9]]),
        new Fq2(curve, [q[10], q[11]])
      ])
    ]);
  }

  public toTuple(): BigintSix {
    return this.c.reduce(
      (out, cur) => {
        out.push(...cur.toTuple());
        return out;
      },
      [] as BigInteger[]
    ) as BigintSix;
    // return [...this.c.map(v => v.toTuple())] as any;
  }

  constructor(curve: Curve, public readonly c: [Fq6, Fq6]) {
    super();
    if (c.length !== 2) throw new Error('Expected array with 2 elements');
    this[S_CURVE] = curve;
  }

  public get curve() {
    return this[S_CURVE];
  }

  init(c: [Fq6, Fq6]) {
    return new Fq12(this.curve, c);
  }

  toString() {
    return `Fq12(${this.c[0]} + ${this.c[1]} * w)`;
  }

  multiply(rhs: Fq12 | BigInteger) {
    if (bigInt.isInstance(rhs))
      return new Fq12(this.curve, [this.c[0].multiply(rhs), this.c[1].multiply(rhs)]);
    const [c0, c1] = this.c;
    const [r0, r1] = rhs.c;
    const t1 = c0.multiply(r0); // c0 * r0
    const t2 = c1.multiply(r1); // c1 * r1
    return new Fq12(this.curve, [
      t1.add(t2.mulByNonresidue()), // T1 + T2 * v
      // (c0 + c1) * (r0 + r1) - (T1 + T2)
      c0.add(c1).multiply(r0.add(r1)).subtract(t1.add(t2)),
    ]);
    //
    // const [a, b] = this.c;
    // const [c, d] = rhs.c;
    //
    // const t1 = a.add(b);
    // const t2 = c.add(d);
    // const AC = a.multiply(c);
    // const BD = b.multiply(d);
    // let T: Fq6 = (() => {
    //   const t = BD.c[2].mulByNonresidue();
    //   const zc = BD.c[1].add(AC.c[2]);
    //   const zb = BD.c[0].add(AC.c[1]);
    //   const za = t.add(AC.c[0]);
    //   return new Fq6(this.curve, [za, zb, zc]);
    // })();
    // const za = T;
    // T = t1.multiply(t2); // (a + b)(c + d)
    // T = T.subtract(AC);
    // T = T.subtract(BD);
    // const zb = T;
    // return new Fq12(this.curve, [za, zb]);
  }

  // multiply line functions
  // smul(other: Fq12) {
  //   const [c00, c01] = this.c[0].c;
  //   const [c10, c11] = this.c[1].c;
  //   const [c20, c21] = this.c[2].c;
  //   const [r00, r01] = other.c[0].c;
  //   const [r10, r11] = other.c[1].c;
  //   const [r20, r21] = other.c[2].c;
  //
  //   let ca: Fq4, cb: Fq4, cc: Fq4;
  //
  //   let w1: Fq2, w2: Fq2, w3: Fq2;
  //   let ta: Fq2, tb: Fq2, tc: Fq2, td: Fq2, te: Fq2;
  //
  //   if (this.curve.sexticTwist == SexticTwist.D_TYPE) {
  //     w1 = c00.multiply(r00);
  //     w2 = c01.multiply(r01);
  //     w3 = c10.multiply(r10);
  //
  //     ta = c00.add(c01);
  //     tb = r00.add(r01);
  //     tc = ta.multiply(tb);
  //     tc = tc.subtract(w1.add(w2));
  //
  //     ta = c00.add(c10);
  //     tb = r00.add(r10);
  //     td = ta.multiply(tb);
  //     td = td.subtract(w1.add(w3));
  //
  //     ta = c01.add(c10);
  //     tb = r01.add(r10);
  //     te = ta.multiply(tb);
  //     te = te.subtract(w2.add(w3));
  //
  //     w1 = w1.add(w2.mulQNR());
  //     ca = new Fq4(this.curve, [w1, tc]);
  //     cb = new Fq4(this.curve, [td, te]);
  //     cc = new Fq4(this.curve, [w3, Fq2.ZERO(this.curve)]);
  //   } else {
  //     w1 = c00.multiply(r00);
  //     w2 = c01.multiply(r01);
  //     w3 = c21.multiply(r21);
  //
  //     ta = c00.add(c01);
  //     tb = r00.add(r01);
  //     tc = ta.multiply(tb);
  //     tc = tc.subtract(w1.add(w2));
  //
  //     ta = c00.add(c21);
  //     tb = r00.add(r21);
  //     td = ta.multiply(tb);
  //     td = td.subtract(w1.add(w3));
  //
  //     ta = c01.add(c21);
  //     tb = r01.add(r21);
  //     te = ta.multiply(tb);
  //     te = te.subtract(w2.add(w3));
  //
  //     w1 = w1.add(w2.mulQNR());
  //     ca = new Fq4(this.curve, [w1, tc]);
  //     cb = new Fq4(this.curve, [w3.mulQNR(), Fq2.ZERO(this.curve)]);
  //     cb = cb.times_i();
  //     cc = new Fq4(this.curve, [te.mulQNR(), td]);
  //   }
  //   return new Fq12(this.curve, [ca, cb, cc]);
  // }

  smul(low: Fq2, mid: Fq2, high: Fq2) {
    const r = {
      low: this.c[0],
      high: this.c[1]
    };

    // See function Fq12e_mul_line in dclxvi

    let t1 = new Fq6(this.curve, [mid, high, Fq2.ZERO(this.curve)]);
    const t2 = new Fq6(this.curve, [mid.add(low), high, Fq2.ZERO(this.curve)]);

    t1 = t1.multiply(r.high);
    const t3 = r.low.multiplyByFq2(low);
    r.high = r.high.add(r.low);
    r.low = t3;
    r.high = r.low.multiply(t2);
    r.high = r.low.subtract(t1);
    r.high = r.low.subtract(r.low);
    r.low = r.low.add(t1.mul_tau());
    return new Fq12(this.curve, [r.low, r.high]);
  }

  // Sparse multiplication
  multiplyBy014(o0: Fq2, o1: Fq2, o4: Fq2) {
    const [c0, c1] = this.c;
    const [t0, t1] = [c0.multiplyBy01(o0, o1), c1.multiplyBy1(o4)];
    return new Fq12(this.curve, [
      t1.mulByNonresidue().add(t0), // T1 * v + T0
      // (c1 + c0) * [o0, o1+o4] - T0 - T1
      c1.add(c0).multiplyBy01(o0, o1.add(o4)).subtract(t0).subtract(t1),
    ]);
  }

  multiplyByFq2(rhs: Fq2): Fq12 {
    return this.init(this.map((c) => c.multiplyByFq2(rhs)));
  }

  square() {
    const [c0, c1] = this.c;
    const ab = c0.multiply(c1); // c0 * c1
    return new Fq12(this.curve, [
      // (c1 * v + c0) * (c0 + c1) - AB - AB * v
      c1.mulByNonresidue().add(c0).multiply(c0.add(c1)).subtract(ab).subtract(ab.mulByNonresidue()),
      ab.add(ab),
    ]); // AB + AB
  }

  invert() {
    const [c0, c1] = this.c;
    const t = c0.square().subtract(c1.square().mulByNonresidue()).invert(); // 1 / (c0^2 - c1^2 * v)
    return new Fq12(this.curve, [c0.multiply(t), c1.multiply(t).negate()]); // ((C0 * T) * T) + (-C1 * T) * w
  }

  unitaryInv() {
    return new Fq12(this.curve, [this.c[0], this.c[1].negate()]);
  }

  // Raises to q**i -th power
  // frobeniusMap(power: number) {
  //   const [c0, c1] = this.c;
  //   const r0 = c0.frobeniusMap(power);
  //   const [c1_0, c1_1, c1_2] = c1.frobeniusMap(power).c;
  //   return new Fq12(this.curve, [
  //     r0,
  //     new Fq6(this.curve, [
  //       c1_0.multiply(this.curve.frobeniusCoeffses.fq12[power % 12]),
  //       c1_1.multiply(this.curve.frobeniusCoeffses.fq12[power % 12]),
  //       c1_2.multiply(this.curve.frobeniusCoeffses.fq12[power % 12]),
  //     ]),
  //   ]);
  // }

  // https://eprint.iacr.org/2009/565.pdf
  public cyclotomicSquare(): Fq12 {
    const [c0, c1] = this.c;
    const [c0c0, c0c1, c0c2] = c0.c;
    const [c1c0, c1c1, c1c2] = c1.c;
    const [t3, t4] = fq4Square(c0c0, c1c1);
    const [t5, t6] = fq4Square(c1c0, c0c2);
    const [t7, t8] = fq4Square(c0c1, c1c2);
    const t9 = t8.mulByNonresidue(); // T8 * (u + 1)
    return new Fq12(this.curve, [
      new Fq6(this.curve, [
        t3.subtract(c0c0).multiply(bigInt['2']).add(t3), // 2 * (T3 - c0c0)  + T3
        t5.subtract(c0c1).multiply(bigInt['2']).add(t5), // 2 * (T5 - c0c1)  + T5
        t7.subtract(c0c2).multiply(bigInt['2']).add(t7),
      ]), // 2 * (T7 - c0c2)  + T7
      new Fq6(this.curve, [
        t9.add(c1c0).multiply(bigInt['2']).add(t9), // 2 * (T9 + c1c0) + T9
        t4.add(c1c1).multiply(bigInt['2']).add(t4), // 2 * (T4 + c1c1) + T4
        t6.add(c1c2).multiply(bigInt['2']).add(t6),
      ]),
    ]); // 2 * (T6 + c1c2) + T6
  }

  public cyclotomicExp(n: BigInteger) {
    // return this.pow(n);
    let z = Fq12.ONE(this.curve);
    const X_LEN = bitLen(this.curve.x);
    for (let i = X_LEN - 1; i >= 0; i--) {
      z = z.cyclotomicSquare();
      if (!bitGet(n, i).isZero()) z = z.multiply(this);
    }
    return z;
  }

  finalExponentiate(): Fq12 {
    const y = mapToCyclotomic(this);
    if (this.curve.pairingFriendly === PairingFriendly.BLS) {
      return expHardPartBLS12(y);
    } else {
      return expHardPartBN(y);
    }
  }

  frobenius() {
    const x: Fq2[] = [
      ...this.c[0].c,
      ...this.c[1].c
    ];
    const y: Fq2[] = x.map(t => t.frobenius());
    for (let i=1; i<6; i++) {
      y[i] = y[i].multiply(this.curve.gTbl[i - 1]);
    }
    return new Fq12(this.curve, [
      new Fq6(this.curve, y.slice(0, 3) as [Fq2, Fq2, Fq2]),
      new Fq6(this.curve, y.slice(3, 6) as [Fq2, Fq2, Fq2])
    ]);
  }

  frobenius2() {
    const pmod4 = Fq.Pmod4(this.curve);
    const x: Fq2[] = [
      ...this.c[0].c,
      ...this.c[1].c
    ];
    const y: Fq2[] = new Array<Fq2>();
    y[0] = x[0];
    if (pmod4.equals(bigInt.one)) {
      for (let i = 1; i < 6; i++) {
        y[i] = x[i].multiply(this.curve.g2Tbl[i]);
      }
    } else {
      for (let i = 1; i < 6; i++) {
        y[i] = x[i].multiply(this.curve.g2Tbl[i - 1].c[0].value);
      }
    }
    return new Fq12(this.curve, [
      new Fq6(this.curve, y.slice(0, 3) as [Fq2, Fq2, Fq2]),
      new Fq6(this.curve, y.slice(3, 6) as [Fq2, Fq2, Fq2])
    ]);
  }

  frobenius3() {
    const x: Fq2[] = [
      ...this.c[0].c,
      ...this.c[1].c
    ];
    const y: Fq2[] = new Array<Fq2>();
    y[0] = x[0].frobenius();
    for (let i=1; i<6; i++) {
      y[i] = x[i].frobenius();
      y[i] = y[i].multiply(this.curve.g3Tbl[i - 1]);
    }
    return new Fq12(this.curve, [
      new Fq6(this.curve, y.slice(0, 3) as [Fq2, Fq2, Fq2]),
      new Fq6(this.curve, y.slice(3, 6) as [Fq2, Fq2, Fq2])
    ]);
  }
}

// @ts-ignore
const typeTester: FieldStatic<Fq12> = Fq12;
typeTester;
