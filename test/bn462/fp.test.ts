import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import { Fq } from '../../src';

const CURVE = lib.findCurve('Fp462BN') as lib.ICurve;

const NUM_RUNS = Number(process.env.RUNS_COUNT || 10); // reduce to 1 to shorten test time

describe('bn462 Fp', () => {
  it('Fp equality', () => {
    fc.assert(
      fc.property(fc.bigInt(1n, Fq.ORDER(CURVE)), num => {
        const a = new Fq(CURVE, num);
        const b = new Fq(CURVE, num);
        expect(a.equals(b)).true;
        expect(b.equals(a)).true;
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp non-equality', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          expect(a.equals(b)).eq(num1 === num2);
          expect(b.equals(a)).eq(num1 === num2);
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp square and multiplication equality', () => {
    fc.assert(
      fc.property(fc.bigInt(1n, Fq.ORDER(CURVE)), num => {
        const a = new Fq(CURVE, num);
        expect(a.square()).eql(a.multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp multiplication and add equality', () => {
    fc.assert(
      fc.property(fc.bigInt(1n, Fq.ORDER(CURVE)), num => {
        const a = new Fq(CURVE, num);
        expect(a.multiply(new Fq(CURVE, 0n))).eql(Fq.ZERO(CURVE));
        expect(a.multiply(Fq.ZERO(CURVE))).eql(Fq.ZERO(CURVE));
        expect(a.multiply(new Fq(CURVE, 1n))).eql(a);
        expect(a.multiply(Fq.ONE(CURVE))).eql(a);
        expect(a.multiply(new Fq(CURVE, 2n))).eql(a.add(a));
        expect(a.multiply(new Fq(CURVE, 3n))).eql(a.add(a).add(a));
        expect(a.multiply(new Fq(CURVE, 4n))).eql(
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
  it('Fp multiplication commutatity', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          expect(a.multiply(b)).eql(b.multiply(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp multiplication associativity', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2, num3) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          const c = new Fq(CURVE, num3);
          expect(a.multiply(b.multiply(c))).eql(a.multiply(b).multiply(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp multiplication distributivity', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2, num3) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          const c = new Fq(CURVE, num3);
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
  it('Fp division with one equality', () => {
    fc.assert(
      fc.property(fc.bigInt(1n, Fq.ORDER(CURVE)), num => {
        const a = new Fq(CURVE, num);
        expect(a.div(Fq.ONE(CURVE))).eql(a);
        expect(a.div(a)).eql(Fq.ONE(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp division with.ZERO equality', () => {
    fc.assert(
      fc.property(fc.bigInt(1n, Fq.ORDER(CURVE)), num => {
        const a = new Fq(CURVE, num);
        expect(Fq.ZERO(CURVE).div(a)).eql(Fq.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp division distributivity', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2, num3) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          const c = new Fq(CURVE, num3);
          expect(a.add(b).div(c)).eql(a.div(c).add(b.div(c)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp addition with.ZERO equality', () => {
    fc.assert(
      fc.property(fc.bigInt(1n, Fq.ORDER(CURVE)), num => {
        const a = new Fq(CURVE, num);
        expect(a.add(Fq.ZERO(CURVE))).eql(a);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp addition commutatity', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          expect(a.add(b)).eql(b.add(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp add associativity', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2, num3) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          const c = new Fq(CURVE, num3);
          expect(a.add(b.add(c))).eql(a.add(b).add(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp minus.ZERO equality', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        num => {
          const a = new Fq(CURVE, num);
          expect(a.subtract(Fq.ZERO(CURVE))).eql(a);
          expect(a.subtract(a)).eql(Fq.ZERO(CURVE));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp minus and negative equality', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num1);
          expect(Fq.ZERO(CURVE).subtract(a)).eql(a.negate());
          expect(a.subtract(b)).eql(a.add(b.negate()));
          expect(a.subtract(b)).eql(a.add(b.multiply(new Fq(CURVE, -1n))));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp negative equality', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        num => {
          const a = new Fq(CURVE, num);
          expect(a.negate()).eql(Fq.ZERO(CURVE).subtract(a));
          expect(a.negate()).eql(a.multiply(new Fq(CURVE, -1n)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp division and multiplitaction equality', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        (num1, num2) => {
          const a = new Fq(CURVE, num1);
          const b = new Fq(CURVE, num2);
          expect(a.div(b)).eql(a.multiply(b.invert()));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp pow and multiplitaction equality', () => {
    fc.assert(
      fc.property(
        fc.bigInt(1n, Fq.ORDER(CURVE)),
        num => {
          const a = new Fq(CURVE, num);
          expect(a.pow(0n)).eql(Fq.ONE(CURVE));
          expect(a.pow(1n)).eql(a);
          expect(a.pow(2n)).eql(a.multiply(a));
          expect(a.pow(3n)).eql(a.multiply(a).multiply(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
});
