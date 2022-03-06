import type { NextPage } from 'next';
import Head from 'next/head';
import QRCode from 'react-qr-code';
import { Send } from '../components/send';
import { makeReceiverId } from '../lib/receiver';
import styles from '../styles/Home.module.css';


const Home: NextPage = () => {
  const receiverId = makeReceiverId();
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
          (TODO: How to use)
        </p>

        <section>
          <h2>Receive</h2>
          <QRCode value={receiverId} />
        </section>

        <section>
          <h2>Send</h2>
          <Send />
        </section>
        
      </main>

      <footer className={styles.footer}>
          <p>© Luke McQuade 2022</p>
          <a href="#">About (TODO)</a>
          <p>This is an early stage prototype, DO NOT use for sensitive data.</p>
      </footer>
    </div>
  )
}

export default Home
