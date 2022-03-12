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
    
    // COULDDO: use getDel if/when upstash implements it.
    const message = JSON.parse(await client.getSet(receiverId, JSON.stringify({})) ?? '{}');
    return message;
}