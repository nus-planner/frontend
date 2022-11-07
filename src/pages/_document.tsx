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
        <Head>
          <title>NUS Planner</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content="One-stop portal for you to plan out your academic journey at NUS. View requirements, plan your semesters and verify if you've met your degree requirements." />
          <meta name="robots" content="index, follow" />
          <meta charSet="UTF-8" />
          <link rel="canonical" href="https://nusplanner.com" />
        </Head>
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
