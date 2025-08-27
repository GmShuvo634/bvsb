// src/layouts/header.tsx
// Thin wrapper: loads the real header ONLY on the client (no SSR)
// This prevents Material Tailwind SSR theme crashes.
import dynamic from "next/dynamic";

const HeaderClient = dynamic(() => import("./header.client"), {
  ssr: false,
  loading: () => <div className="w-full h-16" />,
});

export default HeaderClient;
