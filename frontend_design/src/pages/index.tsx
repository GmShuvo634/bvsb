// src/pages/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { Wallet } from "ethers";
import {
  generateAndStoreWallet,
  loadStoredWallet,
} from "@/utils/wallet";

import WinRatio       from "./landing/win-ratio";
import Comparison     from "./landing/comparison-table";
import Benefit        from "./landing/benefit";
import MonthlyJackpot from "./landing/monthly-jackpot";
import WeeklyJackpot  from "./landing/weekly-jackpot";
import Affilliate     from "./landing/affilliate";
import AppChainInfo   from "./landing/chain-info";
import styles         from "./landing/home.module.css";
import { useRouter }  from "next/router";
import Link           from "next/link";
import { getDashboardData } from "@/components/api";

interface DashboardStats {
  trades:  number;
  wins:    number;
  player:  number;
  paid:    number;
  total:   number;
}

export default function LandingPage() {
  const router = useRouter();

  // ── Dashboard state ──
  const [winRatio, setWinRatio]               = useState(0);
  const [winsPaid, setWinsPaid]               = useState(0);
  const [allTimeWinsPaid, setAllTimeWinsPaid] = useState(0);

  // ── Wallet state ──
  const [localWallet, setLocalWallet]     = useState<Wallet | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // ── Scroll opacity ──
  const [scrollOpacity, setScrollOpacity] = useState(1);

  // ── Referral logic ──
  useEffect(() => {
    if (router.query.ref) {
      localStorage.setItem("referral", String(router.query.ref));
    }
  }, [router.query.ref]);

  // ── Scroll listener & initial dashboard fetch ──
  useEffect(() => {
    const handleScroll = () => {
      const y = window.pageYOffset;
      setScrollOpacity(y <= 350 ? 1 - y / 350 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    fetchDashboard();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Load dashboard data ──
  const fetchDashboard = async () => {
    try {
      const resp = await getDashboardData();
      if (resp.status === 200) {
        const d = resp.data.data as DashboardStats;
        setWinRatio(d.trades ? Number(((d.wins / d.trades) * 100).toFixed(2)) : 0);
        setWinsPaid(d.paid);
        setAllTimeWinsPaid(d.total);
      }
    } catch (e) {
      console.error("Failed to load dashboard", e);
    }
  };

  // ── Wallet controls ──
  const handleGenerate = async () => {
    const pass = window.prompt("Pick a passphrase to encrypt your new wallet:");
    if (!pass) return;
    const w = await generateAndStoreWallet(pass);
    setLocalWallet(w);
  };
  const handleUnlock = async () => {
    const pass = window.prompt("Enter your wallet passphrase:");
    if (!pass) return;
    const w = await loadStoredWallet(pass);
    if (w) setLocalWallet(w);
    else window.alert("Wrong passphrase or no wallet stored");
  };

  return (
    <>
      <main className="flex flex-col items-center bg-[#0b0a0e]">
        {/* Top links + Wallet button */}
        <div className="flex w-full z-50 justify-between mt-5 px-5">
          <Link
            href="/faq"
            className="flex w-28 h-9 bg-gradient-to-b from-[#00ffa1] to-[#00542a]
                       border-2 border-[#0d6c43] rounded-full items-center justify-center
                       font-sans text-sm font-semibold text-white hover:border-[#6effc0]"
          >
            How to Play
          </Link>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowWalletModal(true)}
              className="h-9 px-3 bg-yellow-500 rounded-full text-sm font-semibold text-black hover:bg-yellow-600"
            >
              Wallet
            </button>
            <Link
              href="/play"
              className="flex w-28 h-9 bg-gradient-to-b from-[#ff2d93] to-[#62072d]
                         border-2 border-[#810d3d] rounded-full items-center justify-center
                         font-sans text-sm font-semibold text-white hover:border-[#ff5a9e]"
            >
              Play Now
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="relative w-full h-screen">
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_0_100%,_#0a6046,_#000)] -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_#4b0111,_#fff0)] -z-10" />
          <div className="relative flex flex-col w-full h-full items-center justify-center">
            <Image
              style={{ opacity: scrollOpacity, transform: `scale(${scrollOpacity})` }}
              src="/images/home/main_logo.png"
              alt="Main logo"
              className="w-5/6 h-auto mb-60 sm:w-auto sm:h-2/5 sm:mb-30 lg:h-3/5"
              width={800}
              height={400}
              priority
            />
            <Image
              style={{ right: -(1 - scrollOpacity) * 700 }}
              src="/images/home/BEAR.png"
              alt="Bear"
              className="absolute bottom-0 h-1/3 w-auto sm:h-2/5 lg:h-4/6"
              width={600}
              height={800}
            />
            <Image
              style={{ left: -(1 - scrollOpacity) * 700 }}
              src="/images/home/BULL.png"
              alt="Bull"
              className="absolute bottom-0 h-1/3 w-auto sm:h-2/5 lg:h-4/6"
              width={600}
              height={800}
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="w-full h-screen" />

        {/* Blockchain network panel */}
        <div className="w-full bg-[#111] text-white text-center py-12 space-y-2">
          <p className="font-semibold">MULTI-CHAIN BLOCKCHAIN NETWORK</p>
          <p>
            The game is running on{" "}
            <span className="underline">Ethereum & BNB Smart Chain networks</span>
          </p>
          <p>Trade with USDT or USDC tokens on multiple blockchain networks.</p>
          <p className="font-bold">REAL-TIME ETH PRICE BETTING WITH CHAINLINK ORACLES!</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/play" className="px-4 py-2 bg-pink-600 rounded hover:bg-pink-700">
              Play Now
            </Link>
            <Link href="/faq"  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
              How to Play
            </Link>
          </div>
        </div>

        {/* Statistics & comparison */}
        <div className="relative bg-transparent w-full px-5">
          {/* Paid & Win Ratio */}
          <div className="flex flex-col items-center py-20">
            <div className={styles.component_title}>
              PAID SO FAR
              <br />
              AND WIN RATIO
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center mt-8 sm:mt-16 gap-16 sm:gap-10">
              <WinRatio
                url="/images/home/diamond.png"
                title="WIN RATIO"
                subTitle="LAST 24H"
                value={`${winRatio}%+`}
                theme="flex flex-col justify-center items-center border-[2px] border-[#b47b4a] rounded-[25px]
                       mt-[70px] py-[55px] relative w-[285px] bg-gradient-to-b from-[rgba(255,149,68,.23)] to-transparent"
                text_color="text-[rgba(255,149,68,.80)]"
              />
              <WinRatio
                url="/images/home/diamon_2.png"
                title="WINS PAID"
                subTitle="LAST 24H"
                value={winsPaid.toString()}
                theme="flex flex-col justify-center items-center border-[2px] border-[#7a7a7a] rounded-[25px]
                       py-[55px] relative w-[285px] bg-gradient-to-b from-[rgba(235,235,235,.23)] to-transparent"
                text_color="text-[rgba(235,235,235,.80)]"
              />
              <WinRatio
                url="/images/home/diamond_3.png"
                title="WINS PAID"
                subTitle="ALL TIME"
                value={allTimeWinsPaid.toString()}
                theme="flex flex-col justify-center items-center border-[2px] border-[#487b8c] rounded-[25px]
                       sm:mt-[70px] py-[55px] relative w-[285px] bg-gradient-to-t from-[rgba(104,222,255,.23)] to-transparent"
                text_color="text-[rgba(104,222,255,.80)]"
              />
            </div>
            <Link
              href="/play"
              className="flex justify-center items-center border-[2px] border-[#0e090f] rounded-[100px]
                         mt-[25px] py-[12px] text-white font-sans text-[14px] font-semibold leading-[13px]
                         w-[283px] bg-gradient-to-r from-[#ffeea4] to-[#745f32] hover:border-[#ffffd3]"
            >
              Play Now
            </Link>
          </div>

          {/* Comparison table */}
          <div className="flex flex-col items-center py-20">
            <div className={styles.component_title}>
              COMPARISON
              <br />
              TABLE
            </div>
            <div className="flex h-auto flex-col sm:flex-row items-center justify-center mt-8 sm:mt-16 gap-10">
              <Comparison title="GAMING"       ratio="30%"  type="0" />
              <Comparison title="BULLS VS BEARS" ratio="50%+" type="1" />
              <Comparison title="FINANCE"      ratio="25%"  type="2" />
            </div>
          </div>

          {/* Other sections */}
          <WeeklyJackpot />
          <MonthlyJackpot />
          <Benefit />
          <Affilliate />
          <AppChainInfo />
        </div>

        {/* Footer disclaimer */}
        <div className="w-full bg-black flex justify-center items-center">
          <div className="sm:w-5/6 p-10 text-[#424240]">
            <p>
              Disclaimer: This game software is fully decentralized Web3 software
              that enables players around the world to play against each other by
              predicting the bitcoin next move; do not play directly against the
              players—it enables peer‐to‐peer social pools. To play, connect your
              digital wallet or generate a fresh one via “Wallet.” The software
              never accesses your private keys; it takes commission only from
              winners. Deposit ETH into the treasury wallet that manages the
              game. All live stats come directly from the Ethereum network and
              are publicly verifiable—no spreads, no manipulation. By playing
              you accept full risk of loss. This chart is not trading advice.
              Please follow your local laws. Smart contracts are open‐source
              (link here); our backend is audited by CERTIK. Wager responsibly.
            </p>
          </div>
        </div>
      </main>

      {/* Wallet modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowWalletModal(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Your Wallet</h2>
            <div className="flex flex-col items-center space-y-2">
              {!localWallet ? (
                <>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={handleGenerate}
                  >
                    Generate Fresh Wallet
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleUnlock}
                  >
                    Unlock Wallet
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <p className="mb-2 font-medium">Your ephemeral address:</p>
                  <code className="block p-2 bg-gray-100 rounded text-xs break-all">
                    {localWallet.address}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


