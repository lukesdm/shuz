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

      <main className='container'>
        <hgroup>
          <h1>shuz.app</h1>
          <h2><i>{`What's your email? How do you spell that? Send me the link.`}</i></h2>
        </hgroup>
        <p className={ styles.description }>
          {`Quickly share messages - type your message, hit send, and scan the recipient's QR code.`}
        </p>
        
        <p><em>This is an early stage prototype, DO NOT use for sensitive data.</em></p>

        {/* TODO: Refactor into component + don't use article */}
        <div className='mode-selector-container'><article>
        <label>
          Receive &nbsp;
          <input type="checkbox" className='mode-selector' name='mode' role={ 'switch' } onChange={e => setMode(e.target.checked ? 'Send' : 'Receive')} />
          &nbsp; Send
        </label>
        </article></div>

        

        { (mode === 'Receive') ?
          <>
            <div className='qr-container'>
              <QRCode value={receiverId} size={400} />
            </div>
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
