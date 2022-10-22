import "../styles/globals.css";
import "reflect-metadata";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { AppContext } from "../components/AppContext";
import { useState } from "react";
import { MainViewModel } from "../models";

function MyApp({ Component, pageProps }: AppProps) {
  const [mainViewModel, setMainViewModel] = useState(
    new MainViewModel(2020, 4),
  );

  return (
    <AppContext.Provider value={{ mainViewModel, setMainViewModel }}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </AppContext.Provider>
  );
}

export default MyApp;
