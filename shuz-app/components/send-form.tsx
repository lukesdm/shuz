import React, { useEffect, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';

function sendMessage(sender: string, receiverId: string, message: string) {
  console.log(`Sending message: '${message}' from ${sender} to ${receiverId}`);
  
  // Fire and forget for now. Should put some error handling etc. around this.
  fetch('/api/message', { method: 'POST', body: JSON.stringify({ sender, receiverId, message })});
}

export function SendForm() {
  const [message, setMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [showQrReader, setShowQrReader] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const canSendMessage = showQrReader && receiverId !== '' && message !== '';
    if (canSendMessage) {
      sendMessage("Testface", receiverId, message);
      
      setShowQrReader(false);
      setReceiverId('');
      setMessage('');
      setMessageSent(true);
    }
  }, [showQrReader, receiverId, message]);

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
    <form>
      <label>
        Message:
        <input type="text" name="message" onChange={e => setMessage(e.target.value)} />
      </label>
      <input type="button" value="Send (start QR capture)" name="start-send" onClick={onSendClick} />
      {showQrReader && <h3>Scan recipient&apos;s QR code</h3>}
      {showQrReader && <QrReader onResult= {onQrRead} constraints = {{}} />}
      {messageSent && <h3>Message sent!</h3>}
    </form>
  );
};