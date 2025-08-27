'use client'

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import TradeHistoryHeader from "@/layouts/trade_history_header";
import { fetchTradeHistory } from "@/components/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function Home() {
  
  const player = useSelector((state: any) => state.globalState.player);
  const { isConnected } = useAccount();
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (isConnected) {
      getTradeHistoryData();
    }
  }, [isConnected]);

  const getTradeHistoryData = async () => {
    const response = await fetchTradeHistory();
    console.log(response);
    if (response?.status == 200) {
      setHistoryData((response as any)?.data.data);
    } else {
      toast.error(response?.data?.msg);
    }
  }


  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <TradeHistoryHeader
          avatar={player?.avatar || ''}
        />
        <div className="overflow-x-auto w-full">
          <div className="w-full inline-block align-middle">
            <div className="overflow-auto">
              <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
              <table className="min-w-full bg-table overflow-y-auto">
                <thead className="">
                  <tr className="w-full h-14 bg-[#111016] font-oswald text-base text-[#fff699] uppercase">
                    <th scope="col" className="px-6 py-4 text-center">
                      <div
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <span className="cursor-pointer inline-flex items-center uppercase">
                          id
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-center">
                      <div
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <span className="cursor-pointer inline-flex items-center uppercase">
                          date
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-center">
                      <div
                        className="flex justify-center items-center cursor-pointer"
                      >
                        <span className="cursor-pointer inline-flex items-center uppercase">
                          investment
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-neutral-black-700">
                  {(Array.isArray(historyData)
                    ? historyData
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
                          <p>{item.date}</p>
                        </td>
                        <td className="text-center px-6 py-2">
                          <p>{item.earn}</p>
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
