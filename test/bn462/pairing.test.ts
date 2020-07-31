import * as fc from 'fast-check';
import * as chai from 'chai';
const expect = chai.expect;

import * as lib from '../../src';
import { PointG1, PointG2, Fq12, pairing } from '../../src';

const CURVE = lib.findCurve('Fp462BN') as lib.ICurve;

const G1 = PointG1.BASE(CURVE);
const G2 = PointG2.BASE(CURVE);
const CURVE_ORDER = CURVE.r;

const optimalAtePairingTestVector = Fq12.fromTuple(CURVE, [
  0x0cf7f0f2e01610804272f4a7a24014ac085543d787c8f8bf07059f93f87ba7e2a4ac77835d4ff10e78669be39cd23cc3a659c093dbe3b9647e8cn,
  0x00ef2c737515694ee5b85051e39970f24e27ca278847c7cfa709b0df408b830b3763b1b001f1194445b62d6c093fb6f77e43e369edefb1200389n,
  0x04d685b29fd2b8faedacd36873f24a06158742bb2328740f93827934592d6f1723e0772bb9ccd3025f88dc457fc4f77dfef76104ff43cd430bf7n,
  0x090067ef2892de0c48ee49cbe4ff1f835286c700c8d191574cb424019de11142b3c722cc5083a71912411c4a1f61c00d1e8f14f545348eb7462cn,
  0x1437603b60dce235a090c43f5147d9c03bd63081c8bb1ffa7d8a2c31d673230860bb3dfe4ca85581f7459204ef755f63cba1fbd6a4436f10ba0en,
  0x13191b1110d13650bf8e76b356fe776eb9d7a03fe33f82e3fe5732071f305d201843238cc96fd0e892bc61701e1844faa8e33446f87c6e29e75fn,
  0x07b1ce375c0191c786bb184cc9c08a6ae5a569dd7586f75d6d2de2b2f075787ee5082d44ca4b8009b3285ecae5fa521e23be76e6a08f17fa5cc8n,
  0x05b64add5e49574b124a02d85f508c8d2d37993ae4c370a9cda89a100cdb5e1d441b57768dbc68429ffae243c0c57fe5ab0a3ee4c6f2d9d34714n,
  0x0fd9a3271854a2b4542b42c55916e1faf7a8b87a7d10907179ac7073f6a1de044906ffaf4760d11c8f92df3e50251e39ce92c700a12e77d0adf3n,
  0x17fa0c7fa60c9a6d4d8bb9897991efd087899edc776f33743db921a689720c82257ee3c788e8160c112f18e841a3dd9a79a6f8782f771d542ee5n,
  0x0c901397a62bb185a8f9cf336e28cfb0f354e2313f99c538cdceedf8b8aa22c23b896201170fc915690f79f6ba75581f1b76055cd89b7182041cn,
  0x20f27fde93cee94ca4bf9ded1b1378c1b0d80439eeb1d0c8daef30db0037104a5e32a2ccc94fa1860a95e39a93ba51187b45f4c2c50c16482322n
]);

describe('bn462 pairing', () => {
  it('GT test vector', () => {
    // https://github.com/adjoint-io/pairing/blob/master/src/Data/Pairing/BN462.hs
    const gte = Fq12.fromTuple(CURVE,
      [
        0xcf7f0f2e01610804272f4a7a24014ac085543d787c8f8bf07059f93f87ba7e2a4ac77835d4ff10e78669be39cd23cc3a659c093dbe3b9647e8cn,
        0xef2c737515694ee5b85051e39970f24e27ca278847c7cfa709b0df408b830b3763b1b001f1194445b62d6c093fb6f77e43e369edefb1200389n,
        0xfd9a3271854a2b4542b42c55916e1faf7a8b87a7d10907179ac7073f6a1de044906ffaf4760d11c8f92df3e50251e39ce92c700a12e77d0adf3n,
        0x17fa0c7fa60c9a6d4d8bb9897991efd087899edc776f33743db921a689720c82257ee3c788e8160c112f18e841a3dd9a79a6f8782f771d542ee5n,
        0x7b1ce375c0191c786bb184cc9c08a6ae5a569dd7586f75d6d2de2b2f075787ee5082d44ca4b8009b3285ecae5fa521e23be76e6a08f17fa5cc8n,
        0x5b64add5e49574b124a02d85f508c8d2d37993ae4c370a9cda89a100cdb5e1d441b57768dbc68429ffae243c0c57fe5ab0a3ee4c6f2d9d34714n,
        0x1437603b60dce235a090c43f5147d9c03bd63081c8bb1ffa7d8a2c31d673230860bb3dfe4ca85581f7459204ef755f63cba1fbd6a4436f10ba0en,
        0x13191b1110d13650bf8e76b356fe776eb9d7a03fe33f82e3fe5732071f305d201843238cc96fd0e892bc61701e1844faa8e33446f87c6e29e75fn,
        0x4d685b29fd2b8faedacd36873f24a06158742bb2328740f93827934592d6f1723e0772bb9ccd3025f88dc457fc4f77dfef76104ff43cd430bf7n,
        0x90067ef2892de0c48ee49cbe4ff1f835286c700c8d191574cb424019de11142b3c722cc5083a71912411c4a1f61c00d1e8f14f545348eb7462cn,
        0xc901397a62bb185a8f9cf336e28cfb0f354e2313f99c538cdceedf8b8aa22c23b896201170fc915690f79f6ba75581f1b76055cd89b7182041cn,
        0x20f27fde93cee94ca4bf9ded1b1378c1b0d80439eeb1d0c8daef30db0037104a5e32a2ccc94fa1860a95e39a93ba51187b45f4c2c50c16482322n
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
