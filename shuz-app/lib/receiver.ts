import { randomBytes } from 'crypto';

export function makeReceiverId() {
    const buf = randomBytes(18);
    return buf.toString('base64');
}