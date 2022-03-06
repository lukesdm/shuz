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

const store = new Map<ReceiverId, Message[]>();

export { store }