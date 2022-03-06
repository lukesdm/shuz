import type { NextPage } from 'next'
import Head from 'next/head'
import { getReceiverId } from '../lib/receiver';
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const receiverId = getReceiverId();
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
          <p>...</p>
          <p>{receiverId}</p>
        </section>

        <section>
          <h2>Send</h2>
          <p>...</p>
        </section>
        
      </main>

      <footer className={styles.footer}>
          © Luke McQuade 2022 <a href="#">About (TODO)</a>
      </footer>
    </div>
  )
}

export default Home
