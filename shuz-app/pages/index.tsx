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

      <header className='container'>
        <hgroup>
          <h1>shuz.app</h1>
          <h2><i>{`What's your email? How do you spell that? Send me the link.`}</i></h2>
        </hgroup>
      </header>

      <main className='container'>
        <p className={styles.description}>
          {`Quickly share messages - type your message, hit send, and scan the recipient's QR code.`}
        </p>

        <label>
          Receive
          <input type="checkbox" className='mode-selector' name='mode' role={ 'switch' } onChange={e => setMode(e.target.checked ? 'Send' : 'Receive')} />
          Send
        </label>

        <p>This is an early stage prototype, DO NOT use for sensitive data.</p>

        { (mode === 'Receive') ?
          <>
            <h3>Receive</h3>
            <QRCode value={receiverId} />
            <Receiver receiverId={receiverId}/>
          </> :
          <>
            <SendForm />
          </>
        }
      
      </main>

      <footer className='container'>
          <p>© Luke McQuade 2022</p>
          <p><a href="#">About (TODO)</a></p>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  const receiverId = makeReceiverId();
  return { props: { receiverId }};
}

export default Home
