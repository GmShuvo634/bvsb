"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
// import AnimatedNumber from "react-animated-number";
import CountUp from "react-countup";
import clsx from "clsx";
import { getDisplayString } from "@/utils/utils";
import JackpotHeader from "@/layouts/jackpot_header";
import { toast } from "sonner";
import { Config } from "@/config";
import { useSelector } from "react-redux";
import { getWeeklyJackpot } from "@/components/api";

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
      className={`${id === open ? "rotate-180" : ""
        } h-5 w-5 transition-transform text-gray-400`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

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

  return (
    <Accordion open={open === 1}>
      <AccordionHeader
        className="bg-[#09080b] !border-0 !py-0 cursor-pointer"
        onClick={() => handleOpen(1)}
      >
        <div className="relative w-full">
          <div className="weekly_board">
            <div
              className={clsx(
                pool === 1
                  ? "trophy_1"
                  : pool === 2
                    ? "trophy_2"
                    : pool === 3
                      ? "trophy_3"
                      : pool === 4
                        ? "trophy_4"
                        : "trophy_5"
              )}
            ></div>
            <div className="condition_entry">
              <div className="title_tab">CONDITION</div>
              <div className="condition">
                <div className="title_tab_2">{"+" + condition}</div>
                <div className="condition_title_3">
                  <div className="title_tab_3">WEEKLY</div>
                  <div className="title_tab_3">TRADES</div>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex participate_entry">
              <div className="title_tab">PARTICIPATE FROM</div>
              <div className="trade_title">
                <div className="title_tab_2">{"+" + condition}</div>
                <div className="title_tab_4">TRADES</div>
              </div>
            </div>
            <div className="players_entry">
              <div className="title_tab">PLAYERS</div>
              <div className="players_title">
                <div className="title_tab_2">{players.length}</div>
              </div>
            </div>
            <div className="prize_entry">
              <div className="title_tab">PRIZE</div>
              <div className="players_title">
                <div className="eth_prize">
                  <CountUp end={prize * Config.gameCoinDecimal} duration={1} decimals={3} />
                  {/* <AnimatedNumber
                    component="text"
                    initialValue={0}
                    value={35}
                    stepPrecision={0}
                    style={{
                      transition: "2.8s ease-out",
                    }}
                    duration={5000}
                    formatValue={(n: number) =>
                      Intl.NumberFormat("en-US").format(n)
                    }
                  /> */}
                  {` `}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-4">
              <Icon id={1} open={open} />
            </div>
          </div>
        </div>
      </AccordionHeader>
      {open === 1 && (
        <AccordionBody>
          <div className="weekly_details">
            <div className="monthly_board_title">
              <div className="monthly_order">
                <div className="block_title_tab">
                  <div className="title_tab">#</div>
                </div>
              </div>
              <div className="separator"></div>
              <div className="monthly_player w-[25%] sm:w-[8%]">
                <div className="title_tab">PLAYER</div>
              </div>
              <div className="separator"></div>
              <div className="monthly_wallet">
                <div className="block_title_tab">
                  <div className="title_tab">WALLET</div>
                </div>
              </div>
              <div className="separator"></div>
              <div className="monthly_participation">
                <div className="block_title_tab">
                  <div className="title_tab">TRADES</div>
                </div>
              </div>
            </div>
            <div>
              {players.map((item, index) => {
                return (
                  <div key={index} className="monthly_board">
                    <div className="monthly_order_entry">
                      <div className="block_title_tab">
                        <div className="entry">{index + 1}</div>
                      </div>
                    </div>
                    <div className="ml-2 w-[25%] sm:w-[8%]">
                      <div className="pfp">
                        <Image
                          src={
                            item.player.avatar === ""
                              ? "images/avatar-default.png"
                              : Config.serverUrl.avatars + item.player.avatar
                          }
                          alt="User Avatar"
                          className="profil_pic rounded-full"
                          width={40}
                          height={40}
                        />
                      </div>
                    </div>
                    <div className="monthly_wallet_entry">
                      <div className="block_title_tab">
                        <div className="wallet_board">{getDisplayString(item.player.address, 4, 4)}</div>
                      </div>
                    </div>
                    <div className="monthly_participation">
                      <div className="block_title_tab">
                        <div className="entry">{item.count}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
  const [poolData, setPoolData] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const getWeeklyJackpotData = async () => {
      const response = await getWeeklyJackpot(player.address);
      console.log(response);
      if (response?.status == 200) {
        setWeeklyTrades((response as any).data.data.myTicket);
        setJackpotWallet((response as any).data.data.address);
        setEndTime((response as any).data.data.endTime);
        setPlayers((response as any).data.data.players);
        setPoolData((response as any).data.data.pools);
      } else {
        toast.error(response?.data?.msg);
      }
    };

    getWeeklyJackpotData();
  }, [player.address]);

  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <JackpotHeader
          avatar={player?.avatar || ''}
          ticket={weeklyTrades}
          jackpotWallet={jackpotWallet}
          endTime={endTime}
        />
        <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
        {poolData.map((item: any, index: number) => {
          return (
            <JackpotItem
              key={index}
              pool={index + 1}
              condition={item.condition}
              players={players.filter(
                (item: any) => item.count >= item.condition
              )}
              prize={item.prize}
            />
          );
        })}
      </div>
    </div>
  );
}