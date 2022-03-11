import useSWR from 'swr';

import React from 'react';
import { Message } from '../lib/store';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => fetch(input, init).then((res) => res.json());

// Hacky mutable state. Should only change client-side, but should refactor.
// Would be bad if ever used server-side.
let message: Message | null = null;

export function Receiver(props: { receiverId: string }) {  
    const { data, error } = useSWR<Message,Error>(`/api/message?receiverId=${props.receiverId}`, fetcher, { refreshInterval: 1000 });

    if (data?.content) {
        message = data;
    }

    return message &&
    <p className='notification'>{message.sender}: {message.content}</p>
}