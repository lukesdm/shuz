import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMessage, Message, getNextMessage } from '../../lib/store';

// Pull latest message for the given receiver
async function handleGet(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let { receiverId } = req.query;
    
    if (typeof receiverId !== 'string') {
        res.status(400).json(null);
        return;
    }

    const nextMessage = await getNextMessage(receiverId) ?? {};

    // console.log(`get message for '${receiverId}' returned: ${JSON.stringify(nextMessage)}`);

    res.status(200).json(nextMessage);
}

// Pushes message to receiver's queue
async function handlePost(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const message: Message = JSON.parse(req.body);
    if (!message.receiverId || !message.sender || !message.content) {
        res.status(400).json(null);
        return;
    }

    await sendMessage(message);

    console.log(message);

    res.status(200).json(null);
}

export default async function handler(
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
