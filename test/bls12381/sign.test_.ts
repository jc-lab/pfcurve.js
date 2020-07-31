import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';

import PointG1 from '../../src/point-g1';
import PointG2 from '../../src/point-g2';
import Fq12 from '../../src/fq12';
import {
  pairing
} from '../../src/pairing';

const CURVE = lib.findCurve('Fp381BLS12') as lib.ICurve;

const G1 = PointG1.BASE(CURVE);
const G2 = PointG2.BASE(CURVE);
const CURVE_ORDER = CURVE.r;

describe('bls12-381 sign', () => {
  it('sign and verify', () => {
    const keys = [
      0x28b90deaf189015d3a325908c5e0e4bf00f84f7e639b056ff82d7e70b6eede4cn,
      0x1a0111ea397fe69a4bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaacn,
    ];
    // for (const k of keys) {
    //
    // }
  });
});
