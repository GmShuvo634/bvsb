'use client'

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Header from "@/layouts/header";
import ChatPanel, { ChatDataProps } from "@/layouts/chat-panel";
import { getUserTrades, getUserBets, getUserStats } from "@/components/api";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Config } from "@/config";

export default function Home() {

  const player = useSelector((state: any) => state.globalState.player);
  const { isConnected } = useAccount();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trades' | 'bets'>('trades');
  const [userStats, setUserStats] = useState<any>(null);

  // Header component state
  const [isChatView, setIsChatView] = useState(false);
  const [referralLinkData, setReferralLinkData] = useState<any[]>([]);

  // Chat functionality
  const [chatData, setChatData] = useState<ChatDataProps[]>([]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Load user stats
      const statsResponse = await getUserStats();
      if (statsResponse?.status === 200) {
        setUserStats(statsResponse.data.data);
      }

      // Load activity data based on active tab
      const response = activeTab === 'trades'
        ? await getUserTrades({ limit: 50 })
        : await getUserBets({ limit: 50 });

      if (response?.status === 200) {
        setHistoryData(response.data.data || []);
      } else {
        toast.error(response?.data?.error || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isConnected) {
      loadData();
    }
  }, [isConnected, loadData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-400';
      case 'loss': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };


  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <Header
          setChatVisible={() => setIsChatView(!isChatView)}
          setReferralLinkData={setReferralLinkData}
          isChatview={isChatView}
          hiddenChat={false}
        />

        {/* Page Title Section */}
        <div className="flex flex-col gap-4 w-full bg-[#161721] relative py-4">
          <div className="main_title">
            <div className="title_h1">MY HISTORY</div>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-2 font-semibold rounded-lg ${
                activeTab === 'trades'
                  ? 'bg-gradient-to-r from-[#ffe499] to-[#e5c869] text-black'
                  : 'border-2 border-[#e5c869] text-[#e5c869] hover:border-[#9e8130] hover:text-[#9e8130]'
              }`}
            >
              Trades
            </button>
            <button
              onClick={() => setActiveTab('bets')}
              className={`px-4 py-2 font-semibold rounded-lg ${
                activeTab === 'bets'
                  ? 'bg-gradient-to-r from-[#ffe499] to-[#e5c869] text-black'
                  : 'border-2 border-[#e5c869] text-[#e5c869] hover:border-[#9e8130] hover:text-[#9e8130]'
              }`}
            >
              Bets
            </button>
          </div>
        </div>

        {/* User Stats Summary */}
        {userStats && (
          <div className="w-full px-6 py-4 bg-[#1a1a1a] border-b border-[#b66dff]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[#fff699] text-sm">Total Bets</p>
                <p className="text-white text-lg font-bold">{userStats.totalBets}</p>
              </div>
              <div>
                <p className="text-[#fff699] text-sm">Win Rate</p>
                <p className="text-white text-lg font-bold">{userStats.winRate}</p>
              </div>
              <div>
                <p className="text-[#fff699] text-sm">Total Volume</p>
                <p className="text-white text-lg font-bold">{userStats.totalVolume?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-[#fff699] text-sm">Net Profit</p>
                <p className={`text-lg font-bold ${userStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userStats.totalProfit?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="w-full px-6 py-4 bg-[#111016] border-b border-[#b66dff]">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-2 rounded font-oswald text-sm uppercase transition-colors ${
                activeTab === 'trades'
                  ? 'bg-[#b66dff] text-white'
                  : 'bg-transparent text-[#fff699] hover:text-white'
              }`}
            >
              Trades
            </button>
            <button
              onClick={() => setActiveTab('bets')}
              className={`px-4 py-2 rounded font-oswald text-sm uppercase transition-colors ${
                activeTab === 'bets'
                  ? 'bg-[#b66dff] text-white'
                  : 'bg-transparent text-[#fff699] hover:text-white'
              }`}
            >
              Bets
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="w-full inline-block align-middle">
            <div className="overflow-auto">
              <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-[#fff699]">Loading...</div>
                </div>
              ) : (
                <table className="min-w-full bg-table overflow-y-auto">
                  <thead className="">
                    <tr className="w-full h-14 bg-[#111016] font-oswald text-base text-[#fff699] uppercase">
                      <th scope="col" className="px-6 py-4 text-center">Date</th>
                      <th scope="col" className="px-6 py-4 text-center">Amount</th>
                      <th scope="col" className="px-6 py-4 text-center">Direction</th>
                      <th scope="col" className="px-6 py-4 text-center">Result</th>
                      <th scope="col" className="px-6 py-4 text-center">Payout</th>
                      <th scope="col" className="px-6 py-4 text-center">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-neutral-black-700">
                    {historyData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-[#fff699]">
                          No {activeTab} found
                        </td>
                      </tr>
                    ) : (
                      historyData.map((item: any, index: number) => (
                        <tr
                          key={index}
                          className="w-full h-14 bg-[#111016] font-oswald text-base text-[#fff699] hover:bg-[#1a1a1a] transition-colors"
                        >
                          <td className="text-center px-6 py-2">
                            <p className="text-sm">{formatDate(item.timestamp)}</p>
                          </td>
                          <td className="text-center px-6 py-2">
                            <p>{item.amount?.toFixed(2) || '0.00'}</p>
                          </td>
                          <td className="text-center px-6 py-2">
                            <span className={`px-2 py-1 rounded text-xs uppercase ${
                              item.direction === 'up' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {item.direction || 'N/A'}
                            </span>
                          </td>
                          <td className="text-center px-6 py-2">
                            <span className={`px-2 py-1 rounded text-xs uppercase ${getResultColor(item.result)}`}>
                              {item.result || 'pending'}
                            </span>
                          </td>
                          <td className="text-center px-6 py-2">
                            <p>{item.payout?.toFixed(2) || '0.00'}</p>
                          </td>
                          <td className="text-center px-6 py-2">
                            <p className={getResultColor(item.result)}>
                              {item.balanceChange >= 0 ? '+' : ''}{item.balanceChange?.toFixed(2) || '0.00'}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel Overlay */}
      {isChatView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-4">
            <ChatPanel
              onCloseChatRoom={() => setIsChatView(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
