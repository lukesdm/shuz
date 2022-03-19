/**
 * Max message size in bytes. This is currently limited by the encryption implementation.
 */
export const MAX_MESSAGE_SIZE = 190;

export function getLengthBytes(text: string): number  {
    // COULDDO: Use a more efficient method.
    return new TextEncoder().encode(text).length;
}
