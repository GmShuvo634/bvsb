import React, { useState, useEffect } from "react";
import { TimerGraph } from "@/components/timer-graph";
import { Config } from "@/config";
import { PlayerProps } from "@/components/avatar";

const basicPriceCount = Config.roundTime.basic / Config.interval.priceUpdate;
const preparePriceCount =
  Config.roundTime.prepare / Config.interval.priceUpdate;
const playPriceCount = Config.roundTime.play / Config.interval.priceUpdate;
const refreshPriceCount =
  Config.roundTime.refresh / Config.interval.priceUpdate;
const maxPriceCount =
  basicPriceCount + preparePriceCount + playPriceCount + refreshPriceCount;

interface CustomStatusProps {
  isUpPool: boolean;
  investment: number;
  potential: number;
  payout: number;
}

const CustomStatus: React.FC<CustomStatusProps> = (props) => {
  return (
    <div
      className={`w-full flex ${
        props.isUpPool
          ? "flex-col-reverse md:flex-row-reverse items-start"
          : "flex-col-reverse md:flex-row items-end"
      } md:items-center md:justify-between gap-2`}
    >
      <div
        className={`flex flex-col ${
          props.isUpPool
            ? "items-start md:items-end"
            : "items-end md:items-start"
        } gap-1`}
      >
        <span
          className={`${
            props.isUpPool ? "text-[#bbffdb]" : "text-[#ffbbbc]"
          } font-open-sans text-[10px] font-bold leading-[10px]`}
        >
          {props.isUpPool ? "UP POOL PAYOUT" : "DOWN POOL PAYOUT"}
        </span>
        <span
          className={`${
            props.isUpPool ? "text-[#2dffb5]" : "text-[#ff1616]"
          } font-oswald text-4xl sm:text-[50px] font-bold leading-9 sm:leading-[50px]`}
        >
          {Math.floor(props.payout)}%
        </span>
      </div>
      <div className="flex flex-row items-end gap-2 md:flex-col">
        <div
          className={`flex flex-col ${
            props.isUpPool ? "items-start" : "items-end"
          } gap-1`}
        >
          <span
            className={`${
              props.isUpPool ? "text-left" : "text-right"
            } text-[#9395b2] font-open-sans font-bold text-[8px] leading-[8px]`}
          >
            YOUR INVESTMENT
          </span>
          <span className="text-[#fff699] font-oswald text-2xl font-bold leading-6">
            {props.investment.toFixed(1)}
          </span>
        </div>
        <div
          className={`flex flex-col ${
            props.isUpPool ? "items-start" : "items-end"
          } gap-1`}
        >
          <span
            className={`${
              props.isUpPool ? "text-left" : "text-right"
            } text-[#9395b2] font-open-sans font-bold text-[8px] leading-[8px]`}
          >
            POTENTIAL RETURN
          </span>
          <span className="text-[#fff699] font-oswald text-2xl font-bold leading-6">
            {props.potential.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

interface GameStatusProps {
  address: string | undefined;
  priceCount: number;
  bettedBalance: number;
  players: PlayerProps[];
}

const fee = Config.fee;

export default function GameStatus(props: GameStatusProps) {
  const { address, priceCount, bettedBalance, players } = props;

  const [upPotentialReturn, setUpPotentialReturn] = useState(0);
  const [downPotentialReturn, setDownPotentialReturn] = useState(0);

  useEffect(() => {
    let upt = players
      .filter((player) => player.isUpPool && player.address !== address)
      .reduce((sum, player) => sum + player.bettedBalance, 0);

    let dpt = players
      .filter((player) => !player.isUpPool && player.address !== address)
      .reduce((sum, player) => sum + player.bettedBalance, 0);

    // console.log("GameStatus useEffect log - 1 : ", upt, dpt);

    setUpPotentialReturn(
      (upt + bettedBalance + (dpt - dpt * fee)) /
        ((upt + bettedBalance) / bettedBalance)
    );
    setDownPotentialReturn(
      (dpt + bettedBalance + (upt - upt * fee)) /
        ((dpt + bettedBalance) / bettedBalance)
    );
  }, [address, players, bettedBalance]);

  return (
    <div className="relative w-full h-[108px] md:h-[85px] flex flex-row items-start justify-between md:gap-5">
      <CustomStatus
        isUpPool={true}
        investment={bettedBalance}
        potential={upPotentialReturn}
        payout={(upPotentialReturn * 100) / bettedBalance}
      />
      <div className="absolute md:relative min-w-[144px] h-full top-0 md:top-auto left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 flex flex-row justify-center">
        <div className="absolute top-8 w-32 h-32 sm:w-36 sm:h-36 bg-gradient-to-b from-[#202230] to-[#181923] rounded-full">
          <TimerGraph
            maxTime={
              priceCount < basicPriceCount + preparePriceCount
                ? Math.floor(Config.roundTime.prepare / 1000)
                : Math.floor(Config.roundTime.play / 1000)
            }
            time={
              priceCount < basicPriceCount + preparePriceCount
                ? Math.floor(
                    ((basicPriceCount + preparePriceCount - priceCount) *
                      Config.interval.priceUpdate) /
                      1000 +
                      1
                  )
                : Math.floor(
                    ((maxPriceCount - refreshPriceCount - priceCount) *
                      Config.interval.priceUpdate) /
                      1000 +
                      1
                  )
            }
            isPaying={
              priceCount > maxPriceCount - refreshPriceCount ? true : false
            }
          />
        </div>
      </div>
      <CustomStatus
        isUpPool={false}
        investment={bettedBalance}
        potential={downPotentialReturn}
        payout={(downPotentialReturn * 100) / bettedBalance}
      />
    </div>
  );
}
