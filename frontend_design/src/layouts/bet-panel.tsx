import React, { useEffect } from "react";
import { Avatar, PlayerProps } from "@/components/avatar";
import { Icon, IconType } from "@/components/icons";
import styled, { keyframes } from "styled-components";
import { RoundResultProps } from "@/pages/play";
import { soundService } from "@/services/soundService";

const appearAvatar = keyframes`
  0% {
    transform: scale(1.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const AppearAvatarDiv = styled.div<{}>`
  animation: ${appearAvatar} 0.5s ease-in-out forwards;
`;

const zoomText = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const ZoomTextDiv = styled.div`
  animation: ${zoomText} 1s ease-in-out infinite;
`;

interface BetPanelProps {
  isUpPool: boolean;
  players: PlayerProps[];
  className?: string;
  bet: (isUpPool: boolean) => void;
  isBettable: boolean;
  isResultReady: boolean;
  roundResult: RoundResultProps;
  isChatView: boolean;
  treasuryTotal?: number;
}

export default function BetPanel(props: BetPanelProps) {
  // Play sound effects when round results are ready
  useEffect(() => {
    if (props.isResultReady && props.roundResult) {
      const isWinner = props.isUpPool
        ? props.roundResult.isUpPoolWin
        : !props.roundResult.isUpPoolWin;

      // Play win or lose sound based on result
      soundService.handleTradeResult(isWinner);
    }
  }, [props.isResultReady, props.roundResult, props.isUpPool]);

  return (
    <div
      className={`${props.className} relative w-1/2 h-full bg-gradient-to-t ${
        props.isUpPool ? "from-[#00a06b]" : "from-[#9e0000]"
      } to-[#00000000] min-w-[190px] p-3 sm:p-5 flex flex-col-reverse gap-5 ${
        props.isChatView ? "xl:max-w-xs xl:flex-col" : "lg:max-w-xs lg:flex-col"
      }`}
    >
      <div
        className={`w-full h-full rounded-xl bg-[#14141c] flex flex-col p-3 sm:p-5 gap-5 border border-solid ${
          props.isUpPool ? "border-[#4dff95]" : "border-[#ff5050]"
        }`}
      >
        <div
          className={`w-full h-28 min-h-[90px] bg-[#1e1e2d] rounded-xl flex flex-col items-center justify-center gap-2 px-3 border border-solid ${
            props.isUpPool ? "border-[#4dff95]" : "border-[#ff5050]"
          }`}
        >
          <span
            className={`${
              props.isUpPool ? "text-[#2dffb5]" : "text-[#ff1616]"
            } text-base sm:text-xl font-bold leading-4 sm:leading-5 font-oswald text-center`}
          >
            {props.isUpPool ? "UP POOL TREASURY" : "DOWN POOL TREASURY"}
          </span>
          <div
            className={`w-full h-[2px] bg-gradient-to-r from-transparent ${
              props.isUpPool ? "via-[#2dffb5]" : "via-[#ff1616]"
            } to-transparent`}
          />
          <div
            className={`w-full flex items-center justify-between ${
              props.isUpPool ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div className="flex flex-row items-center gap-1">
              <Icon
                type={IconType.ETH_COIN}
                className="fill-[#111016] w-4 h-4 bg-[#fff699] rounded-full sm:w-5 sm:h-5"
              />
              <span className="font-oswald font-bold text-xl sm:text-2xl leading-6 text-[#fff699]">
                {(props.treasuryTotal != null
                  ? props.treasuryTotal
                  : props.players.reduce((sum, player) => sum + player.bettedBalance, 0)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
            <div className="flex flex-row items-center gap-1">
              <Icon
                type={IconType.USER}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  props.isUpPool ? "fill-[#2dffb5]" : "fill-[#ff1616]"
                }`}
              />
              <span
                className={`font-oswald font-bold text-xl sm:text-2xl leading-6 ${
                  props.isUpPool ? "text-[#2dffb5]" : "text-[#ff1616]"
                }`}
              >
                {props.players.length}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`relative w-full h-full min-h-[160px] border border-solid bg-[#171726] rounded-xl p-4 flex flex-row items-start overflow-hidden ${
            props.isUpPool
              ? "justify-end rounded-bl-none border-[#4dff95]"
              : "justify-start rounded-br-none border-[#ff5050]"
          }`}
        >
          <div
            className={`absolute opacity-50 bottom-0 w-5/6 h-full bg-contain bg-no-repeat ${
              props.isUpPool
                ? "bg-[url(/images/home/BULL-p-500.png)] left-0 bg-left-bottom"
                : "bg-[url(/images/home/BEAR-p-500.png)] right-0 bg-right-bottom"
            }`}
          />
          <div
            className={`flex ${
              props.isUpPool ? "flex-row-reverse" : "flex-row"
            } gap-2 flex-wrap`}
          >
            {props.players?.length > 0 &&
              props.players.map((item, index) => (
                <AppearAvatarDiv key={index}>
                  <Avatar
                    avatar={item.avatar}
                    country={item.country}
                    bettedBalance={item.bettedBalance}
                    isUpPool={item.isUpPool}
                  />
                </AppearAvatarDiv>
              ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          soundService.playButtonClick();
          props.bet(props.isUpPool);
        }}
        disabled={!props.isBettable}
        className={`Button-root w-full h-[50px] rounded-xl border-2 border-solid flex flex-row items-center justify-center transition-all ease-in-out duration-300 left-right ${
          !props.isBettable ? "filter grayscale-[80%]" : "filter grayscale-0"
        } ${
          props.isUpPool
            ? "border-[#0eff76] hover:border-[#9affc6] bg-gradient-to-r from-[#00614a] to-[#00ec97]"
            : "border-[#ff0e0e] hover:border-[#ffabab] bg-gradient-to-r from-[#ec0000] to-[#6c0002]"
        }`}
      >
        <Icon
          type={IconType.UP}
          className={`w-6 fill-white opacity-70 ${
            !props.isUpPool && "rotate-180"
          }`}
        />
      </button>
      {props.isResultReady && props.roundResult && (
        <div
          className={`absolute top-0 left-0 flex flex-row items-start justify-center w-full h-full backdrop-blur-sm bg-[#00000080]  overflow-hidden ${
            props.isChatView
              ? "xl:items-center xl:backdrop-blur-0 xl:bg-transparent"
              : "lg:items-center lg:backdrop-blur-0 lg:bg-transparent"
          }`}
        >
          <ZoomTextDiv className="flex flex-col items-center w-full py-5">
            <span
              className={`text-center font-oswald text-4xl sm:text-6xl !leading-tight ${
                props.isUpPool ? "text-[#2dffb5]" : "text-[#ff1616]"
              }`}
            >
              {props.isUpPool
                ? props.roundResult.isUpPoolWin
                  ? props.roundResult.winnerCount
                  : props.roundResult.loserCount
                : !props.roundResult.isUpPoolWin
                ? props.roundResult.winnerCount
                : props.roundResult.loserCount}
              <br />
              {props.isUpPool
                ? props.roundResult.isUpPoolWin
                  ? "WINNERS"
                  : "LOSERS"
                : !props.roundResult.isUpPoolWin
                ? "WINNERS"
                : "LOSERS"}
              <br />
              {(props.isUpPool
                ? props.roundResult.isUpPoolWin
                  ? props.roundResult.winAmount
                  : 0
                : !props.roundResult.isUpPoolWin
                ? props.roundResult.winAmount
                : 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
          </ZoomTextDiv>
        </div>
      )}
    </div>
  );
}
