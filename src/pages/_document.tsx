import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";
import React from "react";
import { resetServerContext } from "react-beautiful-dnd";

import { ColorModeScript } from "@chakra-ui/react";
import theme from "../styles/theme";

type Props = {};

class MyDocument extends Document<Props> {
  /*
   * fix the clinet/server error using resetServerContext()
   */
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    resetServerContext();
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head></Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
