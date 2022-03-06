// GUID-type string
type ReceiverId = string;

export type Message = {
    // Name of the sender
    sender: string;
    
    // Receiver GUID
    receiverId: ReceiverId;
    
    // Message contents
    message: string;
}

export const store = new Map<ReceiverId, Message[]>();

export function getNextMessage(receiverId: ReceiverId): Message | null {
    const receiverMessages = store.get(receiverId);
    
    if (!receiverMessages || receiverMessages.length === 0) {
        return null;
    }

    return receiverMessages.shift()!;
}