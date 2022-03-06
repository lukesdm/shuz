import useSWR from 'swr';

import React from 'react';
import { Message } from '../lib/store';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => fetch(input, init).then((res) => res.json());

export function Receiver(props: { receiverId: string }) {  
    const { data, error } = useSWR<Message,Error>(`/api/message?receiverId=${props.receiverId}`, fetcher, { refreshInterval: 1000 });

    if (data?.message) {
        return <p>{data.sender}: {data.message}</p>
    } else {
        return null;
    }
}