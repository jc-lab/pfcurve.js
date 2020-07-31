import {
  BufferConstructor,
  Bytes,
  ICurve,
  PrivateKey
} from './types';
import Fq from './fq';
import PointG1 from './point-g1';

export function mod(a: bigint, b: bigint) {
  const res = a % b;
  return res >= 0n ? res : b + res;
}

export function powMod(a: bigint, power: bigint, m: bigint) {
  let res = 1n;
  while (power > 0n) {
    if (power & 1n) {
      res = mod(res * a, m);
    }
    power >>= 1n;
    a = mod(a * a, m);
  }
  return res;
}

export function powMul(a1: bigint, b1: bigint, p: bigint) {
  let a = a1 % p;
  let b = b1 % p;
  if (a < 0)
    a += p;
  if (b < 0)
    b += p;
  return a * b % p;
}

export function sqrtMod(a: bigint, p: bigint) {
  if ((p % 4n) == 3n) {
    return powMod(a, (p + 1n) / 4n, p);
  }

  if ((p % 8n) === 5n) {
    const b = (p - 5n) / 8n;
    let i = a * 2n;
    const v = powMod(i, b, p);
    i = powMul(i, v, p);
    i = powMul(i, v, p);
    i -= 1n;
    let r = powMul(a, v, p);
    r = powMul(r, i, p);
    return r;
  }

  return 0n;
}

// Amount of bits inside bigint
export function bitLen(n: bigint): number {
  let len: number;
  for (len = 0; n > 0n; n >>= 1n, len += 1);
  return len;
}

// Get single bit from bigint at pos
export function bitGet(n: bigint, pos: number) {
  return (n >> BigInt(pos)) & 1n;
}


export function hexToNumberBE(hex: string) {
  return BigInt(`0x${hex}`);
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

export function bytesToNumberBE(bytes: Bytes): bigint {
  if (typeof bytes === 'string') {
    return hexToNumberBE(bytes);
  }
  let value = 0n;
  for (let i = bytes.length - 1, j = 0; i >= 0; i--, j++) {
    value += (BigInt(bytes[i]) & 255n) << (8n * BigInt(j));
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

export function toBytesBE<TBUF extends Uint8Array>(bufferConstructor: BufferConstructor<TBUF>, num: bigint | number | string, padding: number = 0): TBUF {
  let hex = typeof num === 'string' ? num : num.toString(16);
  hex = hex.length & 1 ? `0${hex}` : hex;
  const len = hex.length / 2;
  const u8 = bufferConstructor.from(new Array<number>(len));
  for (let j = 0, i = 0; i < hex.length && i < len * 2; i += 2, j++) {
    u8[j] = parseInt(hex[i] + hex[i + 1], 16);
  }
  return padStart(bufferConstructor, u8, padding, 0);
}

export function toBigInt(num: string | Uint8Array | bigint | number) {
  if (typeof num === 'string') return hexToNumberBE(num);
  if (typeof num === 'number') return BigInt(num);
  if (num instanceof Uint8Array) return bytesToNumberBE(num);
  return num;
}

export function normalizePrivKey(curve: ICurve, privateKey: PrivateKey): Fq {
  return new Fq(curve, toBigInt(privateKey));
}

// P = pk x G
export function getPublicKey<TBUF extends Uint8Array>(curve: ICurve, privateKey: PrivateKey, compress = true, bufferConstructor?: BufferConstructor<TBUF>): TBUF {
  const _bufferConstructor: BufferConstructor<TBUF> = bufferConstructor || Buffer as any;
  return PointG1.fromPrivateKey(curve, privateKey).toBytes(compress, _bufferConstructor);
}
