// Danger zone.
//
// In-browser encryption code. An attempt at a simple wrapper around Crypto.subtle, allowing for regular strings in, regular strings out.
// Simplicity over performance is preferred here. Some things may need to be revisited if the content size grows large.
//
// There's a relatively small limit of how much can be encrypted in a call to subtle.encrypt, so a chunking method has been implemented.  
// Something like this is passed to `encrypt`:
// [ nonce, plaintext_chunk, padding ]

const ALGO_TYPE = 'RSA-OAEP';
const ALGO_MODULUS_LENGTH = 2048;
const ALGO_PUBLIC_EXPONENT = new Uint8Array([1, 0 ,1]);
const ALGO_HASH = 'SHA-256';
const ALGO_KEY_FORMAT = 'jwk';
const ALGO_JWK_NAME = 'RSA-OAEP-256';
const ALGO_JWK_E = 'AQAB';
const ALGO_JWK_KTY = 'RSA';
const MAX_PLAINTEXT_SIZE_BYTES = 190; // Hard limit of what subtle.encrypt allows for the chosen algorithm
const NONCE_SIZE_BYTES = 16;
const CIPHER_CHUNK_SIZE_BYTES = 256; // Length of an encrypted chunk. COULDDO: Pre-allocate more arrays based on this.

/**
 * An error encrypting content. Usually caused by a malformed public key, or too large a payload.
 */
 export class EncryptError extends Error {
    constructor() {
        super();
        this.name = 'EncryptError';
    }
}

function flatten(arrays: Uint8Array[]): Uint8Array {
    const totalSize = arrays.map(arr => arr.length).reduce( (acc, val) => acc + val);
    const output = new Uint8Array(totalSize);

    let b = 0;
    for (const arr of arrays) {
        for (let i = 0; i < arr.length; i++) {
            output[b] = arr[i];
            b++;
        }
    }

    return output;
}

export class ReceiverSecurityContext {
    #keyPair: CryptoKeyPair | null = null;
    receiverId: string = '';

    constructor() {
        if (typeof window === 'undefined') {
            throw new Error("This should not be run outside a browser.");
        }
    }

    async init() {
        this.#keyPair = await this.#generateKeyPair();
        this.receiverId = await this.#makeReceiverId();
    }

    #checkState() {
        // As constructor cannot be async, we have to generate key pair in a separate function. Call this before using the key pair. 
        const ok = this.#keyPair && this.#keyPair.privateKey && this.#keyPair.publicKey;
        if (!ok) {
            throw new Error('Key pair is invalid. This is probably due to a platform issue.');
        }
    }

    async #generateKeyPair () {
        // RSA keypair generation. Source:
        //   https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#rsa_key_pair_generation
        const keyPair = crypto.subtle.generateKey({
            name: ALGO_TYPE,
            modulusLength: ALGO_MODULUS_LENGTH,
            publicExponent: ALGO_PUBLIC_EXPONENT,
            hash: ALGO_HASH
        }, true, ['encrypt', 'decrypt']);

        return keyPair;
    }

    async #makeReceiverId() {
        this.#checkState();
        // 'RAW' export doesn't work with RSA, so just use JWK for now. 
        // This looks something like:
        // {"alg":"RSA-OAEP-256","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"0mEdRu...ghuRRlt0"}
        // Assuming we only support this algo, we can treat 'n' as the differentiator. 
        const rsaJwk = await crypto.subtle.exportKey(ALGO_KEY_FORMAT, this.#keyPair!.publicKey!);

        if (!rsaJwk.n) {
            // Most likely cause is the platform not supporting this.
            throw new Error('Key format invalid.'); 
        }

        return rsaJwk.n;
    }

    /**
     * Decrypt text string.
     * @param ciphertextBase64 Encrypted string encoded as base64
     */
    async decrypt(ciphertextBase64: string): Promise<string> {
        this.#checkState();
        
        // Source: https://stackoverflow.com/a/41106346/1492741
        const data = Uint8Array.from(window.atob(ciphertextBase64), c => c.charCodeAt(0));

        const nChunks = data.length / CIPHER_CHUNK_SIZE_BYTES;

        const decryptedChunks: Uint8Array[] = [];

        for (let iChunk = 0; iChunk < nChunks; iChunk++) {
            const chunk = data.subarray(iChunk * CIPHER_CHUNK_SIZE_BYTES, (iChunk + 1) * CIPHER_CHUNK_SIZE_BYTES);
            console.log(chunk);

            const decryptedChunk: ArrayBuffer = await crypto.subtle.decrypt({ name: ALGO_TYPE }, this.#keyPair!.privateKey!, chunk);

            decryptedChunks.push(new Uint8Array(decryptedChunk.slice(NONCE_SIZE_BYTES)));
        }
        
        return new TextDecoder().decode(
            flatten(decryptedChunks)
            .filter(c => c > 0) // remove padding (assumes no 0s elsewhere, which should be fine for strings.)
        );
    }
}

export class SenderSecurityContext {
    constructor() {
        if (typeof window === 'undefined') {
            throw new Error("This should not be run outside a browser.");
        }
    }

    /**
     * Encrypts the given text, with the provided public key, into base64-encoded ciphertext.
     * @param publicKeyText The public key text (the 'n' param of an RSA-OAEP-256 JWK) - base64 URL encoded.
     * @param plainText The text to be encrypted. *The maximum length is 190 bytes*.
     * @returns Base64 encoded cipher text.
     * @throws {EncryptError} when content can't be encrypted, usually because of a malformed public key OR plainText
     */
    
    async encrypt(publicKeyText: string, plainText: string): Promise<string> {
        const options = {
            alg: ALGO_JWK_NAME,
            e: ALGO_JWK_E,
            kty: ALGO_JWK_KTY,
            n: publicKeyText,
        };

        try {
            const publicKey = await crypto.subtle.importKey(ALGO_KEY_FORMAT, options, { name: ALGO_TYPE, hash: ALGO_HASH } , true, ['encrypt']);
        
            // References: 
            // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#rsa-oaep_2
            // https://www.youtube.com/watch?v=SdePc87Ffik (Vue.js, End to end File Encryption in the Web Browser, February 2020)
        
            const plainTextBytes = new TextEncoder().encode(plainText);

            const chunkSize = MAX_PLAINTEXT_SIZE_BYTES - NONCE_SIZE_BYTES;
            const nChunks = Math.max(1, Math.ceil(plainTextBytes.length / (chunkSize)));

            const cipherChunks: Uint8Array[] = [];

            for (let iChunk = 0; iChunk < nChunks; iChunk++) {
                // Initialize padded input array, putting a nonce at the start.
                const plainChunkBytes = new Uint8Array(MAX_PLAINTEXT_SIZE_BYTES);
                crypto.getRandomValues(plainChunkBytes.subarray(0, NONCE_SIZE_BYTES - 1));

                // Copy plaintext chunk into input array
                const start = iChunk * chunkSize;
                const end = (iChunk + 1) * chunkSize;
                const plainTextChunk = plainTextBytes.subarray(start, end);
                for (let i = 0; i < plainTextChunk.length; i++) {
                    const offset = i + iChunk * chunkSize;
                    plainChunkBytes[i + NONCE_SIZE_BYTES] = plainTextBytes[offset];
                }

                const cipherChunk = await crypto.subtle.encrypt({ name: ALGO_TYPE }, publicKey, plainChunkBytes);

                cipherChunks.push(new Uint8Array(cipherChunk));
            }
            
            // Based on: https://stackoverflow.com/a/11562550/1492741
            const result = window.btoa(String.fromCharCode(...flatten(cipherChunks)));

            return result;
        } catch (err) {
            if (err instanceof DOMException) {
                throw new EncryptError();
            } else {
                throw err;
            }
        }
    }
}
