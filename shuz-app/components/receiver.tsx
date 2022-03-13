import useSWR from 'swr';

import React, { useEffect, useState } from 'react';
import { Message } from '../lib/store';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ReceiverSecurityContext } from '../lib/security';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => fetch(input, init).then((res) => res.json());

// Hacky mutable state. Should refactor this.
let message: Message | null = null;

function Receiver_() {
    const serverSide = typeof window === 'undefined';
    if (serverSide) {
        throw new Error('This component should only ever be rendered client-side.');
    }

    const [ securityContext, setSecurityContext ] = useState(new ReceiverSecurityContext());

    const receiverId = securityContext.receiverId;
    const urlParams = new URLSearchParams({ receiverId });
    const { data, error } = useSWR<Message,Error>(receiverId ? `/api/message?${urlParams}` : null, fetcher, { refreshInterval: 1000 });
    const router = useRouter();

    useEffect(() => {
        const newSecurityContext = new ReceiverSecurityContext();
        (async () => {
            await newSecurityContext.init();
            setSecurityContext(newSecurityContext);
        })();
    }, []);
    
    useEffect(() => {
        (async () => {
            if (data?.content) {
                message = data;
                message.content = await securityContext.decrypt(message.content);
                console.log(message.content);
            }
        })();
    }, [ securityContext, data ]);

    const qr = receiverId ? <QRCode value={receiverId} size={300} /> : <p>Loading...</p>
    return !message ? qr  : <>
        <article className='message-received'>
            <p className='notification'>{message.content}</p>
            <button onClick={() => router.reload()}>Receive another?</button>
        </article>
    </>
}

export const Receiver = dynamic(
    () => Promise.resolve(Receiver_),
    { ssr: false }
  );
