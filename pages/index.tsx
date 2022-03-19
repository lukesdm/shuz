import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Receiver } from '../components/receiver';
import { SendForm } from '../components/send-form';
import { getReceiverIdFromUrl } from '../lib/urls';
import styles from '../styles/Home.module.css';

type Mode = 'Receive' | 'Send';

type Props = {
  initReceiverId: string | null,
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<{ props: Props}>  {
  
  // This gives the capability of getting the receiverId/public key from the query string, rather than scanning on the page.
  // COULDDO: Get public key for receiver id here (make a backend call), if/when they are no longer the same thing.
  const initReceiverId = getReceiverIdFromUrl(context);
  return { props: { initReceiverId } };
}

const Home: NextPage<Props> = (props: Props) => {
  const [receiverId, setReceiverId] = useState(props.initReceiverId);
  const [mode, setMode] = useState(props.initReceiverId ? 'Send' : 'Receive' as Mode);
  const router = useRouter();

  // 'Consume' send-to url.
  const onSendSuccess = () => {
    router.push('/', undefined, { shallow: true });
    setReceiverId(null)
  };
  
  return (
    <div className={styles.container} data-theme = 'light'>
      <Head>
        <title>shuz.app</title>
        <meta name="description" content="Easy close-quarters messaging" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='container'>
        <hgroup>
          <h1>shuz.app</h1>
          <h2>{`Easy close-quarters messaging`}</h2>
        </hgroup>
        <p>⚠<em>This is a preview release, DO NOT use for highly-sensitive data (<Link href='/about#data-policy'><a>details</a></Link>).</em></p>

        {/* SHOULDDO: refactor into component */}
        <div className='mode-selector'>
          <article> {/* just using `article` here because of its pico styles */}
            <div className='ignore-mq grid'>
              <button className={ mode === 'Receive' ? '' : 'outline' } onClick = {e => setMode('Receive')}>
                Receive
              </button>
              <button className={ mode === 'Send' ? '' : 'outline' } onClick = {e => setMode('Send')}>
                Send
              </button>
            </div>
            <p>{ mode === 'Receive' ? <>
              <span>{`Ask the sender to scan the below QR code.`}</span><br/><span className='minor-text'>{`Either with a regular camera app, or through this site.`}</span>
              </>
             : `Type your message, hit Send below, and scan the recipient's QR code.`}</p>
          </article>
        </div>

        { (mode === 'Receive') ?
          <Receiver /> :
          <SendForm initReceiverId={receiverId} onSendSuccess={onSendSuccess} />
        }
      
      <p></p> { /* spacing */ }
      </main>

      <footer className='container grid'>
          <p>© <a href="https://github.com/lukesdm">Luke McQuade</a></p>
          <p><Link href="/about"><a>About</a></Link></p>
          <p><a href="/licenses.txt">Third-party licenses</a></p>
          <p><a href="https://github.com/lukesdm/shuz">
              {/* eslint-disable-next-line @next/next/no-img-element */ /* Awkward to get the style right with Next Image here, and it's a small file anyway. */}
              <img src='/github-mark/GitHub-Mark-32px.png' alt='GitHub icon' width={24} height={24} />
              &nbsp;<span className='v-align-middle'>Open Source</span>
          </a></p>
      </footer>
    </div>
  )
}

export default Home;
