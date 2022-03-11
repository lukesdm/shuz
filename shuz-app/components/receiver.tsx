import useSWR from 'swr';

import React from 'react';
import { Message } from '../lib/store';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/router';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => fetch(input, init).then((res) => res.json());

// Hacky mutable state. Should only change client-side, but should refactor.
// Would be bad if ever used server-side.
let message: Message | null = null;

export function Receiver(props: { receiverId: string }) {  
    const { data, error } = useSWR<Message,Error>(`/api/message?receiverId=${props.receiverId}`, fetcher, { refreshInterval: 1000 });
    const router = useRouter();

    if (data?.content) {
        message = data;
    }

    return !message ? <QRCode value={props.receiverId} size={400} /> : <>
        <article className='message-received'>
            <p>{message.sender}:</p>
            <p className='notification'>{message.content}</p>
            <button onClick={() => router.reload()}>Again?</button>
        </article>
    </>
    
}