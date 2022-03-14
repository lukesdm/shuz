import React, { useEffect, useReducer, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';
import { EncryptError, SenderSecurityContext } from '../lib/security';
import { Message } from '../lib/store';

/**
 * An error making the web request.
 */
class PostError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'PostError';
  }
}

/**
 * An error during the sending process.
 */
class SendError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SendError';
  }
}

type SendResult = 'OK' | SendError;

async function postMessage(receiverId: string, encryptedContent: string) {
  const body: Message = {
    receiverId,
    content: encryptedContent,
  };

  try {
    const response = await fetch('/api/message', { method: 'POST', body: JSON.stringify(body)});
    if (!response.ok) { throw new PostError(`API responded ${response.status}: ${response.statusText}`) }
  } catch (err) {
    throw err instanceof PostError ? err : new PostError(`Network, or other unexpected problem.`);
  }
}

async function sendMessage(receiverId: string, content: string): Promise<SendResult> {
  let error = null;
  try {
    const encryptedContent = await new SenderSecurityContext().encrypt(receiverId, content);
    await postMessage(receiverId, encryptedContent);
  } catch (err) {
    if (err instanceof EncryptError) {
      error = new SendError('Problem sending message. Was the correct QR code scanned?');
    } else if (err instanceof PostError) {
      error = new SendError('Problem sending message. Please refresh and try again.');
    } else {
      error = new SendError('Unexpected problem. Please report this to our team, and we will investigate it as soon as possible.');
    }
  }

  return error ?? 'OK';
}

function formatSendResult(sendResult: SendResult | null): string {
  if (sendResult === 'OK') {
    return 'Message sent successfully!';
  } else if (sendResult instanceof SendError) {
    return sendResult.message;
  } else {
    return '';
  }
}

type ActionType = 'WaitForText' | 'WaitForQR' | 'HandleQR' | 'HandleSend';

type Action = { type: 'WaitForText'; payload: string } // textbox contents updated
  | { type: 'WaitForQR'; } // content already updated, no payload needed.
  | { type: 'HandleQR'; payload: string } // QR code.
  | { type: 'HandleSend'; payload: SendResult };

const initState = {
  lastAction: 'WaitForText' as ActionType,
  content: null as (string | null),
  receiverId: null as (string | null),
  sendResult: null as (SendResult | null)
}

type State = typeof initState;

function reducer(state: State, action: Action): State {
  const newState = { ...state, lastAction: action.type };
  switch (action.type) {
    case 'WaitForText':
      return {...newState, content: action.payload };
    case 'WaitForQR':
      return {...newState };
    case 'HandleQR':
      return {...newState, receiverId: action.payload };
    case 'HandleSend':
      return {...newState, sendResult: action.payload };
    default:
      throw new Error('Unexpected action type.');
  }
}

export function SendForm() {
  
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    if (state.lastAction === 'HandleQR') {
      (async () => {
        if (!(state.receiverId && state.content)) {
          throw new Error('Invalid state');
        }

        const sendResult = await sendMessage(state.receiverId, state.content);
        dispatch({ type: 'HandleSend', payload: sendResult });
      })();
    }
  }, [state]);

  const onQrRead: OnResultFunction = (result, error) => {
    if (!!result) {
      dispatch({ type: 'HandleQR', payload: result.getText() });
    }
    if (!!error) {
      // Ignore these errors for now.
      // TODO: Look into what sort of errors might happen here. E.g. how are multiple QR codes handled?
    }
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      { state.lastAction === 'WaitForQR' && <>
        <QrReader videoStyle={{ height: '50vh', position: 'static' }} videoContainerStyle = {{ paddingTop: '', position: '' }} onResult={onQrRead} constraints = {{ facingMode: { ideal: 'environment' } }} />
      </> }
      { state.lastAction === 'WaitForText' && <>
        <label>
          Message:
          <textarea name="content" rows={3} placeholder={"Your message...\n\n(From?)"} onChange={e => dispatch({ type: 'WaitForText', payload: e.target.value })} />
        </label>
        <input type="button" value="Send" name="start-send" onClick={() => dispatch({ type: 'WaitForQR' })} />
      </> }
      
        {/* Don't wrap this in conditional otherwise animation breaks.
              COULDDO: Find a nicer way to do it. */}
        <p className='notification' style={{
          transition: state.sendResult ? "all 1.0s": "",
          opacity: state.sendResult ? 1.0 : 0.0 
        }}>{ state.lastAction === 'HandleSend' && formatSendResult(state.sendResult)}</p>

        { state.lastAction === 'HandleSend' && state.sendResult instanceof SendError && <>
          <button onClick={() => dispatch({ type: 'WaitForQR' })}>Try again</button>
        </> }

        { state.lastAction === 'HandleSend' && state.sendResult === 'OK' && <>
          <button onClick={() => dispatch({ type: 'WaitForQR' })}>Send again?</button>
          <button onClick={() => dispatch({ type: 'WaitForText', payload: '' })}>Send another?</button>
        </>}
        
      
    </form>
  );
};