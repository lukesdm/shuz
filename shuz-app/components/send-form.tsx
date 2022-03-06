import React, { useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';

// export class SendForm extends React.Component {

//   handleSubmit() {
//     // Parse receiver ID from QR Code + POST message
//   }
//   render() {
//     return (
//       <form onSubmit={this.handleSubmit}>
//         <label>
//           Message:
//           <input type="text" name="message" />
//         </label>
//         <input type="button" value="Send (start QR capture)" name="start-send" />
//         <QrReader
//           onResult= {onQrRead}
//           constraints = {{}} />
//         <label>ID</label>
//         <input type="submit" value="Send (really) " />
//       </form>
//     );
//   }
// }

function sendMessage(sender: string, receiverId: string, message: string) {
  console.log(`Sending message: '${message}' from ${sender} to ${receiverId}`);
}


export function SendForm() {
  const [message, setMessage] = useState('my message');

  const onQrRead: OnResultFunction = (result, error) => {
    if (!!result) {
      const receiverId = result.getText();
      sendMessage("test sender", receiverId, message);
    }
  
    if (!!error) {
      // console.info(error);
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