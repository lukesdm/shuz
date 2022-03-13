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

export async function sendMessage(message: Message) {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    client.set(message.receiverId, JSON.stringify(message), { EX: 30 });
}

export async function getMessage(receiverId: ReceiverId): Promise<Message | null> {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    
    // Hacky dequeue to somewhat avoid eventual consistency issues.
    // Assumes no new message to same ID in short space of time (otherwise it might get lost).
    // getDel (not yet in upstash) or getSet would be better if consistency were enabled.
    const message = JSON.parse(await client.get(receiverId) ?? '{}');
    if (message.content) {
        await client.set(receiverId, JSON.stringify({}));
    }
    
    return message.content ? message : null;
}