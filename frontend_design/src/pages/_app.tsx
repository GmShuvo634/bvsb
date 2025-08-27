"use client";
// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";

import { Provider } from "react-redux";
import { store } from "@/store/globalState";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { WagmiConfig } from "wagmi";
import { wagmiConfig, initializeWagmi } from "@/config/wagmi";
import { ThemeProvider } from "@material-tailwind/react";
// import { ThemeProvider } from "@material-tailwind/react";

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false);

  // Initialize wagmi configuration and handle client-side mounting
  React.useEffect(() => {
    initializeWagmi();
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <Component {...pageProps} />
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </WagmiConfig>
  );
}

