// src/pages/providers.tsx
'use client';

  import * as React from 'react'
  import { WagmiConfig } from 'wagmi'
  import { wagmiConfig } from '@/config/wagmi'

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
     <WagmiConfig config={wagmiConfig}>
      {mounted && children}
    </WagmiConfig>
  );
}

