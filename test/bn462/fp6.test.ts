import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import {NativeBigintSix, bigInt, Fq, Fq6} from '../../src';
const CURVE = lib.findCurve('Fp462BN') as lib.Curve;

const NUM_RUNS = Number(process.env.RUNS_COUNT || 10); // reduce to 1 to shorten test time

describe('bn462 Fp6', () => {
  it('Fp6 equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        const b = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.equals(b)).eq(true);
        expect(b.equals(a)).eq(true);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 non-equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          expect(a.equals(b)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
          expect(b.equals(a)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 square and multiplication equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.square()).eql(a.multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 multiplication and add equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.multiply(bigInt(0))).eql(Fq6.ZERO(CURVE));
        expect(a.multiply(Fq6.ZERO(CURVE))).eql(Fq6.ZERO(CURVE));
        expect(a.multiply(bigInt(1))).eql(a);
        expect(a.multiply(Fq6.ONE(CURVE))).eql(a);
        expect(a.multiply(bigInt(2))).eql(a.add(a));
        expect(a.multiply(bigInt(3))).eql(a.add(a).add(a));
        expect(a.multiply(bigInt(4))).eql(
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
  it('Fp6 multiplication commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          expect(a.multiply(b)).eql(b.multiply(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 multiplication associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2, num3) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          const c = Fq6.fromTuple(CURVE, num3 as NativeBigintSix);
          expect(a.multiply(b.multiply(c))).eql(a.multiply(b).multiply(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 multiplication distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2, num3) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          const c = Fq6.fromTuple(CURVE, num3 as NativeBigintSix);
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
  it('Fp6 division with one equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.div(bigInt.one)).eql(a);
        expect(a.div(Fq6.ONE(CURVE))).eql(a);
        expect(a.div(a)).eql(Fq6.ONE(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 division with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(Fq6.ZERO(CURVE).div(a)).eql(Fq6.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 division distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2, num3) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          const c = Fq6.fromTuple(CURVE, num3 as NativeBigintSix);
          expect(a.add(b).div(c)).eql(a.div(c).add(b.div(c)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 addition with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.add(Fq6.ZERO(CURVE))).eql(a);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 addition commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          expect(a.add(b)).eql(b.add(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 add associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2, num3) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          const c = Fq6.fromTuple(CURVE, num3 as NativeBigintSix);
          expect(a.add(b.add(c))).eql(a.add(b).add(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 minus zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.subtract(Fq6.ZERO(CURVE))).eql(a);
        expect(a.subtract(a)).eql(Fq6.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 minus and negative equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          expect(Fq6.ZERO(CURVE).subtract(a)).eql(a.negate());
          expect(a.subtract(b)).eql(a.add(b.negate()));
          expect(a.subtract(b)).eql(a.add(b.multiply(bigInt.minusOne)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 negative equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.negate()).eql(Fq6.ZERO(CURVE).subtract(a));
        expect(a.negate()).eql(a.multiply(bigInt.minusOne));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 division and multiplitaction equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6),
        (num1, num2) => {
          const a = Fq6.fromTuple(CURVE, num1 as NativeBigintSix);
          const b = Fq6.fromTuple(CURVE, num2 as NativeBigintSix);
          expect(a.div(b)).eql(a.multiply(b.invert()));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp6 pow and multiplitaction equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 6, 6), num => {
        const a = Fq6.fromTuple(CURVE, num as NativeBigintSix);
        expect(a.pow(bigInt(0))).eql(Fq6.ONE(CURVE));
        expect(a.pow(bigInt(1))).eql(a);
        expect(a.pow(bigInt(2))).eql(a.multiply(a));
        expect(a.pow(bigInt(3))).eql(a.multiply(a).multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
});

