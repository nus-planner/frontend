import "../styles/globals.css";
import "reflect-metadata";
import "../utils/arrayExt";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { AppContext } from "../components/AppContext";
import { useState } from "react";
import { MainViewModel } from "../models";
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
  const [mainViewModel, setMainViewModel] = useState(
    new MainViewModel(2020, 4),
  );

  return (
    <AppContext.Provider value={{ mainViewModel, setMainViewModel }}>
      <Head>
        <title>NUS Planner</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </AppContext.Provider>
  );
}

export default MyApp;
