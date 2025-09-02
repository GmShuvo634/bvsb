import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Icon, IconType } from "@/components/icons";
import { Drawer, DrawerPosition } from "@/components/drawer";
import { useAccount, useDisconnect } from "wagmi";
import { Config } from "@/config";
import { getDisplayString } from "@/utils/utils";
import { userDisconnect } from "@/components/api";
import { toast } from "sonner";

interface JackpotHeaderProps {
  avatar: string;
  ticket: number;
  jackpotWallet: string;
  endTime: string;
}

export default function JackpotHeader(props: JackpotHeaderProps) {
  const { avatar, ticket, jackpotWallet, endTime } = props;

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const [files, setFiles] = useState<FileList | null>();
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const fileUpload = useRef(null);

  const Ref = useRef(null);

  // The state for our timer
  const [timer, setTimer] = useState("00:00:00:00");

  const getTimeRemaining = (e: any) => {
    const total = Date.parse(e) - Date.parse(new Date() as any);
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor(total / 1000 / 60 / 60 / 24);
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (e: any, id: any) => {
    let { total, days, hours, minutes, seconds } = getTimeRemaining(e);
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0)
      clearInterval(id);

    if (total >= 0) {
      // update the timer
      // check if less than 10 then we need to
      // add '0' at the beginning of the variable
      setTimer(
        (days > 9 ? days : "0" + days) +
        ":" +
        (hours > 9 ? hours : "0" + hours) +
        ":" +
        (minutes > 9 ? minutes : "0" + minutes) +
        ":" +
        (seconds > 9 ? seconds : "0" + seconds)
      );
    }
  };

  const clearTimer = (e: any) => {
    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next

    // If you try to remove this line the
    // updating of timer Variable will be
    // after 1000ms or 1sec
    const id = setInterval(() => {
      startTimer(e, id);
    }, 1000);
  };

  const getDeadTime = (endTime: string) => {
    let deadline = new Date();
    // This is where you need to adjust if
    // you entend to add more time
    deadline.setSeconds(
      deadline.getSeconds() +
      Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)
    );
    return deadline;
  };

  useEffect(() => {
    if (endTime !== "") clearTimer(getDeadTime(endTime));
  }, [endTime, clearTimer]);

  useEffect(() => {
    if (files && files?.length > 0) {
      setUploadedImageUrl(URL.createObjectURL(files[0]));
    }
  }, [files]);

  return (
    <div className="flex flex-col gap-4 w-full bg-[#161721] relative !py-4 header_weekly_main">
      <div className="relative z-20 flex flex-row justify-between w-full px-2 sm:px-8">
        <div className="flex items-center gap-2 uppercase w-1/3">
          <Link
            href={
              router.pathname === "/jackpot_winners"
                ? "/weekly_jackpot"
                : "/play"
            }
            className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
          >
            <Image
              src="images/home/arrow_left.svg"
              alt="Arrow Left"
              className="w-5 h-5"
              width={20}
              height={20}
            />
          </Link>
          <Link
            href="/faq"
            className="hidden sm:flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
          >
            faq
          </Link>
          {router.pathname !== "/jackpot_winners" && (
            <Link
              href="/jackpot_winners"
              className="hidden sm:flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
            >
              <Image
                src="images/home/history.svg"
                alt="History"
                className="w-5 h-5"
                width={20}
                height={20}
              />
            </Link>
          )}
        </div>
        <div className="main_title w-1/3">
          {router.pathname === "/weekly_jackpot" ? (
            <div className="title_h1">WEEKLY JACKPOT</div>
          ) : router.pathname === "/monthly_jackpot" ? (
            <div className="title_h1">MONTHLY JACKPOT</div>
          ) : (
            <div className="title_h1">WINNERS</div>
          )}
        </div>
        <div className="flex gap-4 justify-end w-1/3">
          {router.pathname === "/weekly_jackpot" ? (
            <Link
              href="/monthly_jackpot"
              className="hidden sm:flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] px-4 h-[35px] uppercase"
            >
              monthly jackpot
            </Link>
          ) : (
            <Link
              href="/weekly_jackpot"
              className="hidden sm:flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] px-4 h-[35px] uppercase"
            >
              weekly jackpot
            </Link>
          )}
          {isConnected && (
            <button
              onClick={() => {
                setIsOpenMenu(true);
              }}
            >
              <Icon
                type={IconType.MENU}
                className="!w-5 !h-5 fill-[#e5c869] hover:fill-[#9e8130]"
              />
            </button>
          )}
        </div>
      </div>
      {router.pathname === "/jackpot_winners" && (
        <div className="winners_sub">{new Date().toDateString()}</div>
      )}
      {router.pathname === "/weekly_jackpot" && (
        <>
          <div className="sm:hidden flex items-center justify-center">
            <div className="profil_jackpot">
              <Image
                src="images/avatar-default.png"
                alt="Avatar"
                className="profil_pic"
                width={80}
                height={80}
              />
            </div>
          </div>
          <div className="sub_header">
            <div className="hidden sm:flex items-center">
              <div className="profil_jackpot">
                <Image
                  src="images/avatar-default.png"
                  alt="Avatar"
                  className="profil_pic"
                  width={80}
                  height={80}
                />
              </div>
            </div>
            <div className="sub_div_2">
              <div className="tickets">
                <div className="weekly_title">
                  <div className="text-xs weekly_trade sm:text-[25px]">{ticket}</div>
                </div>
              </div>
              <div className="text-xs sub_title sm:text-base">YOUR WEEKLY TRADES</div>
            </div>
            <div className="sub_div_2">
              <div className="tickets">
                <div className="wallet">
                  <div className="text-xs wallet_number sm:text-[25px] underline cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(jackpotWallet ? jackpotWallet : "");
                    }}>
                    {getDisplayString(jackpotWallet, 4, 4)}
                  </div>
                </div>
              </div>
              <div className="text-xs sub_title sm:text-base">JACKPOT WALLET</div>
            </div>
            <div className="sub_div_2">
              <div className="tickets">
                <div className="ticket_icon">
                  <Image className="w-6 h-6 sm:w-8 sm:h-8" src="images/home/timer.svg" alt="Timer" width={32} height={32} />
                </div>
                <div className="text-xs tickets_number sm:text-[25px]">{timer}</div>
              </div>
              <div className="text-xs sub_title sm:text-base">ENDING IN</div>
            </div>
          </div>
        </>
      )}
      {router.pathname === "/monthly_jackpot" && (
        <>
          <div className="sm:hidden flex items-center justify-center">
            <div className="profil_jackpot">
              <Image
                src="images/avatar-default.png"
                alt="Avatar"
                className="profil_pic"
                width={80}
                height={80}
              />
            </div>
          </div>
          <div className="sub_header">
            <div className="hidden sm:flex items-center">
              <div className="profil_jackpot">
                <Image
                  src="images/avatar-default.png"
                  alt="Avatar"
                  className="profil_pic"
                  width={80}
                  height={80}
                />
              </div>
            </div>
            <div className="sub_div_2">
              <div className="tickets">
                <div className="ticket_icon">
                  <Image className="w-6 h-6 sm:w-8 sm:h-8" src="images/home/ticket.svg" alt="Ticket" width={32} height={32} />
                </div>
                <div className="text-xs tickets_number sm:text-[25px]">{ticket}</div>
              </div>
              <div className="text-sm sub_title sm:text-base">YOUR PARTICIPATION TICKETS</div>
            </div>
            <div className="sub_div_2">
              <div className="tickets">
                <div className="wallet">
                  <div className="text-xs wallet_number sm:text-[25px] underline cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(jackpotWallet ? jackpotWallet : "");
                    }}>
                    {getDisplayString(jackpotWallet, 4, 4)}
                  </div>
                </div>
              </div>
              <div className="text-sm sub_title sm:text-base">JACKPOT WALLET</div>
            </div>
            <div className="sub_div_2">
              <div className="tickets">
                <div className="ticket_icon">
                  <Image className="w-6 h-6 sm:w-8 sm:h-8" src="images/home/timer.svg" alt="Timer" width={32} height={32} />
                </div>
                <div className="text-xs tickets_number sm:text-[25px]">{timer}</div>
              </div>
              <div className="text-sm sub_title sm:text-base">ENDING IN</div>
            </div>
          </div>
        </>
      )}
      <Drawer
        isOpen={isOpenMenu}
        position={DrawerPosition.RIGHT}
        onClose={() => {
          setIsOpenMenu(false);
        }}
      >
        <div className="w-60 p-5 h-screen bg-[#202230] flex flex-col items-center gap-3 overflow-auto">
          <div className="flex flex-col items-center w-full gap-2">
            {isConnected && (
              <div
                className="relative border-2 border-solid border-[#fff699] w-36 h-36 aspect-square rounded-full cursor-pointer overflow-hidden"
                onClick={() => {
                  fileUpload.current &&
                    (fileUpload.current as HTMLInputElement).click();
                }}
              >
                {uploadedImageUrl ? (
                  <Image alt="Uploaded Avatar" src={uploadedImageUrl} className="w-full h-full" width={144} height={144} />
                ) : (
                  <Image
                    alt="Default Avatar"
                    src={
                      avatar
                        ? `${Config.serverUrl.avatars}${avatar}`
                        : "/images/avatar-default.png"
                    }
                    className="w-full h-full"
                    width={144}
                    height={144}
                  />
                )}
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  ref={fileUpload}
                  onChange={(e) => {
                    setFiles(e.target.files);
                  }}
                />
              </div>
            )}

            {isConnected && (
              <div className="flex flex-row items-center gap-2">
                <span className="text-[#fff699] font-open-sans text-xl">{`${address?.slice(
                  0,
                  4
                )}...${address?.slice(-4)}`}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(address ? address : "");
                  }}
                >
                  <Icon
                    type={IconType.COPY}
                    className="fill-[#fff699] hover:fill-[#e0e0e0] w-5 h-5 transition-all ease-in-out duration-500"
                  />
                </button>
              </div>
            )}
            {isConnected && (
              <div className="flex flex-row items-center w-full gap-3">
                <button
                  onClick={() => {
                    userDisconnect().then((response) => {
                      if (response?.status == 200) {
                        disconnect();
                      } else {
                        toast.error(response?.data?.msg);
                      }
                    });
                  }}
                  className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]"
                >
                  DISCONNECT
                </button>
              </div>
            )}
          </div>
          {isConnected && <div className="w-full h-[2px] bg-[#e5c869]" />}
          <div className="flex w-full lg:hidden">
            <button className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]" onClick={() => router.push("/share")}>
              AFFILIATES
            </button>
          </div>
          <div className="flex w-full lg:hidden">
            <button className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]" onClick={() => router.push("/dashboard")}>
              WINNERS
            </button>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4">
              <p className="text-[#e5c869] text-2xl">Leaderboard</p>
              <Link href="/leaderboard" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                Top Winners
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-[#e5c869] text-2xl">My Activity</p>
              <Link href="/trade_history" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                Trades History
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-[#e5c869] text-2xl">Referral Program</p>
              <div className="flex flex-col gap-2">
                <Link href="/share" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                  Link Manager
                </Link>
                <Link href="/dashboard" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                  Dashboard
                </Link>
                <Link href="/share_report" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                  Earnings Report
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-[#e5c869] text-2xl">Jackpot</p>
              <div className="flex flex-col gap-2">
                <Link href="/weekly_jackpot" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                  Weekly Jackpot
                </Link>
                <Link href="/monthly_jackpot" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                  Monthly Jackpot
                </Link>
                <Link href="/jackpot_winners" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                  History
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-[#e5c869] text-2xl">Info</p>
              <div className="flex flex-col gap-2">
                <Link href="/faq" className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]">
                  FAQ
                </Link>
                <button
                  className="border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-full h-[35px]"
                  onClick={() => {
                    // localStorage.setItem("tutorial", "true");
                    // router.push("/play");
                  }}
                >
                  Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
