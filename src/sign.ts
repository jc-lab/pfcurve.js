//
// // S = pk x H(m)
// import {
//   normalizePrivKey
// } from './intl';
// import PointG2 from './point-g2';
// import {
//   PrivateKey
// } from './types';
//
// export async function sign(message: Buffer, privateKey: PrivateKey): Promise<Uint8Array> {
//   const msgPoint = await PointG2.hashToCurve(message);
//   const sigPoint = msgPoint.multiply(normalizePrivKey(privateKey));
//   return sigPoint.toSignature();
// }
//
// // e(P, H(m)) == e(G,S)
// export async function verify(signature: Bytes, message: Bytes, publicKey: Bytes): Promise<boolean> {
//   const P = PointG1.fromCompressedHex(publicKey).negate();
//   const Hm = await PointG2.hashToCurve(message);
//   const G = PointG1.BASE;
//   const S = PointG2.fromSignature(signature);
//   // Instead of doing 2 exponentiations, we use property of billinear maps
//   // and do one exp after multiplying 2 points.
//   const ePHm = pairing(P, Hm, false);
//   const eGS = pairing(G, S, false);
//   const exp = eGS.multiply(ePHm).finalExponentiate();
//   return exp.equals(Fq12.ONE);
// }
//
// export function aggregatePublicKeys(publicKeys: Bytes[]) {
//   if (!publicKeys.length) throw new Error('Expected non-empty array');
//   return publicKeys.reduce(
//     (sum, publicKey) => sum.add(PointG1.fromCompressedHex(publicKey)),
//     PointG1.ZERO
//   );
// }
//
// // e(G, S) = e(G, SUM(n)(Si)) = MUL(n)(e(G, Si))
// export function aggregateSignatures(signatures: Bytes[]) {
//   if (!signatures.length) throw new Error('Expected non-empty array');
//   const aggregatedSignature = signatures.reduce(
//     (sum, signature) => sum.add(PointG2.fromSignature(signature)),
//     PointG2.ZERO
//   );
//   return aggregatedSignature.toSignature();
// }
//
// export async function verifyBatch(messages: Bytes[], publicKeys: Bytes[], signature: Bytes) {
//   if (!messages.length) throw new Error('Expected non-empty messages array');
//   if (publicKeys.length !== messages.length) throw new Error('Pubkey count should equal msg count');
//   try {
//     let producer = Fq12.ONE;
//     for (const message of new Set(messages)) {
//       const groupPublicKey = messages.reduce(
//         (groupPublicKey, m, i) =>
//           m !== message
//             ? groupPublicKey
//             : groupPublicKey.add(PointG1.fromCompressedHex(publicKeys[i])),
//         PointG1.ZERO
//       );
//       const msg = await PointG2.hashToCurve(message);
//       // Possible to batch pairing for same msg with different groupPublicKey here
//       producer = producer.multiply(pairing(groupPublicKey, msg, false) as Fq12);
//     }
//     const sig = PointG2.fromSignature(signature);
//     producer = producer.multiply(pairing(PointG1.BASE.negate(), sig, false) as Fq12);
//     const finalExponent = producer.finalExponentiate();
//     return finalExponent.equals(Fq12.ONE);
//   } catch {
//     return false;
//   }
// }
