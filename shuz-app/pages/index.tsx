import type { NextPage } from 'next';
import Head from 'next/head';
import QRCode from 'react-qr-code';
import { Receiver } from '../components/receiver';
import { SendForm } from '../components/send-form';
import { makeReceiverId } from '../lib/receiver';
import styles from '../styles/Home.module.css';



const Home: NextPage = ({ receiverId }) => {
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
          (TODO: How to use)
        </p>

        <section>
          <h2>Receive</h2>
          <QRCode value={receiverId} />
          <Receiver receiverId={receiverId}/>
        </section>

        <section>
          <h2>Send</h2>
          <SendForm />
        </section>
        
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
