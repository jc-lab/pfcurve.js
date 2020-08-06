import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import { bigInt, NativeBigintFour, Fq, Fq4 } from '../../src';
const CURVE = lib.findCurve('Fp462BN') as lib.Curve;

const NUM_RUNS = Number(process.env.RUNS_COUNT || 10); // reduce to 1 to shorten test time

describe('bn462 Fp4', () => {
  it('Fp4 equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        const b = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.equals(b)).eq(true);
        expect(b.equals(a)).eq(true);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 non-equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          expect(a.equals(b)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
          expect(b.equals(a)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 square and multiplication equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.square()).eql(a.multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 multiplication and add equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.multiply(bigInt(0))).eql(Fq4.ZERO(CURVE));
        expect(a.multiply(Fq4.ZERO(CURVE))).eql(Fq4.ZERO(CURVE));
        expect(a.multiply(bigInt(1))).eql(a);
        expect(a.multiply(Fq4.ONE(CURVE))).eql(a);
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
  it('Fp4 multiplication commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          expect(a.multiply(b)).eql(b.multiply(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 multiplication associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2, num3) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          const c = Fq4.fromTuple(CURVE, num3 as NativeBigintFour);
          expect(a.multiply(b.multiply(c))).eql(a.multiply(b).multiply(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 multiplication distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2, num3) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          const c = Fq4.fromTuple(CURVE, num3 as NativeBigintFour);
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
  it('Fp4 division with one equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.div(bigInt.one)).eql(a);
        expect(a.div(Fq4.ONE(CURVE))).eql(a);
        expect(a.div(a)).eql(Fq4.ONE(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 division with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(Fq4.ZERO(CURVE).div(a)).eql(Fq4.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 division distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2, num3) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          const c = Fq4.fromTuple(CURVE, num3 as NativeBigintFour);
          expect(a.add(b).div(c)).eql(a.div(c).add(b.div(c)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 addition with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.add(Fq4.ZERO(CURVE))).eql(a);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 addition commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          expect(a.add(b)).eql(b.add(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 add associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2, num3) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          const c = Fq4.fromTuple(CURVE, num3 as NativeBigintFour);
          expect(a.add(b.add(c))).eql(a.add(b).add(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 minus zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.subtract(Fq4.ZERO(CURVE))).eql(a);
        expect(a.subtract(a)).eql(Fq4.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 minus and negative equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          expect(Fq4.ZERO(CURVE).subtract(a)).eql(a.negate());
          expect(a.subtract(b)).eql(a.add(b.negate()));
          expect(a.subtract(b)).eql(a.add(b.multiply(bigInt.minusOne)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 negative equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.negate()).eql(Fq4.ZERO(CURVE).subtract(a));
        expect(a.negate()).eql(a.multiply(bigInt.minusOne));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 division and multiplitaction equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4),
        (num1, num2) => {
          const a = Fq4.fromTuple(CURVE, num1 as NativeBigintFour);
          const b = Fq4.fromTuple(CURVE, num2 as NativeBigintFour);
          expect(a.div(b)).eql(a.multiply(b.invert()));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp4 pow and multiplitaction equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, BigInt(Fq.ORDER(CURVE).toString())), 4, 4), num => {
        const a = Fq4.fromTuple(CURVE, num as NativeBigintFour);
        expect(a.pow(bigInt(0))).eql(Fq4.ONE(CURVE));
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

