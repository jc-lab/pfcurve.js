import {
  BigInteger, bigInt,
  CurveType, Field, ICurve, IECPoint, PairingFriendly, FieldStatic
} from './types';
import {
  bitLen
} from './utils';
import {
  genInvertBatch
} from './intl';
import Curve from './curve';
import Fq from './fq';

type Constructor<T extends Field<T>> = { new (curve: Curve, ...args: any[]): T } & FieldStatic<T> & {
  MAX_BITS(curve: Curve): number;
};

export type PointConstructor<TF extends Field<TF>, TP extends ProjectivePoint<TF, TP>> = {
  readonly Field: FieldStatic<TF>;
  BASE(curve: Curve): TP;
  CURVE_A(curve: Curve): TF;
  CURVE_B(curve: Curve): TF;
};

// x=X/Z, y=Y/Z
export abstract class ProjectivePoint<T extends Field<T>, TP extends ProjectivePoint<T, TP>> implements IECPoint<T> {
  private _MPRECOMPUTES: undefined | [number, this[]];

  constructor(
    public readonly curve: Curve,
    public readonly x: T,
    public readonly y: T,
    public readonly z: T,
    private readonly C: Constructor<T>,
    private readonly PC: PointConstructor<T, TP>
  ) {}

  isZero() {
    return this.z.isZero();
  }

  getPoint<TT extends this>(x: T, y: T, z: T): TT {
    return new (<any> this.constructor)(this.curve, x, y, z);
  }

  getZero(): this {
    return this.getPoint(
      this.C.ONE(this.curve),
      this.C.ONE(this.curve),
      this.C.ZERO(this.curve)
    );
  }

  getInf(): this {
    return this.getPoint(
      this.C.ZERO(this.curve),
      this.C.ONE(this.curve),
      this.curve.curveType === CurveType.EDWARDS ? this.C.ONE(this.curve) : this.C.ZERO(this.curve)
    );
  }

  clone(): this {
    return this.getPoint(this.x, this.y, this.z);
  }

  toString(isAffine = true) {
    if (!isAffine) {
      return `Point<x=${this.x}, y=${this.y}, z=${this.z}>`;
    }
    const [x, y] = this.toAffine();
    return `Point<x=${x}, y=${y}>`;
  }

  fromAffineTuple(xy: [T, T]): this {
    return this.getPoint(xy[0], xy[1], this.C.ONE(this.curve));
  }

  // Converts Projective point to default (x, y) coordinates.
  // Can accept precomputed Z^-1 - for example, from invertBatch.
  toAffine(invZ: T = this.z.invert()): [T, T] {
    return [this.x.multiply(invZ), this.y.multiply(invZ)];
  }

  affine(): this {
    const invZ = this.z.invert();
    return this.getPoint(
      this.x.multiply(invZ),
      this.y.multiply(invZ),
      this.C.ONE(this.curve)
    );
  }

  toAffineBatch(points: ProjectivePoint<T, TP>[]): [T, T][] {
    const toInv = genInvertBatch(
      this.curve,
      this.C,
      points.map((p) => p.z)
    );
    return points.map((p, i) => p.toAffine(toInv[i]));
  }

  normalizeZ(points: this[]): this[] {
    return this.toAffineBatch(points).map((t) => this.fromAffineTuple(t));
  }

  public subtract(rhs: ProjectivePoint<T, TP>): this {
    if (this.constructor != rhs.constructor)
      throw new Error(
        `ProjectivePoint#subtract: this is ${this.constructor}, but rhs is ${rhs.constructor}`
      );
    return this.add(rhs.negate());
  }

  // Should be not more than curve order, but I cannot find it.
  // Curve order cannot be more than Group/Field order, so let's use it.
  private maxBits() {
    return this.C.MAX_BITS(this.curve);
  }

  private precomputeWindow(W: number): this[] {
    // Split scalar by W bits, last window can be smaller
    const windows = Math.ceil(this.maxBits() / W);
    // 2^(W-1), since we use wNAF, we only need W-1 bits
    const windowSize = 2 ** (W - 1);

    const points: this[] = [];
    let p: this = this;
    let base = p;
    for (let window = 0; window < windows; window++) {
      base = p;
      points.push(base);
      for (let i = 1; i < windowSize; i++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }

  calcMultiplyPrecomputes(W: number) {
    if (this._MPRECOMPUTES) throw new Error('This point already has precomputes');
    this._MPRECOMPUTES = [W, this.normalizeZ(this.precomputeWindow(W))];
  }

  clearMultiplyPrecomputes() {
    this._MPRECOMPUTES = undefined;
  }

  // MONTGOMERY curve maybe some different
  private wNAF(n: BigInteger): [this, this] {
    let W: number, precomputes: this[];
    if (this._MPRECOMPUTES) {
      [W, precomputes] = this._MPRECOMPUTES;
    } else {
      W = 1;
      precomputes = this.precomputeWindow(W);
    }

    let [p, f] = [this.getZero(), this.getZero()];
    // Split scalar by W bits, last window can be smaller
    const windows = Math.ceil(this.maxBits() / W);
    // 2^(W-1), since we use wNAF, we only need W-1 bits
    const windowSize = 2 ** (W - 1);
    const mask = bigInt(2 ** W - 1); // Create mask with W ones: 0b1111 for W=4 etc.
    const maxNumber = 2 ** W;
    const shiftBy = bigInt(W);

    for (let window = 0; window < windows; window++) {
      const offset = window * windowSize;
      // Extract W bits.
      let wbits = n.and(mask).toJSNumber();
      // Shift number by W bits.
      n = n.shiftRight(shiftBy);

      // If the bits are bigger than max size, we'll split those.
      // +224 => 256 - 32
      if (wbits > windowSize) {
        wbits -= maxNumber;
        n = n.add(bigInt.one);
      }

      // Check if we're onto Zero point.
      // Add random point inside current window to f.
      if (wbits === 0) {
        f = f.add(window % 2 ? precomputes[offset].negate() : precomputes[offset]);
      } else {
        const cached = precomputes[offset + Math.abs(wbits) - 1];
        p = p.add(wbits < 0 ? cached.negate() : cached);
      }
    }
    return [p, f];
  }

  // Constant time multiplication. Uses wNAF.
  multiply(scalar: number | BigInteger | Fq): this {
    let n = scalar;
    if (n instanceof Fq) n = n.value;
    if (typeof n === 'number') n = bigInt(n);
    if (n.lesserOrEquals(bigInt.zero))
      throw new Error('ProjectivePoint#multiply: invalid scalar, expected positive integer');
    if (bitLen(n) > this.maxBits())
      throw new Error(
        'ProjectivePoint#multiply: scalar has more bits than maxBits, shoulnd\'t happen'
      );
    return this.wNAF(n)[0];
  }

  // Non-constant-time multiplication. Uses double-and-add algorithm.
  // It's faster, but should only be used when you don't care about
  // an exposed private key e.g. sig verification.
  multiplyUnsafe(scalar: number | BigInteger | Fq): this {
    let n = scalar;
    if (n instanceof Fq) n = n.value;
    if (typeof n === 'number') n = bigInt(n);
    if (n.lesserOrEquals(bigInt.zero)) {
      throw new Error('Point#multiply: invalid scalar, expected positive integer');
    }
    if (bitLen(n) > this.maxBits())
      throw new Error(
        'ProjectivePoint#multiply: scalar has more bits than maxBits, shoulnd\'t happen'
      );
    let p = this.getZero();
    let d: this = this;
    while (n.greater(bigInt.zero)) {
      if (n.isOdd()) { // n & 1
        p = p.add(d);
      }
      d = d.double();
      n = n.shiftRight(1);
    }
    return p;
  }

  abstract add(rhs: IECPoint<T>): this;
  abstract double(): this;
  abstract equals(rhs: IECPoint<T>): boolean;
  abstract isInf(): boolean;
  abstract negate(): this;

  protected abstract _curveA(): T;
  protected abstract _curveB(): T;

  public validatePoint(): boolean {
    const a = this._curveA();
    const b = this._curveB();
    if (this.curve.pairingFriendly === PairingFriendly.BLS) {
      if (this.isZero()) return true;
      const {x, y, z} = this;
      const left = y.pow(bigInt['2']).multiply(z).subtract(x.pow(bigInt['3']));
      const right = b.multiply(z.pow(bigInt['3']));
      return left.equals(right);
    }
    const [x, y] = this.toAffine();
    const lhs = y.square();
    const rhs = (x.square().add(a)).multiply(x).add(b);
    return lhs.equals(rhs);
  }

  public assertValidity() {
    if (this.isZero()) return;
    if (!this.validatePoint()) {
      throw new Error('Invalid point: not on curve over Fqx');
    }
  }
}
