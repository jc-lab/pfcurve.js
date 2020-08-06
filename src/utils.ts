import {
  BigInteger, bigInt,
  BufferConstructor,
  Bytes,
  ICurve,
  PrivateKey
} from './types';
import Fq from './fq';
import PointG1 from './point-g1';

export function mod(a: BigInteger, b: BigInteger) {
  const res = a.mod(b);
  return res.isNegative() ? b.add(res) : res;
  // return a.mod(b);
}

export function powMod(a: BigInteger, power: BigInteger, m: BigInteger) {
  let res = bigInt.one;
  while (power.greater(bigInt.zero)) {
    if (power.isOdd()) { // n & 1
      res = mod(res.multiply(a), m);
    }
    power = power.shiftRight(bigInt.one);
    a = mod(a.square(), m);
  }
  return res;
  // return a.modPow(power, m);
}

export function powMul(a1: BigInteger, b1: BigInteger, p: BigInteger) {
  let a = a1.mod(p);
  let b = b1.mod(p);
  if (a.isNegative())
    a = a.add(p);
  if (b.isNegative())
    b = b.add(p);
  return a.multiply(b).mod(p);
  // return a1.multiply(b1).mod(p);
}

export function sqrtMod(a: BigInteger, p: BigInteger) {
  // if ((p % 4n) == 3n) {
  //   return powMod(a, (p + 1n) / 4n, p);
  // }
  //
  // if ((p % 8n) === 5n) {
  //   const b = (p - 5n) / 8n;
  //   let i = a * 2n;
  //   const v = powMod(i, b, p);
  //   i = powMul(i, v, p);
  //   i = powMul(i, v, p);
  //   i -= 1n;
  //   let r = powMul(a, v, p);
  //   r = powMul(r, i, p);
  //   return r;
  // }
  //
  // return 0n;
  if (p.mod(bigInt['4']).equals(bigInt['3'])) {
    return a.modPow(p.add(bigInt.one).divide(bigInt['4']), p);
  }

  if (p.mod(bigInt['8']).equals(bigInt['5'])) {
    const b = (p.subtract(bigInt['5'])).divide(bigInt['8']);
    let i = a.multiply(bigInt['2']);
    const v = powMod(i, b, p);
    i = powMul(i, v, p);
    i = powMul(i, v, p);
    i = i.subtract(bigInt.one);
    let r = powMul(a, v, p);
    r = powMul(r, i, p);
    return r;
  }

  return bigInt.zero;
}

// Amount of bits inside BigInteger
export function bitLen(n: BigInteger): number {
  let len: number;
  for (len = 0; n.greater(bigInt.zero); n = n.shiftRight(bigInt.one), len += 1);
  return len;
}

// Get single bit from BigInteger at pos
export function bitGet(n: BigInteger, pos: number): BigInteger {
  return (n.shiftRight(pos)).and(bigInt.one);
}


export function hexToNumberBE(hex: string): BigInteger {
  return bigInt(hex, 16);
}

export function hexToBytes(hex: string) {
  if (!hex.length) return new Uint8Array([]);
  hex = hex.length & 1 ? `0${hex}` : hex;
  const len = hex.length;
  const result = new Uint8Array(len / 2);
  for (let i = 0, j = 0; i < len - 1; i += 2, j++) {
    result[j] = parseInt(hex[i] + hex[i + 1], 16);
  }
  return result;
}

export function concatBytes<T extends Uint8Array>(bufferConstructor: BufferConstructor<T>, ...bytes: (T | string)[]): T {
  return bufferConstructor.from(
    bytes.reduce((res: number[], bytesView: Bytes) => {
      bytesView = bytesView instanceof Uint8Array ? bytesView : hexToBytes(bytesView);
      return [...res, ...bytesView];
    }, [])
  );
}

export function bytesToNumberBE(bytes: Bytes): BigInteger {
  if (typeof bytes === 'string') {
    return hexToNumberBE(bytes);
  }
  let value: BigInteger = bigInt.zero;
  for (let i = bytes.length - 1, j = 0; i >= 0; i--, j++) {
    value = value.add(bigInt(bytes[i]).and(0xff).shiftLeft(8 * j));
  }
  return value;
}

export function padStart<T extends Uint8Array>(bufferConstructor: BufferConstructor<T>, bytes: T, count: number, element: number): T {
  if (bytes.length >= count) {
    return bytes;
  }
  const diff = count - bytes.length;
  const elements = Array<number>(diff)
    .fill(element)
    .map((i: number) => i);
  return concatBytes(bufferConstructor, bufferConstructor.from(elements), bytes);
}

export function toBytesBE<TBUF extends Uint8Array>(bufferConstructor: BufferConstructor<TBUF>, num: BigInteger | number | string, padding: number = 0): TBUF {
  let hex = typeof num === 'string' ? num : num.toString(16);
  hex = hex.length & 1 ? `0${hex}` : hex;
  const len = hex.length / 2;
  const u8 = bufferConstructor.from(new Array<number>(len));
  for (let j = 0, i = 0; i < hex.length && i < len * 2; i += 2, j++) {
    u8[j] = parseInt(hex[i] + hex[i + 1], 16);
  }
  return padStart(bufferConstructor, u8, padding, 0);
}

export function toBigInt(num: string | Uint8Array | BigInteger | number): BigInteger {
  if (typeof num === 'string') return hexToNumberBE(num);
  if (typeof num === 'number') return bigInt(num);
  if (num instanceof Uint8Array) return bytesToNumberBE(num);
  return num;
}

export function normalizePrivKey(curve: Curve, privateKey: PrivateKey): Fq {
  return new Fq(curve, toBigInt(privateKey));
}

// P = pk x G
export function getPublicKey<TBUF extends Uint8Array>(curve: Curve, privateKey: PrivateKey, compress = true, bufferConstructor?: BufferConstructor<TBUF>): TBUF {
  const _bufferConstructor: BufferConstructor<TBUF> = bufferConstructor || Buffer as any;
  return PointG1.fromPrivateKey(curve, privateKey).toBytes(compress, _bufferConstructor);
}

import Curve from './curve';
