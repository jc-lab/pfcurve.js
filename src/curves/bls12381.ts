import {
  CurveType, ICurve, PairingFriendly, SexticTwist, SignOfX,
  bigInt
} from '../types';

export const CURVE: ICurve = {
  name: 'Fp381BLS12',

  curveType: CurveType.WEIERSTRASS,
  sexticTwist: SexticTwist.M_TYPE,
  signOfX: SignOfX.NEGATIVEX,
  pairingFriendly: PairingFriendly.BLS,

  QNRI: 0,
  EFS: 48,

  // u: -bigInt('d201000000010000', 16),
  // k: 12,

  // a characteristic
  P: bigInt('1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab', 16),
  // an order
  r: bigInt('73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001', 16),
  // a cofactor
  h: bigInt('396c8c005555e1568c00aaab0000aaab', 16),
  Gx: bigInt('17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb', 16),
  Gy: bigInt('08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1', 16),
  A: bigInt('0'),
  B: bigInt('4'),
  B2: [bigInt('4'), bigInt('4')],
  // B2: [4n, 0n],

  G2x: [
    bigInt('024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb8', 16),
    bigInt('13e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e', 16),
  ],
  G2y: [
    bigInt('0ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801', 16),
    bigInt('0606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79be', 16),
  ],
  x: bigInt('d201000000010000', 16),

  nonresidues: {
    fp: [bigInt('-1')],
    fp2: [bigInt('1'), bigInt('1')]
  }
};

export default CURVE;
