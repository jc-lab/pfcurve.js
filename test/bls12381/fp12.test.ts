import * as fc from 'fast-check';
import * as chai from 'chai';

const expect = chai.expect;

import * as lib from '../../src';
import { BigintFour, Fq, Fq12 } from '../../src';
const CURVE = lib.findCurve('Fp381BLS12') as lib.Curve;
import {
  BigintTwelve
} from '../../src/types';
import Fq4 from '../../src/fq4';

const NUM_RUNS = Number(process.env.RUNS_COUNT || 10); // reduce to 1 to shorten test time

describe('bls12-381 Fp12', () => {
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
  it('test finalExponentiate', () => {
    // https://github.com/paulmillr/noble-bls12-381/blob/master/test/pairing.test.ts
    const p1 = Fq12.fromTuple(CURVE, [
      690392658038414015999440694435086329841032295415825549843130960252222448232974816207293269712691075396080336239827n,
      1673244384695948045466836192250093912021245353707563547917201356526057153141766171738038843400145227470982267854187n,
      2521701268183363687370344286906817113258663667920912959304741393298699171323721428784215127759799558353547063603791n,
      3390741958986800271255412688995304356725465880212612704138250878957654428361390902500149993094444529404319700338173n,
      2937610222696584007500949263676832694169290902527467459057239718838706247113927802450975619528632522479509319939064n,
      1041774303946777132837448067285334026888352159489566377408630813368450973018459091749907377030858960140758778772908n,
      3864799331679524425952286895114884847547051478975342624231897335512502423735668201254948484826445296416036052803892n,
      3824221261758382083252395717303526902028176893529557070611185581959805652254106523709848773658607700988378551642979n,
      3323164764111867304984970151558732202678135525250230081908783488276670159769559857016787572497867551292231024927968n,
      1011304421692205285006791165988839444878224012950060115964565336021949568250312574884591704110914940911299353851697n,
      2263326825947267463771741379953930448565128050766360539694662323032637428903113943692772437175107441778689006777591n,
      2975309739982292949472410540684863862532494446476557866806093059134361887381947558323102825622690771432446161524562n
    ]);
    expect(p1.finalExponentiate()).eql(Fq12.fromTuple(CURVE, [
      0x09d72c189ba2fd4b09b63da857f321b791b45f8ec589858bc6d41c8f4eb05244ad7a22aea1119a958d890a19f6cacedan,
      0x153f579b44547ee81c5d1603571b4776a065e86b4e3da0bba32afedafcca10f0a40005e63c9408785761da689b4b7338n,
      0x00bb1efcca23009c3638ae9ec0ee5153fa94b4edca88c3438029bcd5909e838da44483f0bfb5877609dace3bfa7d4ff3n,
      0x0c0e22bf2d593bc5b7ce484f3ff81a23a0c36725909225c1cf2f277482144951ea3fe425d2a56a91b681e11abc56c7fan,
      0x12c99e5152ab314ca6baec31cddbeff18acdac3a91c0e62de63e029bee76d775e0940408447b0fddad84b8dde9b86deen,
      0x0fe6a726b7d4947bb7bcb22a06dd4a283ce7113e956bcbb0294883046944312a72536fff08166adcfa08dfd65e4c157fn,
      0x176bfe03f017f18f7a2af0f178b5f018434ef3623da77e40d7fc78fca08299f81f6879c69026f4a7ba639463893e0708n,
      0x0282d90ee23efd9a2e0d51af8a2048bbda4517a90a24318a75d0dd6addc29b068d17e7c89a04da84b142996aa29b1516n,
      0x0c2cdf5de0889c4b55752cf839e61a81feaebf97a812c7581c8f66395868b582cbea067c9d435dabb5722913da709bffn,
      0x0741ece37d164288d7a590b3d31d9e6f26ce0797f1b99a77cd0b5eba24eae26afcb8b69f39af06e701ceaabf94c3db5en,
      0x00c9dea49cc3e1c8be938f707bbb0239e8f960fa46617877f90b3212fc3f5890999082b9c2262c8543a278136f34b5dbn,
      0x08f574e635870b8f4ad8c18d162055ab6136db296ad5f25151244e3b1ce0d81389b9d1752a46af018e8fb1ac01b683e1n
    ]));
  });
});

