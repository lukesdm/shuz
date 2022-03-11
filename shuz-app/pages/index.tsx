import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Receiver } from '../components/receiver';
import { SendForm } from '../components/send-form';
import { makeReceiverId } from '../lib/receiver';
import styles from '../styles/Home.module.css';

type Mode = 'Receive' | 'Send';

const Home: NextPage = ({ receiverId }:any) => { // use any here to avoid some weird type stuff.
  const [mode, setMode] = useState('Receive' as Mode);

  
  
  console.log(`receiver id gen'd = ${receiverId}`);
  return (
    <div className={styles.container}>
      <Head>
        <title>shuz.app</title>
        <meta name="description" content="Hello fellow humans" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          shuz.app
        </h1>

        <p className={styles.description}>
          <i>{`What's your email? How do you spell that? Send me the link.`}</i><br />
          {`Quickly share messages - type your message, hit send, and scan the recipient's QR code.`}
        </p>

        <input type="checkbox" name='mode' role={ 'switch' } onChange={e => setMode(e.target.checked ? 'Send' : 'Receive')} />

        
        { (mode === 'Receive') ?
          <>
            <h1>Receive</h1>
            <QRCode value={receiverId} />
            <Receiver receiverId={receiverId}/>
          </> :
          <>
            <h1>Send</h1>
            <SendForm />
          </>
        }
      </main>

      <footer className={styles.footer}>
          <p>© Luke McQuade 2022</p>
          <a href="#">About (TODO)</a>
          <p>This is an early stage prototype, DO NOT use for sensitive data.</p>
      </footer>
      <div id="hidden-receiver-id" hidden>{receiverId}</div>
    </div>
  )
}

export async function getServerSideProps() {
  const receiverId = makeReceiverId();
  return { props: { receiverId }};
}

export default Home
