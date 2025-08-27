import React from "react";

export default function LeaderboardPanel() {
  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <span className="font-oswald text-[#fff699] text-xl">LEADERBOARD</span>
      <div className="flex flex-col items-center w-full">
        <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
        <div className="w-full h-14 bg-[#111016] flex flex-row items-center justify-between font-oswald text-base text-[#fff699]">
          <div />
          <div className="px-4">
            <span>#</span>
          </div>
          <div className="w-[1px] h-full bg-gradient-to-t from-[#00000000] via-[#b66dff] to-[#00000000]" />
          <div className="px-4">
            <span>PLAYER</span>
          </div>
          <div className="w-[1px] h-full bg-gradient-to-t from-[#00000000] via-[#b66dff] to-[#00000000]" />
          <div className="px-4">
            <span>TRADES</span>
          </div>
          <div className="w-[1px] h-full bg-gradient-to-t from-[#00000000] via-[#b66dff] to-[#00000000]" />
          <div className="px-4">
            <span>TRADE WINS</span>
          </div>
          <div className="w-[1px] h-full bg-gradient-to-t from-[#00000000] via-[#b66dff] to-[#00000000]" />
          <div className="px-4">
            <span>WIN RATIO</span>
          </div>
          <div className="w-[1px] h-full bg-gradient-to-t from-[#00000000] via-[#b66dff] to-[#00000000]" />
          <div className="px-4">
            <span>NFT PROFIT</span>
          </div>
          <div />
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
      </div>
    </div>
  );
}
