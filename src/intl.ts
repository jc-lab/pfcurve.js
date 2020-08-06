import {
  BigInteger, bigInt,
  Field, FieldStatic, PrivateKey
} from './types';
import {
  toBigInt
} from './utils';

// function xgcd(a: BigInteger, b: BigInteger): [BigInteger, BigInteger, BigInteger] {
//   // Computes XGCD(a, b).
//   // Returns (m, x, y) s.t. m = a*x + b*y
//   let prev_x: BigInteger = 1n;
//   let x: BigInteger = 0n;
//   let prev_y: BigInteger = 0n;
//   let y: BigInteger = 1n;
//   while (b) {
//     let q: BigInteger;
//     [q, a, b] = [a/b, b, a % b];
//     const [tx, ty] = [x, y];
//     [x, y] = [prev_x - q * x, prev_y - q * y];
//     [prev_x, prev_y] = [tx, ty];
//   }
//   return [a, prev_x, prev_y];
// }

// function frobeniusCoeffsPowers(modulus: BigInteger, degree: number, _num?: number | undefined, _divisor?: number | undefined): BigInteger[][] {
//   const divisor = _divisor || degree;
//   const num = _num || 1;
//   const tower_modulus = modulus ** bigInt(degree);
//   const out: BigInteger[][] = [];
//   for (let i=0; i<num; i++) {
//     const a = bigInt(i) + 1n;
//     let q_power = 1n;
//     const powers: BigInteger[] = [];
//     for (let j=0; j < degree; j++) {
//       powers.push(
//         ((((a*q_power)-a) / bigInt(divisor)) % tower_modulus)
//       );
//       q_power *= modulus;
//     }
//     out.push(powers);
//   }
//   return out;
// }

// export function frobeniusCoeffs<T>(nonResidue: Field<T>, args: BigInteger, kwa: number, num?: number, divisor?: number): T[][]
// {
//   const coeffs: T[][] = [];
//   frobeniusCoeffsPowers(args, kwa, num, divisor)
//     .forEach((powers, i) => {
//       coeffs.push(
//         powers.reduce((list, cur) => {
//           list.push(nonResidue.pow(cur));
//           return list;
//         }, [] as T[])
//       );
//     });
//   return coeffs;
// }

// Abstract class for a field over polynominal.
// TT - ThisType, CT - ChildType, TTT - Tuple Type
export abstract class FQP<TT extends { c: TTT } & Field<TT>, CT extends Field<CT>, TTT extends CT[]>
implements Field<TT> {
  public abstract readonly c: CT[];
  abstract get curve(): Curve;

  abstract init(c: TTT): TT;
  abstract multiply(rhs: TT | BigInteger): TT;
  abstract invert(): TT;
  abstract square(): TT;

  protected constructor() {
  }

  zip<T, RT extends T[]>(rhs: TT, mapper: (left: CT, right: CT) => T): RT {
    const c0 = this.c;
    const c1 = rhs.c;
    const res: T[] = [];
    for (let i = 0; i < c0.length; i++) {
      res.push(mapper(c0[i], c1[i]));
    }
    return res as RT;
  }
  map<T, RT extends T[]>(callbackfn: (value: CT) => T): RT {
    return this.c.map(callbackfn) as RT;
  }
  isZero(): boolean {
    return this.c.every((c) => c.isZero());
  }
  equals(rhs: TT): boolean {
    return this.zip(rhs, (left: CT, right: CT) => left.equals(right)).every((r: boolean) => r);
  }
  negate(): TT {
    return this.init(this.map((c) => c.negate()));
  }
  add(rhs: TT): TT {
    return this.init(this.zip(rhs, (left, right) => left.add(right)));
  }
  subtract(rhs: TT) {
    return this.init(this.zip(rhs, (left, right) => left.subtract(right)));
  }
  conjugate() {
    if (this.c.length === 2) {
      return this.init([this.c[0], this.c[1].negate()] as TTT);
    } else {
      return this.init([this.c[0], this.c[1].negate(), this.c[2]] as TTT);
    }
  }
  private one(): TT {
    const el = this;
    let one: unknown;
    if (el instanceof Fq2) one = Fq2.ONE(this.curve);
    if (el instanceof Fq4) one = Fq4.ONE(this.curve);
    if (el instanceof Fq6) one = Fq6.ONE(this.curve);
    if (el instanceof Fq12) one = Fq12.ONE(this.curve);
    return one as TT;
  }
  pow(n: BigInteger | number): TT {
    let _n = (typeof n === 'number') ? bigInt(n) : n;
    const elm = this as Field<TT>;
    const one = this.one();
    if (_n.equals(bigInt.zero)) return one;
    if (_n.equals(bigInt.one)) return elm as TT;
    let p = one;
    let d: TT = elm as TT;
    while (_n.greater(bigInt.zero)) {
      if (_n.isOdd()) p = p.multiply(d);
      _n = _n.shiftRight(bigInt.one);
      d = d.square();
    }
    return p;
  }
  div(rhs: TT | BigInteger): TT {
    const inv = (bigInt.isInstance(rhs)) ? new Fq(this.curve, rhs).invert().value : rhs.invert();
    return this.multiply(inv);
  }
}

export function genInvertBatch<T extends Field<T>>(curve: Curve, cls: FieldStatic<T>, nums: T[]): T[] {
  const len = nums.length;
  const scratch = new Array(len);
  let acc = cls.ONE(curve);
  for (let i = 0; i < len; i++) {
    if (nums[i].isZero()) continue;
    scratch[i] = acc;
    acc = acc.multiply(nums[i]);
  }
  acc = acc.invert();
  for (let i = len - 1; i >= 0; i--) {
    if (nums[i].isZero()) continue;
    const tmp = acc.multiply(nums[i]);
    nums[i] = acc.multiply(scratch[i]);
    acc = tmp;
  }
  return nums;
}

import Fq from './fq';
import Fq2 from './fq2';
import Fq4 from './fq4';
import Fq6 from './fq6';
import Fq12 from './fq12';
import Curve from './curve';

export function normalizePrivKey(curve: Curve, privateKey: PrivateKey): Fq {
  return new Fq(curve, toBigInt(privateKey));
}

