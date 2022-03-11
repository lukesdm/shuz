import useSWR from 'swr';

import React, { useRef } from 'react';
import { Message } from '../lib/store';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => fetch(input, init).then((res) => res.json());

// Hacky mutable state. Should only change client-side, but should refactor.
// Would be bad if ever used server-side.
let latestMessage: Message | null = null;

export function Receiver(props: { receiverId: string }) {  
    const { data, error } = useSWR<Message,Error>(`/api/message?receiverId=${props.receiverId}`, fetcher, { refreshInterval: 1000 });
    
    let hasNewMessage = false; 
    if (data?.content) {
        latestMessage = data;
        hasNewMessage = true;
    }

    return latestMessage && <h3 style={{
        transition: (latestMessage && !hasNewMessage) ? "all 0.5s": "",
        opacity: (latestMessage && !hasNewMessage) ? 1.0 : 0.0
    }}>{latestMessage.sender}: {latestMessage.content}</h3>
}