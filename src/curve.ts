import {
  BigintTuple,
  CurveType,
  ICurve, INonResidues, PairingFriendly, SexticTwist, SignOfX
} from './types';
import {
  frobeniusCoeffs
} from './intl';

interface IFrobeniusCoeffses {
  fq2: Fq[],
  fq4: Fq2[][],
  fq6: Fq2[][],
  fq12: Fq2[]
}

function convertToBinary(x: bigint): number[] {
  const len = bitLen(x);
  const v = Array<number>(len);
  for (let i = 0; i < len; i++) {
    v[i] = bitGet(x, len - 1 - i) ? 1 : 0;
  }
  return v;
}

function getContinuousVal(v: number[], pos: number, val: number): number
{
  while (pos >= 2) {
    if (v[pos] != val) break;
    pos--;
  }
  return pos;
}

function getNumOfNonZeroElement(v: number[]): number
{
  let w = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i]) w++;
  }
  return w;
}


function convertToNAF(_in: number[]): number[]
{
  const v = Array.from(_in);
  let pos = v.length - 1;
  for (;;) {
    const p = getContinuousVal(v, pos, 0);
    if (p == 1) return v;
    if (!(v[p] == 1)) {
      throw new Error('convertToNAF: Error 1');
    }
    const q = getContinuousVal(v, p, 1);
    if (q == 1) return v;
    if (!(v[q] == 0)) {
      throw new Error('convertToNAF: Error 1');
    }
    if (p - q <= 1) {
      pos = p - 1;
      continue;
    }
    v[q] = 1;
    for (let i = q + 1; i < p; i++) {
      v[i] = 0;
    }
    v[p] = -1;
    pos = q;
  }
}

/**
 * compute a repl of x which has smaller Hamming weights.
 * return true if naf is selected
 * @param x
 */
function getNAF(x: bigint): [boolean, number[]] {
  const bin = convertToBinary(x);
  const naf = convertToNAF(bin);
  const binW = getNumOfNonZeroElement(bin);
  const nafW = getNumOfNonZeroElement(naf);
  if (nafW < binW) {
    return [true, naf];
  } else {
    return [false, bin];
  }
}

function abs(x: bigint): bigint {
  if (x < 0n)
    return -x;
  return x;
}

export default class Curve implements ICurve {
  private readonly _param: ICurve;
  private readonly _frobeniusCoeffses: IFrobeniusCoeffses;

  public readonly isBLS12: boolean;
  public readonly useNAF: boolean;
  public readonly siTbl: number[];
  public readonly zReplTbl: number[];
  public readonly gTbl: Fq2[];
  public readonly g2Tbl: Fq2[];
  public readonly g3Tbl: Fq2[];

  public readonly pointG1: PointG1;
  public readonly pointG2: PointG2;

  constructor(param: ICurve) {
    this._param = Object.freeze(param);

    this.pointG1 = PointG1.BASE(this);
    this.pointG2 = PointG2.BASE(this);

    const frobeniusCoeffses: IFrobeniusCoeffses = {
      fq2: [],
      fq4: [],
      fq6: [],
      fq12: []
    };

    if (param.nonresidues.fp && param.nonresidues.fp.length > 0) {
      const coeffs = param.nonresidues.fp;
      frobeniusCoeffses.fq2 = frobeniusCoeffs(new Fq(this, coeffs[0]), param.P, 2)[0];
    }

    if (param.nonresidues.fp2 && param.nonresidues.fp2.length > 0) {
      const coeffs = param.nonresidues.fp2;
      frobeniusCoeffses.fq4 = frobeniusCoeffs(Fq2.fromTuple(this, coeffs as BigintTuple), param.P, 4, 2, 2);
      frobeniusCoeffses.fq6 = frobeniusCoeffs(Fq2.fromTuple(this, coeffs as BigintTuple), param.P, 6, 2, 3);
      frobeniusCoeffses.fq12 = frobeniusCoeffs(Fq2.fromTuple(this, coeffs as BigintTuple), param.P, 12, 2, 6)[0];
    }

    this._frobeniusCoeffses = Object.freeze(frobeniusCoeffses);

    this.isBLS12 = /Fp(\d+)BLS12/i.test(this.name);
    const largest_c = this.isBLS12 ? this.x : abs(this.x * 6n + 2n);
    const [useNAF, siTbl] = getNAF(largest_c);
    this.useNAF = useNAF;
    this.siTbl = siTbl;

    const [tempNAF, zReplTbl] = getNAF(this.x);
    this.zReplTbl = zReplTbl;

    const gN = 5;
    const gTbl: Fq2[] = Array<Fq2>(gN);
    const g2Tbl: Fq2[] = Array<Fq2>(gN);
    const g3Tbl: Fq2[] = Array<Fq2>(gN);
    /*
		g = xi^((p - 1) / 6)
		gTbl[] = { g^2, g^4, g^1, g^3, g^5 }
    */
    const gTmp = Fq2.fromTuple(this, this.nonresidues.fp2 as BigintTuple).pow((this.P - 1n) / 6n);
    gTbl[0] = gTmp.pow(2n);
    gTbl[1] = gTmp.pow(4n);
    gTbl[2] = gTmp;
    gTbl[3] = gTmp.pow(3n);
    gTbl[4] = gTmp.pow(5n);

    const pmod4 = Fq.Pmod4(this);
    for (let i = 0; i < gN; i++) {
      let t = gTbl[i];
      if (pmod4 === 3n) {
        t = new Fq2(this, [t.c[0], t.c[1].negate()]);
      }
      g2Tbl[i] = t.multiply(gTbl[i]);
      g3Tbl[i] = gTbl[i].multiply(g2Tbl[i]);
    }

    this.gTbl = gTbl;
    this.g2Tbl = g2Tbl;
    this.g3Tbl = g3Tbl;
  }

  public get param(): ICurve {
    return this._param;
  }

  public get frobeniusCoeffses(): IFrobeniusCoeffses {
    return this._frobeniusCoeffses;
  }

  public get name(): string {
    return this._param.name;
  }

  public get curveType(): CurveType {
    return this._param.curveType;
  }
  public get sexticTwist(): SexticTwist {
    return this._param.sexticTwist;
  }
  public get signOfX(): SignOfX {
    return this._param.signOfX;
  }
  public get pairingFriendly(): PairingFriendly {
    return this._param.pairingFriendly;
  }

  public get QNRI(): number {
    return this._param.QNRI;
  }
  public get EFS(): number {
    return this._param.EFS;
  }

  public get nonresidues(): INonResidues {
    return this._param.nonresidues;
  }

  public get A(): bigint {
    return this._param.A;
  }
  public get B(): bigint {
    return this._param.B;
  }
  public get B2(): [bigint, bigint] {
    return this._param.B2;
  }

  // x (only positive)
  public get x(): bigint {
    return this._param.x;
  }

  // a characteristic
  public get P(): bigint {
    return this._param.P;
  }

  // an order
  public get r(): bigint {
    return this._param.r;
  }

  // a cofactor
  public get h(): bigint {
    return this._param.h;
  }

  public get Gx(): bigint {
    return this._param.Gx;
  }
  public get Gy(): bigint {
    return this._param.Gy;
  }

  public get G2x(): [bigint, bigint] {
    return this._param.G2x;
  }
  public get G2y(): [bigint, bigint] {
    return this._param.G2y;
  }
}

import Fq from './fq';
import Fq2 from './fq2';
import {
  bitGet, bitLen
} from './utils';
import PointG1 from './point-g1';
import PointG2 from './point-g2';
