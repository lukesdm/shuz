import { createClient } from "redis";

// GUID-type string
type ReceiverId = string;

export type Message = {
    // Name of the sender
    sender: string;
    
    // Receiver GUID
    receiverId: ReceiverId;
    
    // Message contents
    content: string;
}

function redisTest() {
    (async () => {
        const client = createClient();
        await client.connect();
        await client.set('abc', 123);
        const value = await client.get('abc');
        console.log(value);
    })();
}

export const store = new Map<ReceiverId, Message[]>();

export function getNextMessage(receiverId: ReceiverId): Message | null {
    
    redisTest();
    
    const receiverMessages = store.get(receiverId);
    
    if (!receiverMessages || receiverMessages.length === 0) {
        return null;
    }

    return receiverMessages.shift()!;
}