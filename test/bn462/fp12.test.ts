import * as fc from 'fast-check';
import * as chai from 'chai';

const expect = chai.expect;

import * as lib from '../../src';
import { BigintTwelve, Fq, Fq12 } from '../../src';
const CURVE = lib.findCurve('Fp462BN') as lib.Curve;

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
  it('test finalExponentiate', () => {
    // https://github.com/herumi/mcl/blob/master/test/bn512_test.cpp result
    const p1 = Fq12.fromTuple(CURVE, [
      5216968787514911979750307363461839470912526483547576998557993083578210982632019547536867866163935276844327795800046634747841662029033937348n,
      1333810616693464251115261478896529165415933483706352300514901487558004524215563719661015011547903730309199545622565181238301926152731223662n,
      4514303503008534838853193590042890199538888507592606989312434363846940331908251207472718258391118332704926707279090225320072173025834893551n,
      4910975258576095820464324067135690518319968117173581970415790690129592310587888078200939677230367945448064950929530567836940593997273119976n,
      6387192816557274188551631646122548631941407854660253215994412169165892382178292106618787739130311784457171787224557634687853199228861901230n,
      3002955690985296628646139083975829956958105876040949793299558882608141133008745202706737845949924178600032723668738339372178519925361470082n,
      298801625150656094105486879162798941677179846981394751146512440648212069046346876537057085022334723701689369937681793813081049375241730858n,
      1502405776491340253323180255892674085938004530573127391784349127146048120423730898966467313626486639165396364517632663182514618734988627816n,
      2779958293211260628991113808435677752876508081429988933232806693655564311871755847365051741028443209286839100472472331489353879872536735751n,
      3856426788148792537372614073079810458082220929587595173858965727820846132593544528644530057988006207378222990717575649075497749981506474058n,
      3366503860270264137053363691599080861867380015559504775068591164987837147610687869487030684254847992897203280134581919063919707535173947435n,
      1793946915628765316127647168434676501884159578803766896218572880289978497859920527685123366474498264923186449895752134311204882498524591053n
    ]);
    const p2 = p1.finalExponentiate();
    expect(p2).eql(Fq12.fromTuple(CURVE, [
      5051447334992541765184733239037987396486542637425952639114700408019910332876947170887133693174336875975833611908027935329824685781768536642n,
      165283297522908429326954732315624069988501923941201290000942026394043721389259255641742915528120582381013044164928804971790994466299800636n,
      1469468081131098112756384074630957615453438604581217215498294260339182317351818642017969516630279074232616028542904764121468115272028273738n,
      1646715861684133363128575715576388733475437662858299306394746509450551586577969006697389920082279826537353958522171436439531937636070522794n,
      5961269748149382865653769644284108364006748322381900411802481214447542217231046375519966438225297471877632001084276256530978914230282150256n,
      3877906910480448652801756633918947416769104038388422332715987379102448758546082525103291004805669214464033963366486975885312003809805667766n,
      3337009882813265853874868057036482260285596326118935161390801563385586395722381768583910587683729252906475155634338696003989995291152412565n,
      1446474200130869253803659557404975559014416629693169384341474437265232913512716273347396242928699086297491886675672127656973569900300624280n,
      4206214791079020058330402359917867616859106842972265920108189260166622215012485232819469508813812176563760687516916351245090020673166115944n,
      2789374983647394376823739751383538506174961077172390729111439535769734097262804967015307527101130857529795293239776736282303200942471872735n,
      6044151914096293523996182439224449769603629491778977589541587790607511156074599041783438243367972849205878925050241276904655701130265792602n,
      4105942500791203180180077669193130753884528410144909717314504864946413518376521092776573084244935736056446709919101400229475112891569533398n
    ]));
  });
});

