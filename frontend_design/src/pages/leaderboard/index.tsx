'use client'

import React, { useState, useEffect } from "react";

import { useAccount } from "wagmi";
import Header from "@/layouts/header";
import { balanceRequest } from "@/pages/api";
import { getLeaderboardData } from "@/components/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getDisplayString } from "@/utils/utils";

export default function Home() {

  const player = useSelector((state: any) => state.globalState.player);
  const { isConnected } = useAccount();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Header component state
  const [isChatView, setIsChatView] = useState(false);
  const [referralLinkData, setReferralLinkData] = useState<any[]>([]);

  const getLeaderboard = React.useCallback(async (type: string) => {
    setLoading(true);
    try {
      const response = await getLeaderboardData(type);
      console.log('Leaderboard response:', response?.data);

      if (response?.status === 200) {
        setLeaderboardData(response.data.data || []);
      } else {
        toast.error(response?.data?.error || 'Failed to load leaderboard');
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
      toast.error('Failed to load leaderboard');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      getLeaderboard("today");
    }
  }, [isConnected, getLeaderboard]);

  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <Header
          setChatVisible={() => setIsChatView(!isChatView)}
          setReferralLinkData={setReferralLinkData}
          isChatview={isChatView}
          hiddenChat={true}
        />

        {/* Page Title Section */}
        <div className="flex flex-col gap-4 w-full bg-[#161721] relative py-4">
          <div className="main_title">
            <div className="title_h1">LEADERBOARD</div>
          </div>

          {/* Leaderboard Type Selector */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => getLeaderboard("today")}
              className="px-4 py-2 bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] text-black font-semibold rounded-lg"
            >
              Today
            </button>
            <button
              onClick={() => getLeaderboard("weekly")}
              className="px-4 py-2 bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] text-black font-semibold rounded-lg"
            >
              Weekly
            </button>
            <button
              onClick={() => getLeaderboard("monthly")}
              className="px-4 py-2 bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] text-black font-semibold rounded-lg"
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="w-full inline-block align-middle">
            <div className="overflow-auto">
              <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
              <table className="min-w-full bg-table overflow-y-auto">
                <thead className="">
                  <tr className="w-full h-14 bg-[#111016] font-oswald text-base text-[#fff699] uppercase">
                    <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                      <div
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <span className="cursor-pointer inline-flex items-center">
                          #
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                      <span className="cursor-pointer inline-flex items-center uppercase">
                        player
                      </span>
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                      <div
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <span className="cursor-pointer inline-flex items-center uppercase">
                          trades
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                      <div
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <span className="cursor-pointer inline-flex items-center uppercase">
                          trades wins
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                      <div
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <span className="cursor-pointer inline-flex items-center uppercase">
                          win ratio
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-neutral-black-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[#fff699]">
                        Loading leaderboard...
                      </td>
                    </tr>
                  ) : leaderboardData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[#fff699]">
                        No leaderboard data available
                      </td>
                    </tr>
                  ) : (
                    leaderboardData.map((item: any, index: number) => {
                      return (
                        <tr
                          key={index}
                          className="w-full h-14 bg-[#111016] font-oswald text-base text-[#fff699] hover:bg-[#1a1a1a] transition-colors"
                        >
                          <td className="text-center px-6 py-2">
                            <p>{index+1}</p>
                          </td>
                          <td className="text-center px-6 py-2">
                            <p>{getDisplayString(item.player?.address || item.address || 'Unknown', 4, 4)}</p>
                          </td>
                          <td className="text-center px-6 py-2">
                            <p>{item.totalGames || 0}</p>
                          </td>
                          <td className="text-center px-6 py-2">
                            <p>{item.totalWins || 0}</p>
                          </td>
                          <td className="text-center px-6 py-2">
                            <p>{item.totalGames > 0 ? ((item.totalWins / item.totalGames) * 100).toFixed(2) : '0.00'}%</p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
