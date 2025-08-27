import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Config } from "@/config";
import { ChartJs2Graph, Position } from "@/components/chart-js-2-graph";
import { Icon, IconType } from "@/components/icons";
import styled, { keyframes } from "styled-components";
import { RecentProps } from "@/pages/play";
import { getDashboardData } from "@/components/api";
import { toast } from "react-toastify";

// Animations
const historyAnim = keyframes` ... `; // same as before
const HistoryAnimButton = styled.button`animation: ${historyAnim} 0.5s ease-in-out forwards;`;
const historyDetailAnim = keyframes` ... `;
const HistoryDetailAnimDiv = styled.div`animation: ${historyDetailAnim} 0.5s ease-in-out forwards;`;
const notificationAnim = keyframes` ... `;
const NotificationAnimDiv = styled.div`animation: ${notificationAnim} 8s ease-in-out forwards;`;
const alignAnim = keyframes` ... `;
const AlignAnimDiv = styled.div`animation: ${alignAnim} 8s ease-in-out forwards;`;

interface GraphPanelProps {
  ethPrices?: number[];
  btcPrices?: number[]; // backward compatibility with older prop name
  jackpot: number;
  histories: RecentProps[];
}

const graphHorizontalWidth = 60;
const typicalPriceCount = 5;
const graphVerticalRatio = Config.graphVerticalRatio;
const basicPriceCount = Config.roundTime.basic / Config.interval.priceUpdate;
const preparePriceCount = Config.roundTime.prepare / Config.interval.priceUpdate;
const playPriceCount = Config.roundTime.play / Config.interval.priceUpdate;
const refreshPriceCount = Config.roundTime.refresh / Config.interval.priceUpdate;
const maxPriceCount = basicPriceCount + preparePriceCount + playPriceCount + refreshPriceCount;

export default function GraphPanel(props: GraphPanelProps) {
  const priceDivisor = (Config as any).ethPriceDecimal ?? (Config as any).btcPriceDecimal ?? 1;
  const { ethPrices: ethPricesProp = [], btcPrices = [], jackpot, histories } = props;
  const ethPrices = ethPricesProp.length ? ethPricesProp : btcPrices;
  const [typicalPrices, setTypicalPrices] = useState<number[]>([]);
  const [liveEthPrice, setLiveEthPrice] = useState<number>(0);
  const [startEthPrice, setStartEthPrice] = useState<number>(0);
  const [dotPositions, setDotPositions] = useState<Position[]>([]);
  const [extraEthPrices, setExtraEthPrices] = useState<number[]>([]);
  const [extraDotPositions, setExtraDotPositions] = useState<Position[]>([]);
  const [lastPricePosition, setLastPricePosition] = useState<number>(graphVerticalRatio / 2);
  const [startPlayVerticalPosition, setStartPlayVerticalPosition] = useState<number>(graphVerticalRatio / 2);
  const [startPlayHorizontalPosition, setStartPlayHorizontalPosition] = useState<number>(0);
  const [playingDepth, setPlayingDepth] = useState(0);
  const [isAlertStart, setIsAlertStart] = useState(false);
  const [alertText, setAlertText] = useState<[string, string]>(["",""]);

  const [winRatio, setWinRatio] = useState(0);
  const [livePlayers, setLivePlayers] = useState(0);
  const [winsPaid, setWinsPaid] = useState(0);
  const [allTimeWinsPaid, setAllTimeWinsPaid] = useState(0);
  const [totalTrades, setTotalTrades]         = useState(0);

  const [lastMaxPrice, setLastMaxPrice] = useState(0);
  const [lastMinPrice, setLastMinPrice] = useState(0);

  // 3️⃣ Fetch dashboard stats when alert starts (with throttling to prevent infinite calls)
  const lastDashboardFetch = useRef<number>(0);
  const DASHBOARD_THROTTLE_MS = 5000; // Only fetch every 5 seconds max

  useEffect(() => {
    if (isAlertStart) {
      const now = Date.now();
      if (now - lastDashboardFetch.current > DASHBOARD_THROTTLE_MS) {
        lastDashboardFetch.current = now;
        loadDashboardStats();
      }
    }
  }, [isAlertStart]);

const loadDashboardStats = async () => {
  try {
    const resp = await getDashboardData();
    if (resp.status === 200) {
      const { trades, wins, player, paid, total } = resp.data.data;
      setTotalTrades(trades);
      setWinRatio(trades ? Number(((wins / trades) * 100).toFixed(2)) : 0);
      setLivePlayers(player);
      setWinsPaid(paid);
      setAllTimeWinsPaid(total);
    } else {
      toast.error(resp.data.error || "Error loading dashboard stats");
    }
  } catch {
    toast.error("Failed to load dashboard stats");
  }
};



  // Recalculate graph on new ETH prices
  useEffect(() => {
  // don’t run if no prices yet
  if (ethPrices.length === 0) return;

  const priceCount = ethPrices.length;
  let newMax = Math.max(...ethPrices);
  let newMin = Math.min(...ethPrices);

  // preserve previous extremes during the “play” window
  if (
    priceCount > basicPriceCount + preparePriceCount &&
    priceCount < basicPriceCount + preparePriceCount + playPriceCount &&
    lastMaxPrice !== null &&
    lastMinPrice !== null
  ) {
    newMax = lastMaxPrice;
    newMin = lastMinPrice;
  }

  setLastMaxPrice(newMax);
  setLastMinPrice(newMin);

  const standardPrice = (newMax + newMin) / 2;
  const priceOffset =
    (newMax - newMin) /
    ((graphVerticalRatio * (typicalPriceCount - 1)) / (typicalPriceCount + 1));

  // use ethPrices directly instead of a local variable
  resetLastPricePosition(standardPrice, ethPrices[priceCount - 1], priceOffset);
  resetTypicalPrices(newMax, newMin);
  resetDotPositions(ethPrices, standardPrice, priceOffset);
  checkWhilePlaying(ethPrices);
  resetAlert(priceCount);
}, [
  ethPrices,
  lastMaxPrice,
  lastMinPrice,
]);


  const resetAlert = (count: number) => {
    if (count > basicPriceCount && count < basicPriceCount + preparePriceCount) {
      setAlertText(["UP OR DOWN?", "PLACE YOUR TRADE!"]);
      setIsAlertStart(true);
    } else if (count > basicPriceCount + preparePriceCount && count < basicPriceCount + preparePriceCount + playPriceCount) {
      setAlertText(["NO MORE TRADES!", "WAIT FOR NEXT ROUND"]);
      setIsAlertStart(true);
    } else if (count > basicPriceCount + preparePriceCount + playPriceCount && count < maxPriceCount) {
      setAlertText(["DISTRIBUTING PAYOUTS", ""]);
      setIsAlertStart(true);
    } else {
      setIsAlertStart(false);
    }
  };

  const checkWhilePlaying = (prices: number[]) => {
    const len = prices.length;
    if (len <= basicPriceCount + preparePriceCount || len > maxPriceCount - Math.floor(1000 / Config.interval.priceUpdate)) {
      setPlayingDepth(0);
    } else {
      let depth = len - (basicPriceCount + preparePriceCount);
      depth = Math.min(depth, Math.floor(Config.zoomTime / Config.interval.priceUpdate));
      setPlayingDepth(depth);
    }
  };

  const resetLastPricePosition = (standard: number, lastPrice: number, offset: number) => {
    setLastPricePosition(graphVerticalRatio / 2 - (lastPrice - standard) / offset);
    setLiveEthPrice(lastPrice);
  };

  const resetTypicalPrices = (max: number, min: number) => {
    const arr: number[] = [];
    const step = (max - min) / (typicalPriceCount - 1);
    for (let i = 0; i < typicalPriceCount; i++) arr.push(min + step * i);
    setTypicalPrices(arr);
  };

  const resetDotPositions = (prices: number[], standard: number, offset: number) => {
    const count = prices.length;
    const positions: Position[] = prices.map((p, i) => ({ x: -count + i + 1, y: graphVerticalRatio / 2 + (p - standard) / offset }));
    setDotPositions(positions);

    // track start price
    const startPrice = prices[basicPriceCount + preparePriceCount];
    setStartPlayVerticalPosition(graphVerticalRatio / 2 - (startPrice - standard) / offset);
    setStartEthPrice(startPrice);

    // extra prices
    const extra = positions.slice(-basicPriceCount).map(pt => prices[prices.length - basicPriceCount + positions.indexOf(pt)]);
    setExtraEthPrices(extra);
    const extraPositions = extra.map((p, i) => ({ x: -extra.length + i + 1, y: graphVerticalRatio / 2 + (p - standard) / offset }));
    setExtraDotPositions(extraPositions);

    // horizontal start
    const displayCount = basicPriceCount;
    const horizontalOffset = graphHorizontalWidth / displayCount;
    setStartPlayHorizontalPosition((displayCount + basicPriceCount + preparePriceCount - count + 1) * horizontalOffset);
  };

  return (
    <div className="relative w-full h-full rounded-2xl border-2 border-solid border-[#ffef92] flex flex-row items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute flex flex-col w-full h-full">
        {/* ... same gradient code ... */}
      </div>

      {/* Price grid */}
      <div className="absolute flex flex-col-reverse justify-between w-full h-4/6">
        {typicalPrices.map((price, idx) => (
          <div key={idx} className="h-[1px] flex items-center gap-2 px-2">
            <div className="w-full h-[1px] bg-[#868686]" />
            <span className="text-sm text-[#e6c49e]">
              {(price / priceDivisor).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="absolute h-full top-0 left-0" style={{ width: `${graphHorizontalWidth}%` }}>
        <ChartJs2Graph dotPositions={dotPositions} playingDepth={playingDepth} color="#fff699" />
      </div>

      {/* Ticker */}
      <div className="absolute w-full h-[3px] bg-[#ffef92] flex justify-end px-1 sm:px-2" style={{ top: `calc(${(lastPricePosition * 100) / graphVerticalRatio}% - 1px)` }}>
        <div className="relative py-1 px-2 rounded-lg border border-[#fff699] bg-[#111016] flex flex-col items-center">
          <span className="absolute -top-3 bg-[#fff699] rounded-md px-2 text-xs font-bold text-[#111016] whitespace-nowrap">
            Live ETH
          </span>
          <span className="text-[#fff699] font-bold text-sm sm:text-xl">
            {ethPrices.length > 0
              ? parseFloat((liveEthPrice / priceDivisor).toString()).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
              : 'Waiting for prices...'}
          </span>
        </div>
      </div>

      {/* Start rate */}
      {playingDepth > 0 && (
        <div className="absolute w-full h-[1px] flex justify-start px-1 sm:px-2" style={{ top: `${(startPlayVerticalPosition * 100) / graphVerticalRatio}%`, transitionDuration: `${Config.interval.priceUpdate}ms` }}>
          <div className="relative py-1 px-2 rounded-lg border border-[#fff699] bg-[#111016] flex flex-col items-center">
            <span className="absolute -top-3 bg-[#fff699] rounded-md px-2 text-xs font-bold text-[#111016] whitespace-nowrap">
              Start Rate
            </span>
            <span className="text-[#fff699] font-bold text-sm sm:text-xl">
              {parseFloat((startEthPrice / priceDivisor).toString()).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
            </span>
          </div>
        </div>
      )}

      {/* Alerts and history panels ... unchanged except decimal conversions ... */}

    </div>
  );
}

// Up/down history component
const UpVsDownHistory: React.FC<{ start: number; end: number; priceDivisor: number }> = ({ start, end, priceDivisor }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex flex-col items-center">
      <HistoryAnimButton
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="border-2 rounded-lg bg-[#00000080] px-4 py-2"
      >
        <Icon
          type={IconType.UP}
          className={start > end ? "rotate-180 fill-[#ff3333]" : "fill-[#33ff6d]"}
        />
      </HistoryAnimButton>
      {show && (
        <div className="absolute bottom-14 flex flex-col items-center">
          <HistoryDetailAnimDiv className="h-32 w-28 flex flex-col items-center justify-center rounded-xl bg-[#262735]">
            <span className="text-xs text-[#777a99]">START RATE</span>
            <span className="text-base text-white">
              {(start / priceDivisor).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              })}
            </span>
            <div className="w-full h-[2px] bg-[#3f404f] my-1" />
            <span className="text-xs text-[#777a99]">END RATE</span>
            <span className={`text-base ${start < end ? "text-[#33ff6d]" : "text-[#ff3333]"}`}>
              {(end / priceDivisor).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              })}
            </span>
          </HistoryDetailAnimDiv>
        </div>
      )}
    </div>
  );
};

