// Danger zone.

const algo = {
    name: 'RSA-OAEP',
};

const format = 'jwk';

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

    // TODO: Try with 2048 if QR is too fine-grained.
    async #generateKeyPair () {
        // RSA keypair generation. Source:
        //   https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#rsa_key_pair_generation
        const keyPair = crypto.subtle.generateKey({
            name: 'RSA-OAEP',
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0 ,1]),
            hash: 'SHA-256'
        }, true, ['encrypt', 'decrypt']);

        return keyPair;
    }

    async #makeReceiverId() {
        this.#checkState();
        // 'RAW' export doesn't work with RSA, so just use JWK for now. 
        // This looks something like:
        // {"alg":"RSA-OAEP-256","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"0mEdRu...ghuRRlt0"}
        // Assuming we only support this algo, we can treat 'n' as the differentiator. 
        const rsaJwk = await crypto.subtle.exportKey(format, this.#keyPair!.publicKey!);

        if (!rsaJwk.n) {
            // Most likely cause is the platform not supporting this.
            throw new Error('Key format invalid.'); 
        }

        return rsaJwk.n;
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
            alg: 'RSA-OAEP-256',
            e: 'AQAB',
            kty: 'RSA',
            n: publicKeyText,
        };
    
        const publicKey = await crypto.subtle.importKey('jwk', options, { name: 'RSA-OAEP', hash: 'SHA-256' } , true, ['encrypt']);
    
        // Based on: 
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#rsa-oaep_2
    
        const data = new TextEncoder().encode(plainText);

        // Encrypt. type info of result seems to be missing, runtime says it's ArrayBuffer.
        const result: ArrayBuffer = await crypto.subtle.encrypt(algo, publicKey, data);

        // This is client-side, so ignore node type error (COULDDO: Move into browser-only TS proj)
        // @ts-ignore
        const resultBase64 = btoa(result);

        return resultBase64;
    }
}
