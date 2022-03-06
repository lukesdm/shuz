import React, { useEffect, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';

function sendMessage(sender: string, receiverId: string, content: string) {
  console.log(`Sending message: '${content}' from ${sender} to ${receiverId}`);
  
  // Fire and forget for now. Should put some error handling etc. around this.
  fetch('/api/message', { method: 'POST', body: JSON.stringify({ sender, receiverId, content })});
}

export function SendForm() {
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [showQrReader, setShowQrReader] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const canSendMessage = showQrReader && receiverId !== '' && content !== '';
    if (canSendMessage) {
      sendMessage("Testface", receiverId, content);
      
      setShowQrReader(false);
      setReceiverId('');
      setContent('');
      setMessageSent(true);
    }
  }, [showQrReader, receiverId, content]);

  const onQrRead: OnResultFunction = (result, error) => {
    if (!!result) {
      setReceiverId(result.getText());
    }
    if (!!error) {
      // ignore these errors for now.
    }
  }

  const onSendClick = () => {
    setShowQrReader(true);
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label>
        Message:
        <input type="text" name="content" onChange={e => setContent(e.target.value)} />
      </label>
      <input type="button" value="Send" name="start-send" onClick={onSendClick} />
      {showQrReader && <h3>Scan recipient&apos;s QR code</h3>}
      {showQrReader && <QrReader onResult= {onQrRead} constraints = {{}} />}
      {messageSent && <h3>Message sent!</h3>}
    </form>
  );
};