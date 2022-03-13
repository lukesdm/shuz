// Danger zone.

export async function makeReceiverId() {
    if (typeof window === 'undefined') {
        throw new Error("This should not be run outside a browser.");
    }

    const pubKey = await makePublicKey();
    
    return JSON.stringify(pubKey);
}

async function exportPublicKey(keyPair: CryptoKeyPair) {
    // 'RAW' export doesn't work with RSA, so just use JWK for now. 
    return crypto.subtle.exportKey('jwk', keyPair.publicKey!);
}

async function makePublicKey() {
    return exportPublicKey(await generateKeyPair());
}

// TODO: Try with 2048 if QR is too fine-grained.
async function generateKeyPair () {
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