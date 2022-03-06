import { v4 as uuidv4 } from 'uuid';

export function makeReceiverId() {
    const receiver_id = uuidv4();
    return receiver_id;
}