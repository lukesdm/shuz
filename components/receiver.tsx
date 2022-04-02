import useSWR from 'swr';

import React, { useEffect, useState } from 'react';
import { Message } from '../lib/store';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ReceiverSecurityContext } from '../lib/security';
import { makeSendToUrl } from '../lib/urls';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => fetch(input, init).then((res) => res.json());

// Should be ok for mobile. Will scale accordingly later.
const INITIAL_QR_SIZE = 200;

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}

function Receiver_() {
    const serverSide = typeof window === 'undefined';
    if (serverSide) {
        throw new Error('This component should only ever be rendered client-side.');
    }

    const [ securityContext, setSecurityContext ] = useState(new ReceiverSecurityContext());
    const [ messageContent, setMessageContent ] = useState<string>();
    const [ hideMessage, setHideMessage ] = useState<boolean>();

    const receiverId = securityContext.receiverId;
    const urlParams = new URLSearchParams({ receiverId });
    const { data, error } = useSWR<Message,Error>(receiverId ? `/api/message?${urlParams}` : null, fetcher, { refreshInterval: 1000 });
    const router = useRouter();

    // Generate keypair
    useEffect(() => {
        const newSecurityContext = new ReceiverSecurityContext();
        (async () => {
            await newSecurityContext.init();
            setSecurityContext(newSecurityContext);
        })();
    }, []);

    // Set QR size
    useEffect(() => {
        const qrContainer = document.getElementById('qr-container');
        if (!qrContainer) {
           return;
        }
        // Hacks on hacks. `height` is the initial qr size, but margin:auto is used so to center the content and grow the container to desired size.
        // Note. This won't scale the QR automatically as window size is adjusted, it's triggered on re-render.
        const containerHeight = 
            parseInt(window.getComputedStyle(qrContainer).height) + 2 * parseInt(window.getComputedStyle(qrContainer).marginTop);
        
        const scale = containerHeight / INITIAL_QR_SIZE;
        qrContainer.style.transform = `scale(${scale})`;
    });
    
    // Handle message received
    useEffect(() => {
        (async () => {
            if (data?.content) {
                const newContent = await securityContext.decrypt(data.content);
                setMessageContent(newContent);
            }
        })();
    }, [ securityContext, data ]);


    const qr =
        <>
            <div className='qr-container' id='qr-container' >
                {receiverId ? <article className='qr-quiet-zone'><QRCode value={makeSendToUrl(receiverId)} size={INITIAL_QR_SIZE} /></article> : <p>Loading...</p>}
            </div>
            <br />
            <p>On receive...</p>
            <div className='ignore-mq grid'>
            <label>
                <input type='checkbox' onChange={e => setHideMessage(e.target.value == 'on')}/>
                Hide 🙈
            </label>
            </div>
        </>
    return !messageContent ? qr : <>
        <article className='message-received'>
            <p className='notification'>{hideMessage ? '••••••••' : messageContent}</p>
            <div className='ignore-mq grid'>
                <button onClick={_ => setHideMessage(!hideMessage)}>{hideMessage ? 'Show 👁' : 'Hide 🙈'}</button>
                <button onClick={_ => copyToClipboard(messageContent)}>Copy 📋</button>
            </div>
            <button onClick={() => router.reload()}>Receive another?</button>
        </article>
    </>
}

export const Receiver = dynamic(
    () => Promise.resolve(Receiver_),
    { ssr: false }
  );
