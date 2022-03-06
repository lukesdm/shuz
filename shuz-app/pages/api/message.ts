import type { NextApiRequest, NextApiResponse } from 'next'

type MessageReq = {
  sender: string;
  receiverId: string;
  message: string;
}

function handleGet(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // not yet implemented.
    res.status(500).json({});
}

function handlePost(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.dir(req.body);
    res.status(200).json({});
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
        res.status(405).json({});
    }
}

