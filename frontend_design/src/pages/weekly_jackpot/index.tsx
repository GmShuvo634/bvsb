import React, { useState, useEffect } from "react";
// Custom Accordion components to avoid Material Tailwind context issues
const Accordion = ({ open, children }: { open: boolean; children: React.ReactNode }) => {
  return <div className="border-b border-gray-800">{children}</div>;
};

const AccordionHeader = ({ className, onClick, children }: { className?: string; onClick: () => void; children: React.ReactNode }) => {
  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
};

const AccordionBody = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-4">{children}</div>;
};
import CountUp from "react-countup";
import clsx from "clsx";
import { getDisplayString } from "@/utils/utils";
import JackpotHeader from "@/layouts/jackpot_header";
import { getWeeklyJackpot } from "@/components/api";
import { Config } from "@/config";
import { useSelector } from "react-redux";
import Image from "next/image";
import { toast } from "sonner";

interface IconProps {
  id: number;
  open: number;
}

function Icon({ id, open }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${
        id === open ? "rotate-180" : ""
      } h-5 w-5 transition-transform text-purple-400`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

interface JackpotItemProps {
  pool: number;
  condition: number;
  players: Array<any>;
  prize: any;
}

/**
 * Weekly Jackpot
 * @param players
 * [
 *  {
 *    player: {
 *      avatar: '',
 *      address: ''
 *    },
 *    count: 1
 *  }
 * ]
 */
const JackpotItem = ({ pool, condition, players, prize }: JackpotItemProps) => {
  const [open, setOpen] = useState(0);

  const handleOpen = (value: number) => setOpen(open === value ? 0 : value);

  // Determine trophy color based on pool rank
  const getTrophyColor = () => {
    switch (pool) {
      case 1: return "text-yellow-400";
      case 2: return "text-gray-300";
      case 3: return "text-amber-700";
      default: return "text-purple-500";
    }
  };

  return (
    <Accordion open={open === 1}>
      <AccordionHeader
        className="bg-gradient-to-r from-gray-900 to-gray-800 !border-0 !py-0 cursor-pointer hover:from-gray-800 hover:to-gray-700 transition-all duration-300"
        onClick={() => handleOpen(1)}
      >
        <div className="relative w-full">
          <div className="weekly_board grid grid-cols-12 gap-2 md:gap-4 items-center p-4">
            {/* Trophy */}
            <div className="col-span-2 flex justify-center">
              <div className={`text-3xl ${getTrophyColor()}`}>
                {pool === 1 ? "🥇" : pool === 2 ? "🥈" : pool === 3 ? "🥉" : "🏆"}
              </div>
            </div>
            
            {/* Condition */}
            <div className="col-span-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Condition</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-green-400">+</span>
                <span className="text-xl font-bold text-white">{condition}</span>
                <span className="text-xs text-gray-400 hidden sm:inline">trades</span>
              </div>
            </div>
            
            {/* Players */}
            <div className="col-span-2">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Players</div>
              <div className="text-xl font-bold text-purple-400">{players.length}</div>
            </div>
            
            {/* Prize */}
            <div className="col-span-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Prize</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-yellow-400">
                  <CountUp
                    end={prize * Config.gameCoinDecimal}
                    duration={2}
                    decimals={3}
                  />
                </span>
                <span className="text-sm text-gray-300">ETH</span>
              </div>
            </div>
            
            {/* Expand Icon */}
            <div className="col-span-1 flex justify-center">
              <Icon id={1} open={open} />
            </div>
          </div>
        </div>
      </AccordionHeader>
      {open === 1 && (
        <AccordionBody>
          <div className="weekly_details bg-gray-900 rounded-lg p-4 mt-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 md:gap-4 mb-3 pb-2 border-b border-gray-700">
              <div className="col-span-1 text-xs text-gray-400 uppercase tracking-wider">#</div>
              <div className="col-span-5 text-xs text-gray-400 uppercase tracking-wider">Player</div>
              <div className="col-span-4 text-xs text-gray-400 uppercase tracking-wider">Wallet</div>
              <div className="col-span-2 text-xs text-gray-400 uppercase tracking-wider text-right">Trades</div>
            </div>
            
            {/* Players List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {players.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 md:gap-4 items-center p-2 hover:bg-gray-800 rounded transition-colors">
                  <div className="col-span-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? "bg-yellow-500 text-gray-900" : 
                      index === 1 ? "bg-gray-300 text-gray-900" : 
                      index === 2 ? "bg-amber-800 text-white" : 
                      "bg-purple-900 text-purple-200"
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="col-span-5 flex items-center gap-2">
                    <div className="relative">
                      <Image
                        src={
                          item?.player?.avatar === "" || !item?.player?.avatar
                            ? "/images/avatar-default.png"
                            : `${Config.serverUrl.avatars}${item.player.avatar}`
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-500"
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="text-sm font-medium text-white truncate">
                      {item?.player?.address ? `Player ${index + 1}` : "Unknown Player"}
                    </div>
                  </div>
                  <div className="col-span-4 text-xs text-gray-300 font-mono truncate">
                    {item?.player?.address ? getDisplayString(item.player.address, 4, 4) : "N/A"}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                      {item?.count || 0}
                    </span>
                  </div>
                </div>
              ))}
              
              {players.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No players qualified for this prize pool yet
                </div>
              )}
            </div>
          </div>
        </AccordionBody>
      )}
    </Accordion>
  );
};

export default function Home() {
  const player = useSelector((state: any) => state.globalState.player);
  const [weeklyTrades, setWeeklyTrades] = useState(0);
  const [jackpotWallet, setJackpotWallet] = useState("");
  const [endTime, setEndTime] = useState("");
  const [poolData, setPoolData] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const getWeeklyJackpotData = async () => {
      // Only fetch data if player and player.address are available
      if (!player || !player.address) {
        return;
      }
      
      try {
        const response = await getWeeklyJackpot(player.address);
        if (response?.status == 200) {
          setWeeklyTrades((response as any).data.data.myTicket);
          setJackpotWallet((response as any).data.data.address);
          setEndTime((response as any).data.data.endTime);
          setPlayers((response as any).data.data.players);
          setPoolData((response as any).data.data.pools);
        } else {
          toast.error(response?.data?.msg || "Failed to load jackpot data");
        }
      } catch (error) {
        toast.error("Failed to load jackpot data");
        console.error("Error fetching weekly jackpot data:", error);
      }
    };

    getWeeklyJackpotData();
  }, [player?.address]);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!endTime) return "";
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const difference = end - now;
    
    if (difference <= 0) return "Ended";
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Weekly Jackpot
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Compete for ETH prizes by making trades throughout the week
          </p>
        </div>
        
        {/* Player Stats Card */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 mb-8 border border-gray-700 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Your Trades</div>
              <div className="text-2xl font-bold text-purple-400">{weeklyTrades}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Jackpot Wallet</div>
              <div className="text-sm font-mono text-yellow-400 truncate">{getDisplayString(jackpotWallet, 6, 4)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Time Remaining</div>
              <div className="text-xl font-bold text-green-400">{getTimeRemaining()}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Your Position</div>
              <div className="text-xl font-bold text-blue-400">
                {player?.address && players?.length > 0 
                  ? (() => {
                      const playerIndex = players.findIndex(p => p?.player?.address === player.address);
                      return playerIndex >= 0 ? `#${playerIndex + 1}` : "Not ranked";
                    })()
                  : "Not ranked"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Prize Pools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Prize Pools</h2>
          
          {poolData.length > 0 ? (
            <div className="space-y-4">
              {poolData.map((item: any, index: number) => {
                const qualifiedPlayers = players.filter(
                  (player: any) => player.count >= item.condition
                );
                return (
                  <JackpotItem
                    key={index}
                    pool={index + 1}
                    condition={item.condition}
                    players={qualifiedPlayers}
                    prize={item.prize}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading prize pools...</p>
            </div>
          )}
        </div>
        
        {/* Info Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-purple-400">How It Works</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Make trades during the week to qualify for prize pools</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Higher trade counts unlock access to better prize pools</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Prizes are distributed at the end of each week</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Trade counts reset each week for a fresh competition</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}