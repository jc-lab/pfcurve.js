import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import { Fq, Fq2 } from '../../src';
const CURVE = lib.findCurve('Fp462BN') as lib.Curve;

const NUM_RUNS = Number(process.env.RUNS_COUNT || 10); // reduce to 1 to shorten test time

describe('bn462 Fp2', () => {
  it('Fp2 equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        const b = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.equals(b)).true;
        expect(b.equals(a)).true;
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 non-equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          expect(a.equals(b)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
          expect(b.equals(a)).eq(num1[0] === num2[0] && num1[1] === num2[1]);
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 square and multiplication equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.square()).eql(a.multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 multiplication and add equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.multiply(0n)).eql(Fq2.ZERO(CURVE));
        expect(a.multiply(Fq2.ZERO(CURVE))).eql(Fq2.ZERO(CURVE));
        expect(a.multiply(1n)).eql(a);
        expect(a.multiply(Fq2.ONE(CURVE))).eql(a);
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
  it('Fp2 multiplication commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          expect(a.multiply(b)).eql(b.multiply(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 multiplication associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2, num3) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          const c = new Fq2(CURVE, [num3[0], num3[1]]);
          expect(a.multiply(b.multiply(c))).eql(a.multiply(b).multiply(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 multiplication distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2, num3) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          const c = new Fq2(CURVE, [num3[0], num3[1]]);
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
  it('Fp2 division with one equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.div(new Fq2(CURVE, [1n, 0n]))).eql(a);
        expect(a.div(Fq2.ONE(CURVE))).eql(a);
        expect(a.div(a)).eql(Fq2.ONE(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 division with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(Fq2.ZERO(CURVE).div(a)).eql(Fq2.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 division distributivity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2, num3) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          const c = new Fq2(CURVE, [num3[0], num3[1]]);
          expect(a.add(b).div(c)).eql(a.div(c).add(b.div(c)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 addition with zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.add(Fq2.ZERO(CURVE))).eql(a);
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 addition commutatity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          expect(a.add(b)).eql(b.add(a));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 add associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2, num3) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          const c = new Fq2(CURVE, [num3[0], num3[1]]);
          expect(a.add(b.add(c))).eql(a.add(b).add(c));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 minus zero equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.subtract(Fq2.ZERO(CURVE))).eql(a);
        expect(a.subtract(a)).eql(Fq2.ZERO(CURVE));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 minus and negative equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num1[0], num1[1]]);
          expect(Fq2.ZERO(CURVE).subtract(a)).eql(a.negate());
          expect(a.subtract(b)).eql(a.add(b.negate()));
          expect(a.subtract(b)).eql(a.add(b.multiply(-1n)));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 negative equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.negate()).eql(Fq2.ZERO(CURVE).subtract(a));
        expect(a.negate()).eql(a.multiply(-1n));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 division and multiplitaction equality', () => {
    fc.assert(
      fc.property(
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2),
        (num1, num2) => {
          const a = new Fq2(CURVE, [num1[0], num1[1]]);
          const b = new Fq2(CURVE, [num2[0], num2[1]]);
          expect(a.div(b)).eql(a.multiply(b.invert()));
        }
      ),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  it('Fp2 pow and multiplitaction equality', () => {
    fc.assert(
      fc.property(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), num => {
        const a = new Fq2(CURVE, [num[0], num[1]]);
        expect(a.pow(0n)).eql(Fq2.ONE(CURVE));
        expect(a.pow(1n)).eql(a);
        expect(a.pow(2n)).eql(a.multiply(a));
        expect(a.pow(3n)).eql(a.multiply(a).multiply(a));
      }),
      {
        numRuns: NUM_RUNS
      }
    );
  });
  // it("Fp2 frobenius", () => {
  //   expect(Fq2.FROBENIUS_COEFFICIENTS[0].equals(Fq.ONE)).eq(true);
  //   expect(Fq2.FROBENIUS_COEFFICIENTS[1].equals(Fq.ONE.negate().pow(0x0f81ae6945026025546c75a2a5240311d8ab75fac730cbcacd117de46c663f3fdebb76c445078281bf953ed363fa069bn))).eq(true);
  //   let a = new Fq2(CURVE, [0x00f8d295b2ded9dcccc649c4b9532bf3b966ce3bc2108b138b1a52e0a90f59ed11e59ea221a3b6d22d0078036923ffc7n, 0x012d1137b8a6a8374e464dea5bcfd41eb3f8afc0ee248cadbe203411c66fb3a5946ae52d684fa7ed977df6efcdaee0dbn]);
  //   a = a.frobeniusMap(0);
  //   expect(a.equals(new Fq2(CURVE, [0x00f8d295b2ded9dcccc649c4b9532bf3b966ce3bc2108b138b1a52e0a90f59ed11e59ea221a3b6d22d0078036923ffc7n, 0x012d1137b8a6a8374e464dea5bcfd41eb3f8afc0ee248cadbe203411c66fb3a5946ae52d684fa7ed977df6efcdaee0dbn]))).eq(true);
  //   a = a.frobeniusMap(1);
  //   expect(a.equals(new Fq2(CURVE, [0x00f8d295b2ded9dcccc649c4b9532bf3b966ce3bc2108b138b1a52e0a90f59ed11e59ea221a3b6d22d0078036923ffc7n, 0x18d400b280d93e62fcd559cbe77bd8b8b07e9bc405608611a9109e8f3041427e8a411ad149045812228109103250c9d0n]))).eq(true);
  //   a = a.frobeniusMap(1);
  //   expect(a.equals(new Fq2(CURVE, [0x00f8d295b2ded9dcccc649c4b9532bf3b966ce3bc2108b138b1a52e0a90f59ed11e59ea221a3b6d22d0078036923ffc7n, 0x012d1137b8a6a8374e464dea5bcfd41eb3f8afc0ee248cadbe203411c66fb3a5946ae52d684fa7ed977df6efcdaee0dbn]))).eq(true);
  //   a = a.frobeniusMap(2);
  //   expect(a.equals(new Fq2(CURVE, [0x00f8d295b2ded9dcccc649c4b9532bf3b966ce3bc2108b138b1a52e0a90f59ed11e59ea221a3b6d22d0078036923ffc7n, 0x012d1137b8a6a8374e464dea5bcfd41eb3f8afc0ee248cadbe203411c66fb3a5946ae52d684fa7ed977df6efcdaee0dbn]))).eq(true);
  // });
});
