import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getHistory, getWinnerHistory } from "@/components/api";
import { toast } from "react-toastify";
import { Config } from "@/config";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

// Modern icons (you can replace these with your preferred icon library)
const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const Trophy = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Sparkles = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const Crown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3l4 6 5-7 5 7 4-6v18H5V3z"
    />
  </svg>
);

const Medal = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <Loader2 className="w-12 h-12 animate-spin text-[#fff699]" />
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center py-16">
    <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  </div>
);

interface WinnerCardProps {
  title: string;
  winner: {
    username: string;
    avatar: string;
  };
  prize: string | number;
  variant?: "gold" | "silver";
  icon: React.ComponentType<{ className?: string }>;
}

const WinnerCard = ({
  title,
  winner,
  prize,
  variant = "gold",
  icon: Icon,
}: WinnerCardProps) => {
  const gradients = {
    gold: "from-[#fff699] via-[#ffe4a0] to-[#e5cf8c]",
    silver: "from-[#b66dff] via-[#b656ff] to-[#9f4fff]",
  };

  const bgColors = {
    gold: "bg-gradient-to-br from-[#fff699]/10 to-[#ffe4a0]/5",
    silver: "bg-gradient-to-br from-[#b66dff]/10 to-[#b656ff]/5",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${bgColors[variant]} backdrop-blur-sm border border-white/10 p-6 group hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradients[variant]} shadow-lg`}
            >
              <Icon className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
              <p
                className={`text-2xl font-bold bg-gradient-to-r ${gradients[variant]} bg-clip-text text-transparent`}
              >
                {prize} ETH
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Image
            src={
              winner.avatar
                ? winner.avatar.startsWith("http")
                  ? winner.avatar
                  : Config.serverUrl.avatars + winner.avatar
                : "/images/avatar-default.png"
            }
            alt={winner.username}
            className="w-16 h-16 rounded-full border-2 border-white/20 shadow-xl"
            width={64}
            height={64}
          />
          <div>
            <p className="text-white font-semibold text-lg">
              {winner.username}
            </p>
            <p className="text-gray-400 text-sm">Champion</p>
          </div>
        </div>

        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl" />
      </div>
    </div>
  );
};

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  loading: boolean;
  pageTotalCount: number;
  GoToPage: (page: number) => void;
}

const HistoryModal = ({
  isOpen,
  onClose,
  data,
  loading,
  pageTotalCount,
  GoToPage,
}: HistoryModalProps) => {
  if (!isOpen) return null;

  const formatAddress = (address: string) => {
    if (!address) return "0x...";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111016] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-[#b66dff]/30">
        <div className="p-6 border-b border-[#b66dff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#fff699]" />
            <h2 className="text-2xl font-bold text-white">Winners History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200 border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                        ${
                          index === 0
                            ? "bg-gradient-to-br from-[#fff699] to-[#ffe4a0] text-black"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900"
                            : index === 2
                            ? "bg-gradient-to-br from-orange-600 to-orange-700 text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}
                        >
                          {index + 1}
                        </div>
                      </div>

                      <Image
                        src={
                          item.player?.avatar
                            ? item.player.avatar.startsWith("http")
                              ? item.player.avatar
                              : Config.serverUrl.avatars + item.player.avatar
                            : "/images/avatar-default.png"
                        }
                        alt="Winner"
                        className="w-12 h-12 rounded-full border border-white/20"
                        width={48}
                        height={48}
                      />

                      <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                            Date
                          </p>
                          <p className="text-white font-medium">
                            {formatDate(item.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                            Winner
                          </p>
                          <p className="text-white font-medium">
                            {item.player?.username || "Anonymous"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                            Wallet
                          </p>
                          <p className="text-white font-mono text-sm">
                            {formatAddress(
                              item.wallet || item.player?.address || "0x..."
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                            Type
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            item.jackpot === "Monthly"
                              ? "bg-[#fff699]/20 text-[#fff699]"
                              : "bg-[#b66dff]/20 text-[#b66dff]"
                          }`}
                          >
                            {item.jackpot}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                            Prize
                          </p>
                          <p className="text-[#fff699] font-bold">
                            {item.prize || item.award} ETH
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[#fff699]">
                  No winners data available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ModernWinnersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthAward, setMonthAward] = useState<any>(null);
  const [weekAward, setWeekAward] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pageTotalCount, setPageTotalCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const getWinners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getHistory();
        console.log("Winners response:", response);

        if (response?.status === 200) {
          const data = response.data.data;
          setMonthAward(data.monthAward);
          setWeekAward(data.weekAward);
        } else {
          const errorMsg = response?.data?.msg || "Failed to load winners data";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err) {
        const errorMsg = "Failed to connect to server";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error fetching winners:", err);
      } finally {
        setLoading(false);
      }
    };

    getWinners();
  }, []);

  const getWinnerHistoryData = async (currentPageNum: number) => {
    try {
      setHistoryLoading(true);
      const response = await getWinnerHistory(currentPageNum);
      console.log("Winners history response:", response);

      if (response?.status === 200) {
        const data = response.data.data;
        setHistoryData(data.data || []);
        setPageTotalCount(Math.ceil(data.page_total / data.page_count));
      } else {
        const errorMsg =
          response?.data?.msg || "Failed to load winners history";
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("Failed to load winners history");
      console.error("Error fetching winners history:", err);
    } finally {
      setHistoryLoading(false);
    }
    setShowHistory(true);
  };

  const handleShowHistory = () => {
    getWinnerHistoryData(0);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-[#fff699]/10 hover:bg-[#fff699]/20 border border-[#fff699]/30 rounded-lg text-[#fff699] transition-all duration-200 hover:scale-105"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#fff699]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#b66dff]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fff699]/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#fff699]" />
            <span className="text-[#fff699] text-sm font-semibold uppercase tracking-wider">
              Jackpot Champions
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-[#fff699] via-[#ffe4a0] to-[#e5cf8c] bg-clip-text text-transparent">
            Winners Showcase
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Celebrating our biggest winners and their incredible prizes
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {/* Winner Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              {monthAward && (
                <WinnerCard
                  title="MONTHLY CHAMPION"
                  winner={monthAward.player}
                  prize={monthAward.prize}
                  variant="gold"
                  icon={Crown}
                />
              )}
              {weekAward && (
                <WinnerCard
                  title="WEEKLY CHAMPION"
                  winner={weekAward.player}
                  prize={weekAward.prize}
                  variant="silver"
                  icon={Medal}
                />
              )}
            </div>

            {/* History Button */}
            <div className="flex justify-center">
              <button
                onClick={handleShowHistory}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#fff699] to-[#ffe4a0] rounded-xl font-bold text-gray-900 shadow-2xl hover:shadow-[#fff699]/25 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-3">
                  <Trophy className="w-5 h-5" />
                  View Winners History
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </>
        )}

        {/* History Modal */}
        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          data={historyData}
          loading={historyLoading}
          pageTotalCount={pageTotalCount}
          GoToPage={(page: number) => getWinnerHistoryData(page)}
        />
      </div>
    </div>
  );
}
