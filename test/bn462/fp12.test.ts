import * as fc from 'fast-check';
import * as chai from 'chai';

const expect = chai.expect;

import * as lib from '../../src';
import { BigintTwelve, Fq, Fq12 } from '../../src';
const CURVE = lib.findCurve('Fp462BN') as lib.ICurve;

const NUM_RUNS = Number(process.env.RUNS_COUNT || 10); // reduce to 1 to shorten test time

describe('bn462 Fp12', () => {
  it('Fp12 equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        const b = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.equals(b)).eq(true);
        expect(b.equals(a)).eq(true);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 non-equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          expect(a.equals(b)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
          expect(b.equals(a)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 square and multiplication equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.square()).eql(a.multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 multiplication and add equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.multiply(0n)).eql(Fq12.ZERO(CURVE));
        expect(a.multiply(Fq12.ZERO(CURVE))).eql(Fq12.ZERO(CURVE));
        expect(a.multiply(1n)).eql(a);
        expect(a.multiply(Fq12.ONE(CURVE))).eql(a);
        expect(a.multiply(2n)).eql(a.add(a));
        expect(a.multiply(3n)).eql(a.add(a).add(a));
        expect(a.multiply(4n)).eql(
          a
            .add(a)
            .add(a)
            .add(a)
        );
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 multiplication commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          expect(a.multiply(b)).eql(b.multiply(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 multiplication associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2, num3) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          const c = Fq12.fromTuple(CURVE, num3 as BigintTwelve);
          expect(a.multiply(b.multiply(c))).eql(a.multiply(b).multiply(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 multiplication distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2, num3) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          const c = Fq12.fromTuple(CURVE, num3 as BigintTwelve);
          expect(a.multiply(b.add(c))).eql(
            b.multiply(a).add(c.multiply(a))
          );
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 division with one equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.div(1n)).eql(a);
        expect(a.div(Fq12.ONE(CURVE))).eql(a);
        expect(a.div(a)).eql(Fq12.ONE(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 division with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(Fq12.ZERO(CURVE).div(a)).eql(Fq12.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 division distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2, num3) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          const c = Fq12.fromTuple(CURVE, num3 as BigintTwelve);
          expect(a.add(b).div(c)).eql(a.div(c).add(b.div(c)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 addition with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.add(Fq12.ZERO(CURVE))).eql(a);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 addition commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          expect(a.add(b)).eql(b.add(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 add associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2, num3) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          const c = Fq12.fromTuple(CURVE, num3 as BigintTwelve);
          expect(a.add(b.add(c))).eql(a.add(b).add(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 minus zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.subtract(Fq12.ZERO(CURVE))).eql(a);
        expect(a.subtract(a)).eql(Fq12.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 minus and negative equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          expect(Fq12.ZERO(CURVE).subtract(a)).eql(a.negate());
          expect(a.subtract(b)).eql(a.add(b.negate()));
          expect(a.subtract(b)).eql(a.add(b.multiply(-1n)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 negative equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.negate()).eql(Fq12.ZERO(CURVE).subtract(a));
        expect(a.negate()).eql(a.multiply(-1n));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 division and multiplitaction equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12),
        (num1, num2) => {
          const a = Fq12.fromTuple(CURVE, num1 as BigintTwelve);
          const b = Fq12.fromTuple(CURVE, num2 as BigintTwelve);
          expect(a.div(b)).eql(a.multiply(b.invert()));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp12 pow and multiplitaction equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 12, 12), num => {
        const a = Fq12.fromTuple(CURVE, num as BigintTwelve);
        expect(a.pow(0n)).eql(Fq12.ONE(CURVE));
        expect(a.pow(1n)).eql(a);
        expect(a.pow(2n)).eql(a.multiply(a));
        expect(a.pow(3n)).eql(a.multiply(a).multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
});

