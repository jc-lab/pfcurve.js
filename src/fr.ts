import {
  Field, ICurve
} from './types';
import {
  mod, powMod, bitLen
} from './utils';

export default class Fr implements Field<Fr> {
  public readonly curve: ICurve;

  static isValid(curve: ICurve, b: bigint): boolean {
    return b <= curve.P;
  }

  isValid(): boolean {
    return this.value <= this.curve.P;
  }

  readonly value: bigint;
  constructor(curve: ICurve, value: bigint) {
    this.curve = curve;
    this.value = mod(value, this.order);
  }

  public get order(): bigint {
    return this.curve.P;
  }

  public get maxBits() {
    return bitLen(this.curve.P);
  }

  public static MAX_BITS(curve: ICurve) {
    return bitLen(curve.P);
  }

  public static ZERO(curve: ICurve) {
    return new Fr(curve, 0n);
  }

  public static ONE(curve: ICurve) {
    return new Fr(curve, 1n);
  }

  isZero(): boolean {
    return this.value === 0n;
  }

  equals(rhs: Fr): boolean {
    return this.value === rhs.value;
  }

  negate(): Fr {
    return new Fr(this.curve, -this.value);
  }

  invert(): Fr {
    let [x0, x1, y0, y1] = [1n, 0n, 0n, 1n];
    let a = this.order;
    let b = this.value;
    let q;
    while (a !== 0n) {
      [q, b, a] = [b / a, a, b % a];
      [x0, x1] = [x1, x0 - q * x1];
      [y0, y1] = [y1, y0 - q * y1];
    }
    return new Fr(this.curve, x0);
  }

  add(rhs: Fr): Fr {
    return new Fr(this.curve, this.value + rhs.value);
  }

  square(): Fr {
    return new Fr(this.curve, this.value * this.value);
  }

  pow(n: bigint): Fr {
    return new Fr(this.curve, powMod(this.value, n, this.order));
  }

  subtract(rhs: Fr): Fr {
    return new Fr(this.curve, this.value - rhs.value);
  }

  multiply(rhs: Fr | bigint): Fr {
    if (rhs instanceof Fr) rhs = rhs.value;
    return new Fr(this.curve, this.value * rhs);
  }

  div(rhs: Fr | bigint): Fr {
    const inv = typeof rhs === 'bigint' ? new Fr(this.curve, rhs).invert().value : rhs.invert();
    return this.multiply(inv);
  }
  legendre(): Fr {
    return this.pow((this.order - 1n) / 2n);
  }
  // Tonelli-Shanks algorithm
  sqrt(): Fr | undefined {
    if (!this.legendre().equals(new Fr(this.curve, 1n))) return;
    const P = this.order;
    let q, s, z;
    for (q = P - 1n, s = 0; q % 2n == 0n; q /= 2n, s++);
    if (s == 1) return this.pow((P + 1n) / 4n);
    for (z = 2n; z < P && new Fr(this.curve, z).legendre().value != P - 1n; z++);

    let c = powMod(z, q, P);
    let r = powMod(this.value, (q + 1n) / 2n, P);
    let t = powMod(this.value, q, P);

    let t2 = 0n;
    while (mod(t - 1n, P) != 0n) {
      t2 = mod(t * t, P);
      let i;
      for (i = 1; i < s; i++) {
        if (mod(t2 - 1n, P) == 0n) break;
        t2 = mod(t2 * t2, P);
      }
      const b = powMod(c, BigInt(1 << (s - i - 1)), P);
      r = mod(r * b, P);
      c = mod(b * b, P);
      t = mod(t * c, P);
      s = i;
    }
    return new Fr(this.curve, r);
  }

  toString() {
    return '0x' + this.value.toString(16).padStart(64, '0');
  }
}
