const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length; // 62

/**
 * Encodes a non-negative integer into a Base62 string representation.
 * @param num - The positive integer to encode
 * @returns Base62 encoded string
 */
export function encode(num: number): string {
  if (!Number.isInteger(num)) {
    throw new Error('Encoding value must be a valid integer.');
  }

  if (num < 0) {
    throw new Error('Encoding value must be a non-negative integer.');
  }

  if (num === 0) {
    return ALPHABET[0];
  }

  let result = '';
  let temp = num;

  while (temp > 0) {
    result = ALPHABET[temp % BASE] + result;
    temp = Math.floor(temp / BASE);
  }

  return result;
}

/**
 * Decodes a Base62 string back into its original integer value.
 * @param str - The Base62 string to decode
 * @returns Original integer
 */
export function decode(str: string): number {
  if (typeof str !== 'string' || str.length === 0) {
    throw new Error('Decoding value must be a non-empty string.');
  }

  let num = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = ALPHABET.indexOf(char);

    if (index === -1) {
      throw new Error(`Invalid Base62 character found: "${char}"`);
    }

    num = num * BASE + index;
  }

  return num;
}
