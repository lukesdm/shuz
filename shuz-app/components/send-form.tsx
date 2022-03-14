import React, { useEffect, useState } from 'react';
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

    // console.error(err);
  }

  return error ?? 'OK';
}

// Status and result of previous operation.
// COULDDO: refactor to swap nulls with other results where it makes sense, e.g. 'HasQR'.
type Status = ['WaitingForText', null ] | [ 'WaitingForQR', null ] | [ 'HasQR', null ]  | [ 'MessageSent', SendResult ];

export function SendForm() {
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [[status, result], setStatus] = useState(['WaitingForText', null ] as Status);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    switch (status) {
      case 'WaitingForText': break;
      case 'WaitingForQR':
        setNotification(null);
        break;
      case 'HasQR':
        (async () => {
          const sendResult = await sendMessage(receiverId, content);
          setStatus(["MessageSent", sendResult]);
        })(); 
        break;
      case 'MessageSent':
        const notific = result === 'OK' ? 'Message sent!' : `${result!.message}`;
        setNotification(notific);
        setStatus(["WaitingForText", null]);
        break;
    }
  }, [status, result, notification, receiverId, content]);

  const onQrRead: OnResultFunction = (result, error) => {
    if (!!result) {
      setReceiverId(result.getText());
      setStatus(["HasQR", null]);
    }
    if (!!error) {
      // ignore these errors for now.
    }
  }

  const onSendClick = () => {
    setStatus(["WaitingForQR", null]);
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      { status === "WaitingForQR" && <>
        {/* <h3>Scan recipient&apos;s QR code</h3> */}
        <QrReader videoStyle={{ height: '50vh', position: 'static' }} videoContainerStyle = {{ paddingTop: '', position: '' }} onResult= {onQrRead} constraints = {{ facingMode: { ideal: 'environment' } }} />
      </> }
      { status === "WaitingForText" && <>
        <label>
          Message:
          <textarea name="content" rows={3} placeholder={"Your message...\n\n(From?)"} onChange={e => setContent(e.target.value)} />
        </label>
        <input type="button" value="Send" name="start-send" onClick={onSendClick} />
      </> }
      
      <p className='notification' style={{
        transition: notification ? "all 1.0s": "",
        opacity: notification ? 1.0 : 0.0 
      }}>{notification}</p>
      
    </form>
  );
};