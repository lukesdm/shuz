import React, { useEffect, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';

function sendMessage(sender: string, receiverId: string, content: string) {
  console.log(`Sending message: '${content}' from ${sender} to ${receiverId}`);
  
  // Fire and forget for now. Should put some error handling etc. around this.
  fetch('/api/message', { method: 'POST', body: JSON.stringify({ sender, receiverId, content })});
}

type Status = 'WaitingForText' | 'WaitingForQR' | 'HasQR' | 'MessageSent';

export function SendForm() {
  const [content, setContent] = useState('');
  const [sender, setSender] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [status, setStatus] = useState('WaitingForText' as Status);
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    // const canSendMessage = showQrReader && receiverId !== '' && content !== '';
    switch (status) {
      case 'WaitingForText': break;
      case 'WaitingForQR':
        setNotify(false);
        break;
      case 'HasQR':
        sendMessage(sender, receiverId, content);
        setStatus("MessageSent");
        break;
      case 'MessageSent':
        setNotify(true);
        setStatus("WaitingForText");
        break;
    }
  }, [status, notify, receiverId, content, sender]);

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
        <h3>Scan recipient&apos;s QR code</h3>
        <QrReader onResult= {onQrRead} constraints = {{}} />
      </> }
      { status === "WaitingForText" && <>
        <label>
          Message:
          <input type="text" name="content" onChange={e => setContent(e.target.value)} />
        </label>
        <label>
          From:
          <input type="text" name="sender" onChange={e => setSender(e.target.value)} />
        </label>
        <input type="button" value="Send" name="start-send" onClick={onSendClick} />
      </> }
      
      <h3 style={{
        transition: notify ? "all 1.0s": "",
        opacity: notify ? 1.0 : 0.0 
      }}> {notify ? <span>Message sent!</span> : null } </h3>
      
    </form>
  );
};