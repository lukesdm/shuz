import useSWR from 'swr';

import React, { useEffect, useState } from 'react';
import { Message } from '../lib/store';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { makeReceiverId } from '../lib/receiver';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => fetch(input, init).then((res) => res.json());

// Hacky mutable state. Should refactor this.
let message: Message | null = null;

// Happens once, on page load. Otherwise, conflicts with SWR causing an infinite loop.
const receiverId = makeReceiverId();

function Receiver_() {  
    // Verify code is running client-side, or it will break security guarantees.
    const serverSide = typeof window === 'undefined';
    if (serverSide) {
        throw new Error('This component should only ever be rendered client-side.');
    }  

    const { data, error } = useSWR<Message,Error>(`/api/message?receiverId=${receiverId}`, fetcher, { refreshInterval: 1000 });
    const router = useRouter();

    if (data?.content) {
        message = data;
    }

    return !message ? <QRCode value={receiverId} size={300} /> : <>
        <article className='message-received'>
            <p>{message.sender}:</p>
            <p className='notification'>{message.content}</p>
            <button onClick={() => router.reload()}>Receive another?</button>
        </article>
    </>
}

export const Receiver = dynamic(
    () => Promise.resolve(Receiver_),
    { ssr: false }
  )