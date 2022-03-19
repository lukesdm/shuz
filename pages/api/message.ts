import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMessage, Message, getMessage } from '../../lib/store';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<{ code: number, data: object | null }>

const handleGet: Handler = async (req, res) => {
    // Some non-ideal use of empty object {} and null around here, as some parsers/serializers don't deal with null,
    // and typescript treats {} as super type.  
    let { receiverId } = req.query;
    
    if (typeof receiverId !== 'string') {
        return { code: 400, data: null };
    }

    let message = null;
    try {
        message = await getMessage(receiverId) ?? {};
    } catch (e) {
        console.error(e);
        return { code: 500, data: {} }
    }

    // COULDDO: Return 204 when there's no message
    return { code: 200, data: message };
}

const handlePost: Handler = async (req, res) => {
    const message: Message = JSON.parse(req.body);
    if (!message.receiverId || !message.content) {
        return { code: 400, data: null };
    }

    await sendMessage(message);

    return { code: 200, data: null }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    try {
        const result = req.method === 'GET' ? await handleGet(req, res) : req.method === 'POST' ? await handlePost(req, res) : { code: 405, data: null };
        res.status(result.code).json(result.data);
    } catch (err) {
        console.error(`Unexpected error: ${err}`);
        res.status(500).json(null);
    }
}
