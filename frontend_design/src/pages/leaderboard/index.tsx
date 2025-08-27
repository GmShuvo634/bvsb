'use client'

import React, { useState, useEffect } from "react";

import { useAccount } from "wagmi";
import LeaderboardHeader from "@/layouts/leaderboard-header";
import { balanceRequest } from "@/pages/api";
import { getLeaderboardData } from "@/components/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getDisplayString } from "@/utils/utils";

export default function Home() {
  
  const player = useSelector((state: any) => state.globalState.player);
  const { isConnected } = useAccount();
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    if (isConnected) {
      getLeaderboard("today");
    }
  }, [isConnected]);

  const getLeaderboard = async (type: string) => {
    const response = await getLeaderboardData(type);
    console.log((response as any)?.data.data);
    if (response?.status == 200) {
      setLeaderboardData((response as any)?.data.data);
    } else {
      toast.error(response?.data?.msg);
    }
  }

  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <LeaderboardHeader
          avatar={player?.avatar || ''} setSelectedItem={(item) => getLeaderboard(item)}
        />
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
                  {(Array.isArray(leaderboardData)
                    ? leaderboardData
                    : []
                  ).map((item: any, index: number) => {
                    return (
                      <tr
                        key={index}
                        className="w-full h-14 bg-[#111016] font-oswald text-base text-[#fff699]"
                      >
                        <td className="text-center px-6 py-2">
                          <p>{index+1}</p>
                        </td>
                        <td className="text-center px-6 py-2">
                          <p>{getDisplayString(item.player.address, 4, 4)}</p>
                        </td>
                        <td className="text-center px-6 py-2">
                          <p>{item.totalGames}</p>
                        </td>
                        <td className="text-center px-6 py-2">
                          <p>{item.totalWins}</p>
                        </td>
                        <td className="text-center px-6 py-2">
                          <p>{(item.totalWins / item.totalGames * 100).toFixed(2)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
