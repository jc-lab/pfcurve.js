import {
  CurveType, ICurve, PairingFriendly, SexticTwist, SignOfX
} from '../types';

export const CURVE: ICurve = {
  name: 'Fp381BLS12',

  curveType: CurveType.WEIERSTRASS,
  sexticTwist: SexticTwist.M_TYPE,
  signOfX: SignOfX.NEGATIVEX,
  pairingFriendly: PairingFriendly.BLS,

  QNRI: 0,
  EFS: 48,

  /*
  *
  *
v = 1868033
#v = 0b111001000000100000001
u = pow(v, 3)

#p = 36*pow(u,4) + 36*pow(u,3) + 24*pow(u,2) + 6*u + 1
#order = 36*pow(u,4) + 36*pow(u,3) + 18*pow(u,2) + 6*u + 1

p = (((u + 1)*6*u + 4)*u + 1)*6*u + 1
order = p - 6*u*u
*
*
* There is another BLS12 curve stating 128 bits of security, BLS12-381 [32]. It is defined by a parameter
* u = -0xd201000000010000. Defined by u, the elliptic curve E and its twisted curve E' are represented by E: y^2 = x^3 + 4 and E': y^2 = x^3 + 4(i + 1), respectively.
*
* */

  // u: -0xd201000000010000n,
  // k: 12,

  // a characteristic
  P: 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn,
  // an order
  r: 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n,
  // a cofactor
  h: 0x396c8c005555e1568c00aaab0000aaabn,
  Gx: 0x17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bbn,
  Gy: 0x08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1n,
  A: 0n,
  B: 4n,
  B2: [4n, 4n],
  // B2: [4n, 0n],

  G2x: [
    0x024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb8n,
    0x13e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7en,
  ],
  G2y: [
    0x0ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801n,
    0x0606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79ben,
  ],
  x: 0xd201000000010000n,

  nonresidues: {
    fp: [-1n],
    fp2: [1n, 1n]
  }
};

export default CURVE;
