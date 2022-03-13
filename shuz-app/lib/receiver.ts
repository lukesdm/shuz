// Danger zone.

const ALGO_TYPE = 'RSA-OAEP';
const ALGO_MODULUS_LENGTH = 4096; // TODO: Try with 2048 as QR is hard to capture.
const ALGO_PUBLIC_EXPONENT = new Uint8Array([1, 0 ,1]);
const ALGO_HASH = 'SHA-256';
const ALGO_KEY_FORMAT = 'jwk';
const ALGO_JWK_NAME = 'RSA-OAEP-256';
const ALGO_JWK_E = 'AQAB';
const ALGO_JWK_KTY = 'RSA';

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
     * @param ciphertext Encrypted string encoded as base64
     */
    async decrypt(ciphertext: string): Promise<string> {
        this.#checkState();

        console.log(`0. Attempting to decrypt ${ciphertext}`);
        
        const data = new TextEncoder().encode(ciphertext);

        console.log(`1. In array ready for decryption.`);

        const decrypted: ArrayBuffer = await crypto.subtle.decrypt({ name: ALGO_TYPE }, this.#keyPair!.privateKey!, data);

        console.log('2. Decrypted.'); 
        
        return new TextDecoder().decode(decrypted); // TODO: Check - do we need to specify UTF-8 here for cross-device compatibility?
    }
}

export class SenderSecurityContext {
    constructor() {
        if (typeof window === 'undefined') {
            throw new Error("This should not be run outside a browser.");
        }
    }

    /**
     * Encrypts the given text, with the provided public key (base64, 'n' param of an RSA-OAEP-256 JWK), into base64-encoded ciphertext.
     */
    async encrypt(publicKeyText: string, plainText: string): Promise<string> {

        const options = {
            alg: ALGO_JWK_NAME,
            e: ALGO_JWK_E,
            kty: ALGO_JWK_KTY,
            n: publicKeyText,
        };
    
        const publicKey = await crypto.subtle.importKey(ALGO_KEY_FORMAT, options, { name: ALGO_TYPE, hash: ALGO_HASH } , true, ['encrypt']);
    
        // Based on: 
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#rsa-oaep_2
    
        const data = new TextEncoder().encode(plainText);

        // Encrypt. type info of result seems to be missing, runtime says it's ArrayBuffer.
        const result: ArrayBuffer = await crypto.subtle.encrypt({ name: ALGO_TYPE }, publicKey, data);

        // This is client-side, so ignore node type error (COULDDO: Move into browser-only TS proj)
        // @ts-ignore
        const resultBase64 = btoa(result);

        return resultBase64;
    }
}
