import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import { PointG1, PointG2, Fq12, pairing } from '../../src';

const CURVE = lib.findCurve('Fp381BLS12') as lib.Curve;

const G1 = PointG1.BASE(CURVE);
const G2 = PointG2.BASE(CURVE);
const CURVE_ORDER = CURVE.r;

const optimalAtePairingTestVector = Fq12.fromTuple(CURVE, [
  0x11619b45f61edfe3b47a15fac19442526ff489dcda25e59121d9931438907dfd448299a87dde3a649bdba96e84d54558n,
  0x153ce14a76a53e205ba8f275ef1137c56a566f638b52d34ba3bf3bf22f277d70f76316218c0dfd583a394b8448d2be7fn,
  0x095668fb4a02fe930ed44767834c915b283b1c6ca98c047bd4c272e9ac3f3ba6ff0b05a93e59c71fba77bce995f04692n,
  0x16deedaa683124fe7260085184d88f7d036b86f53bb5b7f1fc5e248814782065413e7d958d17960109ea006b2afdeb5fn,
  0x09c92cf02f3cd3d2f9d34bc44eee0dd50314ed44ca5d30ce6a9ec0539be7a86b121edc61839ccc908c4bdde256cd6048n,
  0x111061f398efc2a97ff825b04d21089e24fd8b93a47e41e60eae7e9b2a38d54fa4dedced0811c34ce528781ab9e929c7n,
  0x01ecfcf31c86257ab00b4709c33f1c9c4e007659dd5ffc4a735192167ce197058cfb4c94225e7f1b6c26ad9ba68f63bcn,
  0x08890726743a1f94a8193a166800b7787744a8ad8e2f9365db76863e894b7a11d83f90d873567e9d645ccf725b32d26fn,
  0x0e61c752414ca5dfd258e9606bac08daec29b3e2c57062669556954fb227d3f1260eedf25446a086b0844bcd43646c10n,
  0x0fe63f185f56dd29150fc498bbeea78969e7e783043620db33f75a05a0a2ce5c442beaff9da195ff15164c00ab66bdden,
  0x10900338a92ed0b47af211636f7cfdec717b7ee43900eee9b5fc24f0000c5874d4801372db478987691c566a8c474978n,
  0x1454814f3085f0e6602247671bc408bbce2007201536818c901dbd4d2095dd86c1ec8b888e59611f60a301af7776be3dn
]);

describe('bls12-381 pairing', () => {
  it('GT test vector', () => {
    // https://github.com/paulmillr/noble-bls12-381/blob/master/test/pairing.test.ts
    // https://github.com/herumi/mcl/blob/master/test/bls12_test.cpp
    const gte = Fq12.fromTuple(CURVE,
      [
        0x1250EBD871FC0A92A7B2D83168D0D727272D441BEFA15C503DD8E90CE98DB3E7B6D194F60839C508A84305AACA1789B6n,
        0x089A1C5B46E5110B86750EC6A532348868A84045483C92B7AF5AF689452EAFABF1A8943E50439F1D59882A98EAA0170Fn,
        0x1368BB445C7C2D209703F239689CE34C0378A68E72A6B3B216DA0E22A5031B54DDFF57309396B38C881C4C849EC23E87n,
        0x193502B86EDB8857C273FA075A50512937E0794E1E65A7617C90D8BD66065B1FFFE51D7A579973B1315021EC3C19934Fn,
        0x01B2F522473D171391125BA84DC4007CFBF2F8DA752F7C74185203FCCA589AC719C34DFFBBAAD8431DAD1C1FB597AAA5n,
        0x018107154F25A764BD3C79937A45B84546DA634B8F6BE14A8061E55CCEBA478B23F7DACAA35C8CA78BEAE9624045B4B6n,
        0x19F26337D205FB469CD6BD15C3D5A04DC88784FBB3D0B2DBDEA54D43B2B73F2CBB12D58386A8703E0F948226E47EE89Dn,
        0x06FBA23EB7C5AF0D9F80940CA771B6FFD5857BAAF222EB95A7D2809D61BFE02E1BFD1B68FF02F0B8102AE1C2D5D5AB1An,
        0x11B8B424CD48BF38FCEF68083B0B0EC5C81A93B330EE1A677D0D15FF7B984E8978EF48881E32FAC91B93B47333E2BA57n,
        0x03350F55A7AEFCD3C31B4FCB6CE5771CC6A0E9786AB5973320C806AD360829107BA810C5A09FFDD9BE2291A0C25A99A2n,
        0x04C581234D086A9902249B64728FFD21A189E87935A954051C7CDBA7B3872629A4FAFC05066245CB9108F0242D0FE3EFn,
        0x0F41E58663BF08CF068672CBD01A7EC73BACA4D72CA93544DEFF686BFD6DF543D48EAA24AFE47E1EFDE449383B676631n
      ]);
    const gtc = pairing(G1, G2);
    expect(gtc).eql(gte);
  });
  it('should create negative G1 pairing', () => {
    const p1 = pairing(G1, G2);
    const p2 = pairing(G1.negate(), G2);
    expect(p1.multiply(p2)).eql(Fq12.ONE(CURVE));
  });
  it('should create negative G2 pairing', () => {
    const p2 = pairing(G1.negate(), G2);
    const p3 = pairing(G1, G2.negate());
    expect(p2).eql(p3);
  });
  it('should create proper pairing output order', () => {
    const p1 = pairing(G1, G2);
    const p2 = p1.pow(CURVE_ORDER);
    expect(p2).eql(Fq12.ONE(CURVE));
  });
  it('should create right pairing with bilinearity on G1', () => {
    const p1 = pairing(G1, G2);
    const p2 = pairing(G1.multiply(2n), G2);
    expect(p1.multiply(p1)).eql(p2);
  });
  it('pairing should not degenerate', () => {
    const p1 = pairing(G1, G2);
    const p2 = pairing(G1.multiply(2n), G2);
    const p3 = pairing(G1, G2.negate());
    expect(p1).not.eql(p2);
    expect(p1).not.eql(p3);
    expect(p2).not.eql(p3);
  });
  it('should create right pairing with bilinearity on G2', () => {
    const p1 = pairing(G1, G2);
    const p2 = pairing(G1, G2.multiply(2n));
    expect(p1.multiply(p1)).eql(p2);
  });
  it('should create right pairing composite check', () => {
    const p1 = pairing(G1.multiply(37n), G2.multiply(27n));
    const p2 = pairing(G1.multiply(999n), G2);
    expect(p1).eql(p2);
  });
});
