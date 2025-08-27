import React, { useState, useEffect } from "react";
import Image from "next/image";
import JackpotHeader from "@/layouts/jackpot_header";
import { getMonthlyJackpot } from "@/components/api";
import { toast } from "react-toastify";
import { Config } from "@/config";
import { getDisplayString } from "@/utils/utils";
import { useSelector } from "react-redux";

export default function Home() {
  
  const player = useSelector((state: any) => state.globalState.player);
  const [participationTickets, setParticipationTickets] = useState(0);
  const [jackpotWallet, setJackpotWallet] = useState("");
  const [endTime, setEndTime] = useState("");
  const [players, setPlayers] = useState(0);
  const [prize, setPrize] = useState(0);
  const [totalTicket, setTotalTicket] = useState([]);

  useEffect(() => {
    const getMonthlyJackpotData = async () => {
      const response = await getMonthlyJackpot(player.address);
      console.log(response);
      if (response?.status == 200) {
        setParticipationTickets((response as any).data.data.myTicket);
        setJackpotWallet((response as any).data.data.address);
        setEndTime((response as any).data.data.endTime);
        setPlayers(totalTicket.length);
        setPrize((response as any).data.data.prize);
        setTotalTicket((response as any).data.data.totalTicket);
      } else {
        toast.error(response?.data?.msg);
      }
    };

    getMonthlyJackpotData();
  }, [player.address, totalTicket.length]);

  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <JackpotHeader
          avatar={player?.avatar}
          ticket={participationTickets}
          jackpotWallet={jackpotWallet}
          endTime={endTime}
        />
        <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
        <div className="monthly_jackpot_details">
          <div className="monthly_players">
            <div className="monthly_title">PLAYERS</div>
            <div className="monthly_amount">{players}</div>
          </div>
          <div className="monthly_h4">
            EVERY TRADE GIVES YOU A PARTICIPATION TICKET, MORE TRADES, MORE
            CHANCES TO WIN
            <br />
          </div>
          <div className="monthly_prize">
            <div className="monthly_title">PRIZE</div>
            <div className="monthly_amount">
              {prize === null ? 0 : prize}
            </div>
          </div>
        </div>
        <div className="line_gold"></div>
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
              <div className="title_tab">PARTICIPATION TICKETS </div>
            </div>
          </div>
        </div>
        <div className="line_gold"></div>
        <div className="main_board">
          {totalTicket.map((item: any, index: number) => {
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
                      src={item.player.avatar === "" ? "images/avatar-default.png" : Config.serverUrl.avatars + item.player.avatar}
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
    </div>
  );
}
