import useSWR from 'swr';

import React, { useCallback, useState } from 'react';
import { getNextMessage, Message } from '../lib/store';

const fetcher = (input: RequestInfo, init: RequestInit | undefined) => {

     fetch(input, init).then((res) => res.json())
};

// class Receiver extends React.Component {
//     render() {
//         return 
//     }
// }

export function Receiver(props: { receiverId: string }) {
    const { data, error } = useSWR(`/api/message?receiverId=${props.receiverId}`, fetcher, { refreshInterval: 1000 });
    
    if (data) {
        return <p>{data}</p>;
    } else {
        return null;
    }

    

    // return <>
    //     { message && <p>{message.sender}: {message.message}</p> }
    // </>
}