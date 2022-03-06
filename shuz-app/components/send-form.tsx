import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

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
//           onResult={(result, error) => {
//             if (!!result) {
//               setData(result.text);
//             }
//           }}
//         />
//         <label>ID</label>
//         <input type="submit" value="Send (really) " />
//       </form>
//     );
//   }
// }

export function SendForm() {
  const [data, setData] = useState('No result');

  return (
    <>
      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            setData(result.getText());
          }

          if (!!error) {
            console.info(error);
          }
        } } constraints = {{}} />
      <p>{data}</p>
    </>
  );
};