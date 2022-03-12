import React, { useEffect, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';

function logError(context: string, err?: Error) {
  console.error(`${context} ${err}`);
}

function sendMessage(sender: string, receiverId: string, content: string) {
  console.log(`Sending message: '${content}' from ${sender} to ${receiverId}`);
  
  // TODO: User-friendly error notification. (complicated by react)
  fetch('/api/message', { method: 'POST', body: JSON.stringify({ sender, receiverId, content })})
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
          <textarea name="content" onChange={e => setContent(e.target.value)} />
        </label>
        <label>
          From:
          <input type="text" name="sender" onChange={e => setSender(e.target.value)} />
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