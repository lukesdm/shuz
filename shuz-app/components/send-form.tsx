import React, { useEffect, useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';

function sendMessage(sender: string, receiverId: string, message: string) {
  console.log(`Sending message: '${message}' from ${sender} to ${receiverId}`);
}

export function SendForm() {
  const [message, setMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');

  useEffect(() => {
    if (message !== '' && receiverId !== '') {
      sendMessage("Testface", receiverId, message);
    }
  });

  const onQrRead: OnResultFunction = (result, error) => {
    if (!!result) {
      setReceiverId(result.getText());
    }
    if (!!error) {
      // ignore these errors for now.
    }
  }

  return (
    <form>
      <label>
        Message:
        <input type="text" name="message" onChange={e => setMessage(e.target.value)} />
      </label>
      <input type="button" value="Send (start QR capture)" name="start-send" />
      <QrReader
        onResult= {onQrRead}
        constraints = {{}} />
    </form>
  );
};