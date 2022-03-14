import React, { useEffect, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';
import { EncryptError, SenderSecurityContext } from '../lib/security';
import { Message } from '../lib/store';

/**
 * An error making the web request.
 */
class PostError extends Error {}

/**
 * An error during the sending process.
 */
class SendError extends Error {}

type SendResult = 'OK' | SendError;

function logError(context: string, err?: Error) {
  console.error(`${context} ${err}`);
}

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
    logError('Problem sending message.', err as Error);
  }

  return error ?? 'OK';
}

type Status = 'WaitingForText' | 'WaitingForQR' | 'HasQR' | 'MessageSent';

type Notification = 'Message sent!' | null;

export function SendForm() {
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [status, setStatus] = useState('WaitingForText' as Status);
  const [notification, setNotification] = useState(null as Notification);

  useEffect(() => {
    switch (status) {
      case 'WaitingForText': break;
      case 'WaitingForQR':
        setNotification(null);
        break;
      case 'HasQR':
        (async () => {
          const sendResult = await sendMessage(receiverId, content);
          if (sendResult === 'OK') {
            setStatus("MessageSent");
          } else {
            setStatus("MessageSent"); // TODO: Pass error info here instead.
          }
        })(); 
        break;
      case 'MessageSent':
        setNotification('Message sent!');
        setStatus("WaitingForText");
        break;
    }
  }, [status, notification, receiverId, content]);

  const onQrRead: OnResultFunction = (result, error) => {
    if (!!result) {
      setReceiverId(result.getText());
      setStatus("HasQR");
    }
    if (!!error) {
      // ignore these errors for now.
    }
  }

  const onSendClick = () => {
    setStatus("WaitingForQR");
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