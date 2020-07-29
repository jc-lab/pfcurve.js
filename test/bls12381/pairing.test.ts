import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import { PointG1, PointG2, Fq12, pairing } from '../../src';

const CURVE = lib.curves['bls12-381'];

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
    // https://github.com/kilic/bls12-381/blob/master/pairing_test.go
    // https://github.com/adjoint-io/pairing/blob/master/src/Data/Pairing/BLS12381.hs
    const gte = Fq12.fromTuple(CURVE,
      [
        0x1250ebd871fc0a92a7b2d83168d0d727272d441befa15c503dd8e90ce98db3e7b6d194f60839c508a84305aaca1789b6n,
        0x89a1c5b46e5110b86750ec6a532348868a84045483c92b7af5af689452eafabf1a8943e50439f1d59882a98eaa0170fn,
        0x11b8b424cd48bf38fcef68083b0b0ec5c81a93b330ee1a677d0d15ff7b984e8978ef48881e32fac91b93b47333e2ba57n,
        0x3350f55a7aefcd3c31b4fcb6ce5771cc6a0e9786ab5973320c806ad360829107ba810c5a09ffdd9be2291a0c25a99a2n,
        0x19f26337d205fb469cd6bd15c3d5a04dc88784fbb3d0b2dbdea54d43b2b73f2cbb12d58386a8703e0f948226e47ee89dn,
        0x6fba23eb7c5af0d9f80940ca771b6ffd5857baaf222eb95a7d2809d61bfe02e1bfd1b68ff02f0b8102ae1c2d5d5ab1an,
        0x1b2f522473d171391125ba84dc4007cfbf2f8da752f7c74185203fcca589ac719c34dffbbaad8431dad1c1fb597aaa5n,
        0x18107154f25a764bd3c79937a45b84546da634b8f6be14a8061e55cceba478b23f7dacaa35c8ca78beae9624045b4b6n,
        0x1368bb445c7c2d209703f239689ce34c0378a68e72a6b3b216da0e22a5031b54ddff57309396b38c881c4c849ec23e87n,
        0x193502b86edb8857c273fa075a50512937e0794e1e65a7617c90d8bd66065b1fffe51d7a579973b1315021ec3c19934fn,
        0x4c581234d086a9902249b64728ffd21a189e87935a954051c7cdba7b3872629a4fafc05066245cb9108f0242d0fe3efn,
        0xf41e58663bf08cf068672cbd01a7ec73baca4d72ca93544deff686bfd6df543d48eaa24afe47e1efde449383b676631n
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
