import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import { Fq, Fq2, PointG1, PointG2 } from '../../src';

const CURVE = lib.curves['bn462'];

const NUM_RUNS = Number(process.env.RUNS_COUNT || 10); // reduce to 1 to shorten test time

describe('bn462 Point', () => {
  describe('Point with Fq coordinates', () => {
    it('Point equality', () => {
      fc.assert(
        fc.property(
          fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 3, 3),
          fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 3, 3),
          ([x1, y1, z1], [x2, y2, z2]) => {
            const p1 = new PointG1(CURVE, new Fq(CURVE, x1), new Fq(CURVE, y1), new Fq(CURVE, z1));
            const p2 = new PointG1(CURVE, new Fq(CURVE, x2), new Fq(CURVE, y2), new Fq(CURVE, z2));
            expect(p1.equals(p1)).eq(true);
            expect(p2.equals(p2)).eq(true);
            expect(p1.equals(p2)).eq(false);
            expect(p2.equals(p1)).eq(false);
          }
        ),
        {
          numRuns: NUM_RUNS
        }
      );
    });
    it('should be placed on curve vector 1', () => {
      const a = new PointG1(CURVE, new Fq(CURVE, 0n), new Fq(CURVE, 1n), new Fq(CURVE, 0n));
      a.assertValidity();
    });
    it('should be placed on curve vector 2', () => {
      const a = PointG1.BASE(CURVE);
      a.assertValidity();
    });
    it('should not be placed on curve vector 1', () => {
      const a = new PointG1(CURVE, new Fq(CURVE, 0n), new Fq(CURVE, 1n), new Fq(CURVE, 1n));
      expect(() => a.assertValidity()).throw();
    });
    it('should not be placed on curve vector 2', () => {
      const a = new PointG1(CURVE,
        new Fq(CURVE,
          0x17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6ban
        ),
        new Fq(CURVE,
          0x08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1n
        ),
        new Fq(CURVE, 1n),
      );
      expect(() => a.assertValidity()).throw();
    });
    it('should be doubled and placed on curve vector 1', () => {
      const a = PointG1.BASE(CURVE);
      const double = a.double();
      double.assertValidity();
      // expect(double).eql(
      //   new PointG1(CURVE,
      //     new Fq(CURVE,
      //       0x5dff4ac6726c6cb9b6d4dac3f33e92c062e48a6104cc52f6e7f23d4350c60bd7803e16723f9f1478a13c2b29f4325adn
      //     ),
      //     new Fq(CURVE,
      //       0x14e4b429606d02bc3c604c0410e5fc01d6093a00bb3e2bc9395952af0b6a0dbd599a8782a1bea48a2aa4d8e1b1df7ca5n
      //     ),
      //     new Fq(CURVE,
      //       0x430df56ea4aba6928180e61b1f2cb8f962f5650798fdf279a55bee62edcdb27c04c720ae01952ac770553ef06aadf22n
      //     ),
      //   )
      // );

      expect(double.equals(a.add(a))).true;
      expect(double.equals(a.multiplyUnsafe(2n))).true;
      expect(double.equals(a.multiply(2n))).true;
    });
    it('uncompressed toBytes/fromBytes', () => {
      const a = PointG1.BASE(CURVE);
      const b = a.toBytes(false);
      const c = PointG1.fromBytes(CURVE, b);
      expect(a).eql(c);
      expect(b).eql(Buffer.from('0421a6d67ef250191fadba34a0a30160b9ac9264b6f95f63b3edbec3cf4b2e689db1bbb4e69a416a0b1e79239c0372e5cd70113c98d91f36b6980d0118ea0460f7f7abb82b33676a7432a490eeda842cccfa7d788c659650426e6af77df11b8ae40eb80f475432c66600622ecaa8a5734d36fb03de', 'hex'));
    });
    it('compressed toBytes/fromBytes', () => {
      const a = PointG1.BASE(CURVE);
      const b = a.toBytes(true);
      const c = PointG1.fromBytes(CURVE, b);
      expect(a).eql(c);
      expect(b).eql(Buffer.from('0221a6d67ef250191fadba34a0a30160b9ac9264b6f95f63b3edbec3cf4b2e689db1bbb4e69a416a0b1e79239c0372e5cd70113c98d91f36b6980d', 'hex'));
    });
  });
  describe('Point with Fq2 coordinates', () => {
    it('Point equality', () => {
      fc.assert(
        fc.property(
          fc.array(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), 3, 3),
          fc.array(fc.array(fc.bigInt(1n, Fq.ORDER(CURVE)), 2, 2), 3, 3),
          ([x1, y1, z1], [x2, y2, z2]) => {
            const p1 = new PointG2(CURVE,
              new Fq2(CURVE, x1),
              new Fq2(CURVE, y1),
              new Fq2(CURVE, z1),
            );
            const p2 = new PointG2(CURVE,
              new Fq2(CURVE, x2),
              new Fq2(CURVE, y2),
              new Fq2(CURVE, z2),
            );
            expect(p1.equals(p1)).eq(true);
            expect(p2.equals(p2)).eq(true);
            expect(p1.equals(p2)).eq(false);
            expect(p2.equals(p1)).eq(false);
          }
        ),
        {
          numRuns: NUM_RUNS
        }
      );
    });
    it('should be placed on curve vector 1', () => {
      const a = new PointG2(CURVE,
        new Fq2(CURVE, [0n, 0n]),
        new Fq2(CURVE, [1n, 0n]),
        new Fq2(CURVE, [0n, 0n]),
      );
      a.assertValidity();
    });
    it('should be placed on curve vector 2', () => {
      const a = PointG2.BASE(CURVE);
      a.assertValidity();
    });
    it('should not be placed on curve vector 1', () => {
      const a = new PointG2(CURVE,
        new Fq2(CURVE, [0n, 0n]),
        new Fq2(CURVE, [1n, 0n]),
        new Fq2(CURVE, [1n, 0n]),
      );
      expect(() => a.assertValidity()).throw();
    });
    it('should not be placed on curve vector 2', () => {
      const a = new PointG2(CURVE,
        new Fq2(CURVE, [
          0x024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4410b647ae3d1770bac0326a805bbefd48056c8c121bdb8n,
          0x13e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7en
        ]),
        new Fq2(CURVE, [
          0x0ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d229a695160d12c923ac9cc3baca289e193548608b82801n,
          0x0606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79ben
        ]),
        new Fq2(CURVE, [1n, 0n]),
      );
      expect(() => a.assertValidity()).throw();
    });
    it('uncompressed toBytes/fromBytes', () => {
      const a = PointG2.BASE(CURVE);
      const b = a.toBytes(false);
      const c = PointG2.fromBytes(CURVE, b);
      expect(a).eql(c);
      expect(b).eql(Buffer.from('040257ccc85b58dda0dfb38e3a8cbdc5482e0337e7c1cd96ed61c913820408208f9ad2699bad92e0032ae1f0aa6a8b48807695468e3d934ae1e4df1d2e4343e8599102af8edca849566ba3c98e2a354730cbed9176884058b18134dd86bae555b783718f50af8b59bf7e850e9b73108ba6aa8cd2830a0650439da22c1979517427a20809eca035634706e23c3fa7a6bb42fe810f1399a1f41c9ddae32e03695a140e7b11d7c3376e5b68df0db7154e073ef0cbd438cbe0172c8ae37306324d44d5e6b0c69ac57b393f1ab370fd725cc647692444a04ef87387aa68d53743493b9eba14cc552ca2a93a', 'hex'));
    });
    it('compressed toBytes/fromBytes', () => {
      const a = PointG2.BASE(CURVE);
      const b = a.toBytes(true);
      const c = PointG2.fromBytes(CURVE, b);
      expect(a).eql(c);
      expect(b).eql(Buffer.from('020257ccc85b58dda0dfb38e3a8cbdc5482e0337e7c1cd96ed61c913820408208f9ad2699bad92e0032ae1f0aa6a8b48807695468e3d934ae1e4df1d2e4343e8599102af8edca849566ba3c98e2a354730cbed9176884058b18134dd86bae555b783718f50af8b59bf7e850e9b73108ba6aa8cd283', 'hex'));
    });
  });
  it('should be doubled and placed on curve vector 1', () => {
    const a = PointG2.BASE(CURVE);
    const double = a.double();
    double.assertValidity();
    // expect(double).eql(
    //   new PointG2(CURVE,
    //     new Fq2(CURVE, [
    //       2004569552561385659566932407633616698939912674197491321901037400001042336021538860336682240104624979660689237563240n,
    //       3955604752108186662342584665293438104124851975447411601471797343177761394177049673802376047736772242152530202962941n
    //     ]),
    //     new Fq2(CURVE, [
    //       978142457653236052983988388396292566217089069272380812666116929298652861694202207333864830606577192738105844024927n,
    //       2248711152455689790114026331322133133284196260289964969465268080325775757898907753181154992709229860715480504777099n
    //     ]),
    //     new Fq2(CURVE, [
    //       3145673658656250241340817105688138628074744674635286712244193301767486380727788868972774468795689607869551989918920n,
    //       968254395890002185853925600926112283510369004782031018144050081533668188797348331621250985545304947843412000516197n
    //     ]),
    //   )
    // );
    expect(double).eql(a.add(a));
    expect(double).eql(a.multiply(2n));
  });
  it('wNAF multiplication same as unsafe (G1, W=1)', () => {
    const G = PointG1.BASE(CURVE).negate().negate(); // create new point
    const keys = [
      0x28b90deaf189015d3a325908c5e0e4bf00f84f7e639b056ff82d7e70b6eede4cn,
      0x1a0111ea397fe69a4bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaacn,
    ];
    for (const k of keys) {
      expect(G.multiply(k).equals(G.multiplyUnsafe(k))).true;
    }
  });
  it('wNAF multiplication same as unsafe (G1, W=4)', () => {
    const G = PointG1.BASE(CURVE).negate().negate();
    G.calcMultiplyPrecomputes(4);
    const keys = [
      0x28b90deaf189015d3a325908c5e0e4bf00f84f7e639b056ff82d7e70b6eede4cn,
      0x1a0111ea397fe69a4bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaacn,
    ];
    for (const k of keys) {
      expect(G.multiply(k).equals(G.multiplyUnsafe(k))).true;
    }
  });
  it('wNAF multiplication same as unsafe (G1, W=5)', () => {
    const G = PointG1.BASE(CURVE).negate().negate();
    G.calcMultiplyPrecomputes(5);
    const keys = [
      0x28b90deaf189015d3a325908c5e0e4bf00f84f7e639b056ff82d7e70b6eede4cn,
      0x1a0111ea397fe69a4bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaacn,
    ];
    for (const k of keys) {
      expect(G.multiply(k).equals(G.multiplyUnsafe(k))).true;
    }
  });
  it('wNAF multiplication same as unsafe (G2, W=1)', () => {
    const G = PointG2.BASE(CURVE).negate().negate();
    const keys = [
      0x28b90deaf189015d3a325908c5e0e4bf00f84f7e639b056ff82d7e70b6eede4cn,
      0x1a0111ea397fe69a4bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaacn,
    ];
    for (const k of keys) {
      expect(G.multiply(k).equals(G.multiplyUnsafe(k))).true;
    }
  });
  it('wNAF multiplication same as unsafe (G2, W=4)', () => {
    const G = PointG2.BASE(CURVE).negate().negate();
    G.calcMultiplyPrecomputes(4);
    const keys = [
      0x28b90deaf189015d3a325908c5e0e4bf00f84f7e639b056ff82d7e70b6eede4cn,
      0x1a0111ea397fe69a4bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaacn,
      0xbc69f08f2ee75b3584c6a0ea91b352888e2a8e9145ad7689986ff031508ffe1329c2f178731db956d82bf015d1212b02ec0ec69d7477c1ae954cbc06689f6a359894c0adebbf6b4e8020005aaa95551n,
    ];
    for (const k of keys) {
      expect(G.multiply(k).equals(G.multiplyUnsafe(k))).true;
    }
  });
  it('wNAF multiplication same as unsafe (G2, W=5)', () => {
    const G = PointG2.BASE(CURVE).negate().negate();
    G.calcMultiplyPrecomputes(5);
    const keys = [
      0x28b90deaf189015d3a325908c5e0e4bf00f84f7e639b056ff82d7e70b6eede4cn,
      0x1a0111ea397fe69a4bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaacn,
      0xbc69f08f2ee75b3584c6a0ea91b352888e2a8e9145ad7689986ff031508ffe1329c2f178731db956d82bf015d1212b02ec0ec69d7477c1ae954cbc06689f6a359894c0adebbf6b4e8020005aaa95551n,
    ];
    for (const k of keys) {
      expect(G.multiply(k).equals(G.multiplyUnsafe(k))).true;
    }
  });
  // https://tools.ietf.org/html/draft-irtf-cfrg-hash-to-curve-07#section-8.8.2
  const H_EFF = 0xbc69f08f2ee75b3584c6a0ea91b352888e2a8e9145ad7689986ff031508ffe1329c2f178731db956d82bf015d1212b02ec0ec69d7477c1ae954cbc06689f6a359894c0adebbf6b4e8020005aaa95551n;
  // it("PSI cofactor cleaning same as multiplication", () => {
  //   const points = [
  //     new PointG2(CURVE,
  //       new Fq2(CURVE, [0x19658bb3b27541a2cf4c24ffe2a329fff606add46e55dac0ccf6d03887fa5a4bfbe3f9dcb991cfa8a8cb00b1b08699c3n,
  //         0x0b2fd20060fc25842260db4c6e9c6f2c83f4ad14ac319fe513363b589f18eda5f02337cfe9b2b8b679d47e01be32275fn]),
  //       new Fq2(CURVE, [0x0276bdbbad87dcd9f78581c6e40ac42d8036115a617a283014acc0ec55137a5e6234862859bc61a6d55c1115493a940bn,
  //         0x15d90b5c373060751f0ff367f3b75770c3bf3dc8f6f4078325bc24a7b134e7a290442a6b612f913b5ac4a2c5dc6cddean]),
  //       new Fq2(CURVE, [0x0a0adb13f08a7a54039373efa3d100f9760aa0efc1d494f4e8d82915345f72444b43c021ab8d32b9393db70a6f75e6e1n,
  //         0x19fbb8b214bd1368a21fbe627574a25e0157459480bbd3a3e7febe5fec82b9ef1cdf49d4c2f12e68d44429403106aeden])),
  //     new PointG2(CURVE,
  //       new Fq2(CURVE, [0x166c0c0103a81e8cbf85d645d9fa05a1e656f3ca19e6b7f13013f35ab0e1abf4650234da919dcbd99196b6daf7850f2fn,
  //         0x1095a6c628b95126cac07d2b0fc01a373ed72f88a52086c9e1563573b151f73678dfb959eb3859e9c923b9ce048afdf9n]),
  //       new Fq2(CURVE, [0x0f7c5242ffdb2f2fd325e0cd9dd233d85d3f01c54b4f5d13f06429167356946689c2a0ac323c6f5ad46689b3ed35d272n,
  //         0x1258a942709e1174f931eab9661ad1994b479e965c7434d7eb27c725da7ab431a32eb8859d58abde2a7a0f2a83601b12n]),
  //       new Fq2(CURVE, [0x1728e5c5e2db31e982cef972c1b7376fab10f787a374ad66be59645b42878fac60ffc7b46097853e7f47757312374bb1n,
  //         0x09b021454f2266f5c4faad3224712b985be5e30a861d6b15978eecdf92c9da19f775c7caa33c4d6f8eb2c7aef031e54cn])),
  //     new PointG2(CURVE, new Fq2(CURVE, [0x1050085832985ac2c91552a31aa11977c7cfaf77c8b41b88a1c2b959cdd2d3d95954ba2428bb6fe4a568d036b9634a23n,
  //       0x0ed2e0dc90b9b40b3742ca07f022638422530dce532c3c4620fae0ceb4dc3d926515da7f38f1757ec6c04b33ad77645an]),
  //       new Fq2(CURVE, [0x15d5fb5f39a8ae95b96fddd198e4cda8211007391c7be57205d137bd58cc8a06b48cbec32b70c7053a00c96ffe091da9n,
  //         0x037a323cf0270c8e34200ead02e40f3a04096a9aa774415fe79049248bcb70ef2ccddf9d87db100ce52342e25030528fn]),
  //       new Fq2(CURVE, [0x12f017b2c2a30eeaf122036397b06f2e4ef82edd41fd735416dbd2be3b491c312af1639dffa9943e00c624dfbf6d347en,
  //         0x0714a7544bae337f8959b865f8e0c36104655157f6649fd798e54afeb3fb24a62464f2659c7b0d0999b55f71a49e2f9cn])),
  //     new PointG2(CURVE,
  //       new Fq2(CURVE, [0x14918659c1a50a20b4c3b07c242442b005070f68fab64c4b801f812c3378dbdb584053a428affb79bcf9190618488999n,
  //         0x0c2540ba1076ab00629d8c0d60a6bcf88b770d27343447b7868418f98c2f97cd9af7c5a5a4dae409a9ddeeb36308d2cen]),
  //       new Fq2(CURVE, [0x06010eb447078dcaabf8f537df2739c9011f716552ade5d7980258700872219610d3769e78a56a95f52afe3254a40acan,
  //         0x07889027cb2dea1e5ecbefcd0bdc55816a6abfaa8a280df42339c6cc3ff6436c9f1008fa00911006151d71ddfe9ead2cn]),
  //       new Fq2(CURVE, [0x1711ccc0d10cf739fb2aacb3f8dbef07e1698523ed8a927fe171d25606ff2241c77e2ed2dbf695c138714efb5afd53c1n,
  //         0x06ba4615f5c63cf56b12a267850d02402d0c8fd3294b70b77b93b4ccb7b6f4bf15df501d0cafd70b039167c306f834dfn])),
  //     new PointG2(CURVE,
  //       new Fq2(CURVE, [0x19658bb3b27541a2cf4c24ffe2a329fff606add46e55dac0ccf6d03887fa5a4bfbe3f9dcb991cfa8a8cb00b1b08699c3n,
  //         0x0b2fd20060fc25842260db4c6e9c6f2c83f4ad14ac319fe513363b589f18eda5f02337cfe9b2b8b679d47e01be32275fn]),
  //       new Fq2(CURVE, [0x0276bdbbad87dcd9f78581c6e40ac42d8036115a617a283014acc0ec55137a5e6234862859bc61a6d55c1115493a940bn,
  //         0x15d90b5c373060751f0ff367f3b75770c3bf3dc8f6f4078325bc24a7b134e7a290442a6b612f913b5ac4a2c5dc6cddean]),
  //       new Fq2(CURVE, [0x0a0adb13f08a7a54039373efa3d100f9760aa0efc1d494f4e8d82915345f72444b43c021ab8d32b9393db70a6f75e6e1n,
  //         0x19fbb8b214bd1368a21fbe627574a25e0157459480bbd3a3e7febe5fec82b9ef1cdf49d4c2f12e68d44429403106aeden])),
  //   ];
  //   for (let p of points) {
  //     expect(p.multiplyUnsafe(H_EFF).equals(clearCofactorG2(p))).true;
  //   }
  // });
});
