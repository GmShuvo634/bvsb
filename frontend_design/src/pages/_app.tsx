"use client";
// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";

import { Provider } from "react-redux";
import { store } from "@/store/globalState";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

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
    <ErrorBoundary>
      <WagmiConfig config={wagmiConfig}>
        <Provider store={store}>
          <AuthProvider>
            <ThemeProvider>
              <Toaster
                position="top-right"
                theme="dark"
                richColors
                closeButton
                duration={5000}
              />
              <Component {...pageProps} />
            </ThemeProvider>
          </AuthProvider>
        </Provider>
      </WagmiConfig>
    </ErrorBoundary>
  );
}

