// Danger zone.

const algo = {
    name: 'RSA-OAEP'
};

const format = 'jwk';

// const options = {
//     alg: 'RSA-OAEP-256',
//     e: 'AQAB',
//     ext: true,
//     key_ops: ['encrypt'],
//     kty: 'RSA',
//     // n: { filled in by code }
// };
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

    async encrypt(publicKeyText: string, plainText: string) {
        const options = {
            alg: 'RSA-OAEP-256',
            e: 'AQAB',
            ext: true, // may not need this
            key_ops: ['encrypt'], // may not need this
            kty: 'RSA',
            n: publicKeyText,
        };
    
        const publicKey = await crypto.subtle.importKey(
            'jwk', options, algo, true, ['encrypt']);
    
        // Based on: 
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#rsa-oaep_2
    
        const data = new TextEncoder().encode(plainText);
        
        return crypto.subtle.encrypt(algo, publicKey, data); // TODO: Encode this for transport.
    }
}

// export class SenderSecurityContext {
//     #publicKey: CryptoKey | null;

//     constructor(publicKeyText) {
//         crypto.subtle.importKey()
//     }
// }

// async encrypt(plainText: string) {
//     this.#checkState();

//     // Guided by:
//     // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#rsa-oaep_2

//     const data = new TextEncoder().encode(plainText);
    
//     return crypto.subtle.encrypt(algo, this.#keyPair!.publicKey!, data);
// }