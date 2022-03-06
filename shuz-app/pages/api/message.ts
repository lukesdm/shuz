import type { NextApiRequest, NextApiResponse } from 'next'
import { store, Message, getNextMessage } from '../../lib/store';

// Pull latest message for the given receiver
function handleGet(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let { receiverId } = req.query;
    
    if (typeof receiverId !== 'string') {
        res.status(400).json(null);
        return;
    }

    const nextMessage = getNextMessage(receiverId) ?? {};

    // console.log(`get message for '${receiverId}' returned: ${JSON.stringify(nextMessage)}`);

    res.status(200).json(nextMessage);
}

// Pushes message to receiver's queue
function handlePost(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const message: Message = JSON.parse(req.body);
    if (!message.receiverId || !message.sender || !message.content) {
        res.status(400).json(null);
        return;
    }

    const receiverMessages = store.get(message.receiverId) ?? store.set(message.receiverId, []).get(message.receiverId)!;
    receiverMessages.push(message);

    console.log(message);

    res.status(200).json(null);
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method == 'GET') {
        handleGet(req, res);
    } else if (req.method === 'POST') {
        handlePost(req, res);
    } else {
        res.status(405).json(null);
    }
}
