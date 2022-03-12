import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
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
          <h2>{`Share info with ease.`}</h2>
        </hgroup>
        <p><em>This is an early stage prototype, DO NOT use for sensitive data.</em></p>

        {/* SHOULDDO: refactor into component */}
        <div className='mode-selector'>
          <article> {/* just using `article` here because of its pico styles */}
            <div className='grid'>
            <button className={ mode === 'Receive' ? '' : 'outline' } onClick = {e => setMode('Receive')}>
              Receive
            </button>
            <button className={ mode === 'Send' ? '' : 'outline' } onClick = {e => setMode('Send')}>
              Send
            </button>
            </div>
            <p>{ mode === 'Receive' ? `Show the QR code below to the sender.` : `Type your message, hit Send below, and scan the recipient's QR code.`}</p>
          </article>
        </div>

        { (mode === 'Receive') ?
          <Receiver receiverId={receiverId}/> :
          <SendForm />
        }
      
      <p></p> { /* spacing */ }
      </main>

      <footer className='container'>
          <p>© <a href="https://github.com/lukesdm">Luke McQuade</a> 2022</p>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  const receiverId = makeReceiverId();
  return { props: { receiverId }};
}

export default Home
