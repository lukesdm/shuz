import React, { useEffect, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';
import { SenderSecurityContext } from '../lib/security';
import { Message } from '../lib/store';

function logError(context: string, err?: Error) {
  console.error(`${context} ${err}`);
}

async function sendMessage(sender: string, receiverId: string, content: string) {
  const encryptedContent = await new SenderSecurityContext().encrypt(receiverId, content);

  console.log(`Sending message. From '${sender}' to '${receiverId}'. Content: '${content}', encrypted: '${encryptedContent}') `);
  
  // TODO: User-friendly error notification. (complicated by react)
  const body: Message = {
    receiverId,
    content: encryptedContent,
  };
  fetch('/api/message', { method: 'POST', body: JSON.stringify(body)})
  .then(res => {
    if (!res.ok) {
      logError('Problem sending message.', new Error(`API responded with code ${res.status}`))
    }
  })
  .catch(err => {
    logError('Problem sending message.', err);
  });
}

type Status = 'WaitingForText' | 'WaitingForQR' | 'HasQR' | 'MessageSent';

type Notification = 'Message sent!' | null;

export function SendForm() {
  const [content, setContent] = useState('');
  const [sender, setSender] = useState('');
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
        sendMessage(sender, receiverId, content);
        setStatus("MessageSent");
        break;
      case 'MessageSent':
        setNotification('Message sent!');
        setStatus("WaitingForText");
        break;
    }
  }, [status, notification, receiverId, content, sender]);

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
          {/* <input type="text" name="content" onChange={e => setContent(e.target.value)} /> */}
          <textarea name="content" rows={4} placeholder={"Your message...\n\n(From?)"} onChange={e => setContent(e.target.value)} />
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