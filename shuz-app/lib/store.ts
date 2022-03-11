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
    const client = createClient();
    await client.connect();
    client.rPush(message.receiverId, JSON.stringify(message));
}

export async function getNextMessage(receiverId: ReceiverId): Promise<Message | null> {
    const client = createClient();
    await client.connect();
    return JSON.parse(await client.lPop(receiverId) ?? '{}');
}