import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link";

const About: NextPage = () => {
  return (
    <div>
      <Head>
        <title>shuz.app - About</title>
        <meta name="description" content="Easy close-quarters messaging - About" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='container'>
        <hgroup>
          <h1><Link href="/"><a>shuz.app</a></Link></h1>
          <h3/>
        </hgroup>
        <h3>What is this?</h3>
        <p><em>{`"What's your email?"`}</em><br/>
        <em>{`"How do you spell that?"`}</em><br/>
        <em>{`"Send me the link."`}</em></p>
        <p><em>shuz</em>{` is an attempt make the above easier to solve, when you are otherwise unconnected.`}</p>
        <p>{`It can also be useful when working with devices you don't regularly use, e.g. at a library - a quick way to transfer links and things without logging into another service.`}</p>
        <h3 id='#data-policy'>Data Policy</h3>
        <p>Messages are end-to-end encrypted (in the browser). The encrypted contents are transferred via a temporary data store, where they are held for up to 30 seconds. <em>But</em>, this is an early stage app, and there are likely to be issues to resolve. Contributions in this area are especially welcome.</p>
      </main>
    </div>
  );
}

export default About;