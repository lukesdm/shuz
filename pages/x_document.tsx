import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { randomUUID } from 'node:crypto';

function generateNonce() {
    return randomUUID();
}

function getCSP(nonce: string) {
    
    // Based on:
    //   style-src css-cdn.example.com 'nonce-r@nd0m';
    // https://content-security-policy.com/examples/allow-inline-style/

    return `default-src 'self'; style-src 'self' 'nonce-${nonce}'`;
}

type Props = {
    nonce: string
}

export default class ShuzDocument extends Document<Props> {
    // Add nonce to CSP, as per:
    // https://github.com/vercel/next.js/discussions/18451#discussioncomment-664707
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        const nonce = generateNonce();
        const csp = getCSP(nonce);
        const res = ctx?.res;
        if (res != null) {
            res.setHeader('Content-Security-Policy', csp);
        }
        return {
            ...initialProps,
            nonce,
        };
    }
  
    render() {
      const { nonce } = this.props;
  
      return (
        <Html lang="en" dir="ltr">
          <Head nonce={nonce} />
          <body>
              <Main />
              <NextScript />
          </body>
        </Html>
        );
    }
}
