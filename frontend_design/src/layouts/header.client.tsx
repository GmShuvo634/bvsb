
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Icon, IconType } from "@/components/icons";
import { Drawer, DrawerPosition } from "@/components/drawer";
import { useAccount, useConnect, useDisconnect, useBalance, useNetwork, useSwitchNetwork } from "wagmi";
import { Modal } from "@/components/modal";
import SwapPanel from "./swap-panel";
import { nFormatter } from "@/utils/utils";
import { Logo } from "@/components/logo";
import { Config } from "@/config";
import LeaderboardPanel from "./leaderboard-panel";
import { Flag } from "@/components/flags";
import { Country } from "@/config/countries";
import * as api from "@/components/api";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
console.log("🛠️ api module exports:", api);
import { toast } from "react-toastify";
import { SimpleCheckbox } from "@/components/simple-checkbox";
import { useDispatch, useSelector } from "react-redux";
import { setState } from "@/store/tutorialSlice";
import { setIsUpdate, setPlayer } from '@/store/globalState';
import SoundControl from "@/components/SoundControl";
import AuthModal from "@/components/AuthModal";
import { authService, AuthData } from "@/services/authService";

console.log('🛠️ api exports:', Object.keys(api));

const ConnectButtonBackgroundSvg = () => {
  return (
    <div className="relative flex flex-col items-center w-full h-full">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 456.3 109.2"
        xmlSpace="preserve"
      >
        <style type="text/css">{`.st1{fill:#e5c869;}`}</style>
        <path
          className="st1"
          d="M329.5,109.2H126.8c-13.9,0-27.3-6-37.8-16.9L0,0h456.3l-89,92.3C356.9,103.2,343.4,109.2,329.5,109.2z"
        />
      </svg>
      <svg
        className="absolute top-[-3px] w-[calc(100%-4px)]"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 456.3 109.2"
        xmlSpace="preserve"
      >
        <style type="text/css">{`.st0{fill:#202230;}`}</style>
        <path
          className="st0"
          d="M329.5,109.2H126.8c-13.9,0-27.3-6-37.8-16.9L0,0h456.3l-89,92.3C356.9,103.2,343.4,109.2,329.5,109.2z"
        />
      </svg>
    </div>
  );
};

interface HeaderProps {
  setChatVisible: () => void;
  setReferralLinkData: (data: Array<any>) => void;
  isChatview: boolean;
  hiddenChat: boolean;
}

export default function Header(props: HeaderProps) {
  const {
    setChatVisible,
    setReferralLinkData,
    isChatview,
    hiddenChat,
  } = props;

  // <<< DEBUG SNIPPET >>>
  useEffect(() => {
    if (DEMO_MODE) return;
    if (DEMO_MODE) return;
    console.log("api.login is", typeof api.login);
    console.log("api.getPlayer is", typeof api.getPlayer);
  }, []);

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  // Add safety check for chain and provide fallback
  const currentChain = chain || { id: 11155111, name: 'Sepolia' }; // Default to Sepolia

  // Debug logging to help identify chain issues
  useEffect(() => {
    console.log('Header - Chain state:', { chain, isConnected, address });
  }, [chain, isConnected, address]);

  // Use balance hook with robust error handling and fallback
  const { data: balanceData, isError: balanceError, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: currentChain?.id,
    watch: true,
    // Only enable when we have an address and are connected
    enabled: !!address && isConnected && !!currentChain,
    // Add error handling for network issues
    onError: (error) => {
      console.warn('Balance fetch error (this is normal if no wallet is connected):', error);
    },
  });
  const tutorialState = useSelector((state: any) => state.tutorialState);
  const dispatch = useDispatch();

  const audioRef = useRef(null);

  // const [currentCountry, setCurrentCountry] = useState(Country.US);
  const [viewCountries, setViewCountries] = useState(false);

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isOpenConnectModal, setIsOpenConnectModal] = useState(false);
  const [isOpenSwapModal, setIsOpenSwapModal] = useState(false);

  const [files, setFiles] = useState<FileList | null>();
  const fileUpload = useRef(null);

  const [isLeaderboardView, setIsLeaderboardView] = useState(false);
  const [isOpenGanerateLinkModal, setIsOpenGanerateLinkModal] = useState(false);

  //tutorial
  const [isOpenSoundEffectModal, setIsOpenSoundEffectModal] = useState(false);
  const [isOpenMsgPool, setIsOpenMsgPool] = useState(false);
  const [isOpenMsgInvestment, setIsOpenMsgInvestment] = useState(false);
  const [isOpenMsgBetUp, setIsOpenMsgBetUp] = useState(false);
  const [isOpenMsgBetDown, setIsOpenMsgBetDown] = useState(false);
  const [isOpenMsgEarnings, setIsOpenMsgEarnings] = useState(false);
  const [isOpenMsgConnectWallet, setIsOpenMsgConnectWallet] = useState(false);
  const [isOpenMsgTerms, setIsOpenMsgTerms] = useState(false);
  const [disclaimerCheck, setdisclaimerCheck] = useState(false);
  const [isOpenMsgUpProfit, setIsOpenMsgUpProfit] = useState(false);
  const [isOpenMsgDownProfit, setIsOpenMsgDownProfit] = useState(false);
  const [isOpenMsgPoolRound, setIsOpenMsgPoolRound] = useState(false);
  const [isOpenMsgStartRate, setIsOpenMsgStartRate] = useState(false);
  const [isOpenMsgLiveRate, setIsOpenMsgLiveRate] = useState(false);
  const [isOpenMsgProfit, setIsOpenMsgProfit] = useState(false);

  const [affiliateLinkName, setAffiliateLinkName] = useState("");

  // Authentication states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const player = useSelector((state: any) => state.globalState.player);
  const isUpdate = useSelector((state: any) => state.globalState.isUpdate);

  // Initialize authentication state
  useEffect(() => {
    const auth = authService.getAuth();
    if (auth) {
      setAuthData(auth);
      setIsLoggedIn(auth.isAuthenticated);

      // Update Redux global state with auth data
      dispatch(setPlayer({
        address: auth.user.id, // Use user ID as address for now
        avatar: auth.user.avatar || '',
        country: auth.user.country || '',
        balance: auth.user.balance, // This is the key fix!
        bettedBalance: 0,
        isUpPool: false,
        className: '',
      }));
    }

    // Listen for auth changes
    const unsubscribe = authService.subscribe((newAuth) => {
      setAuthData(newAuth);
      setIsLoggedIn(newAuth?.isAuthenticated || false);

      if (newAuth) {
        // Update Redux global state when auth changes
        dispatch(setPlayer({
          address: newAuth.user.id,
          avatar: newAuth.user.avatar || '',
          country: newAuth.user.country || '',
          balance: newAuth.user.balance, // Sync balance from auth service
          bettedBalance: 0,
          isUpPool: false,
          className: '',
        }));
      } else {
        // Clear player data when logged out
        dispatch(setPlayer({
          address: '',
          avatar: '',
          country: '',
          balance: 0,
          bettedBalance: 0,
          isUpPool: false,
          className: '',
        }));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    if (DEMO_MODE) return;
    if (DEMO_MODE) return;
    try {
      if (switchNetwork) {
        switchNetwork(process.env.TEST_MODE == "true" ? 5 : 1);
        console.log("Switch Network", process.env.TEST_MODE == "true" ? 5 : 1);
      }
    } catch (error) {
      console.log("switch error", error)
    }

    if (tutorialState === false && router.pathname === "/play")
      setTimeout(setTutorial, 2000);
    // if (localStorage.getItem("tutorial") === "true" && router.pathname === "/play")
    //   setTimeout(setTutorial, 2000);
  }, [router.pathname, switchNetwork, tutorialState]);

  const setTutorial = () => {
    setIsOpenSoundEffectModal(true);
  }

    useEffect(() => {
    // In demo mode we skip login
    if (DEMO_MODE) return;

    // Fetch a fresh JWT as soon as wallet connects
    const getJWTToken = async () => {
      const referral = localStorage.getItem("referral") || "";
      try {
        const response = await api.login(address || "", referral);
        // backend returns { token }
        if (response?.data.token) {
          localStorage.setItem("authToken", response.data.token);
          localStorage.removeItem("referral");
          dispatch(setIsUpdate());
        }
      } catch (err) {
        console.error("Login failed:", err);
      }
    };

    if (isConnected) {
      getJWTToken();
      setIsOpenConnectModal(false);
    }
  }, [isConnected, address, dispatch]);


  useEffect(() => {
    if (DEMO_MODE) return;
    if (DEMO_MODE) return;

    const getPlayerData = async () => {

      const response = await api.getPlayer();
      console.log('**************', response);
      if (response?.data.success === true) {
        dispatch(setPlayer(response.data.data));
      }

    }

    if (isConnected) {
      getPlayerData();
    }

  }, [isUpdate, dispatch, isConnected])

  useEffect(() => {
    if (DEMO_MODE) return;
    if (DEMO_MODE) return;

    // setUploadedImageUrl(URL.createObjectURL(files[0]));

    const uploadImage = async (image: File) => {

      const response = await api.uploadAvatar(image);

      if (response && response.status === 200) {
        if (response.data.success === true) {
          dispatch(setIsUpdate());
          toast.success("Successfully uploaded")
        }
        else toast.error(response.data.msg)
      } else {
        toast.error("Image upload failed.")
      }
    }
    if (files && files.length > 0) {
      uploadImage(files[0])
    }
  }, [files, dispatch]);

  const handleCountry = async (currentCountry: string) => {
    const response = await api.updatePlayer({ country: currentCountry })
    if (response?.status == 200) {
      if (response.data.success) {
        dispatch(setIsUpdate());
      }
    }
  }

  const handleWalletConnect = () => {
    setIsOpenConnectModal(true);
  };

  const onlyLettersAndNumbers = (str: string) => {
    return /^[A-Za-z0-9]*$/.test(str);
  };

  const generateLink = async () => {
    if (!isConnected) {
      toast.error(
        "In order to generate affilliate link, you must have your wallet connected!"
      );
      return;
    }

    const response = await api.generateReferral();

    if (response?.status == 200) {
      setReferralLinkData((response as any)?.data.data);
    } else {
      toast.error(response?.data?.msg);
    }

    setIsOpenGanerateLinkModal(false);
    setAffiliateLinkName("");
  };

  const handlePlayerUpdate = () => {
    dispatch(setIsUpdate());
  }

  return (
    <div className="w-full h-[72px] bg-[#161721] relative">
      <div className="w-full h-[15px] bg-[#202230] border-b-[3px] border-[#e5c869]" />
      <div className="relative z-20 flex flex-row justify-between w-full px-2 sm:px-8">
        <Logo />
        <div className="h-[58px] flex sm:hidden flex-row items-center">
          <button className="border-2 border-solid border-[#3f404f] hover:border-[#7074b9] rounded-lg bg-gradient-to-t from-[#181923] to-[#292a3a] w-[35px] h-[35px] flex flex-row items-center justify-center">
            <Icon type={IconType.CHAT} className="w-5 h-5 fill-white" />
          </button>
        </div>
        <div className="absolute top-0 flex flex-row items-start gap-2 -translate-x-1/2 left-1/2">
          <div className="h-[58px] hidden lg:flex flex-row justify-end items-center w-1/3">
            {router.pathname === "/play" ? (
              <button
                className="border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[100px] h-[35px]"
                onClick={() => router.push("/share")}
              >
                AFFILIATES
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href={clsx(router.pathname === "/share" ? "/play" : "/share")}
                  className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
                >
                  <Image
                    src="/images/home/arrow_left.svg"
                    width={20}
                    height={20}
                    alt="Back arrow"
                    className="w-5 h-5"
                  />
                </Link>
                <button
                  className="border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[100px] h-[35px] uppercase"
                  onClick={() => setIsOpenGanerateLinkModal(true)}
                >
                  generate links
                </button>
              </div>
            )}
          </div>
          <div className="relative w-64 sm:w-80 w-1/3">
            <ConnectButtonBackgroundSvg />
            {!isConnected ? (
              <div className="absolute w-full h-[58px] flex flex-row items-center justify-center top-0">
                <button
                  className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                  onClick={handleWalletConnect}
                >
                  CONNECT WALLET
                </button>
              </div>
            ) : (
              <div className="absolute w-full h-[58px] top-0 flex flex-row items-center justify-center">
                <div className="flex flex-row items-center justify-between gap-1">
                  <button onClick={handlePlayerUpdate}>
                    <Icon
                      type={IconType.REFRESH}
                      className="fill-[#fff699] hover:fill-[#e0e0e0] w-5 h-5 transition-all ease-in-out duration-500"
                    />
                  </button>
                  <div className="flex flex-row items-center gap-1 bg-[#111016] px-2 py-1 rounded-lg">
                    <Icon
                      type={IconType.ETH_COIN}
                      className="fill-[#111016] !w-4 !h-4 bg-[#fff699] rounded-full sm:!w-5 sm:!h-5"
                    />
                    <span className="text-base sm:text-lg font-oswald text-[#fff699]">
                      {nFormatter(player?.balance || 0, 2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpenSwapModal(true);
                    }}
                  >
                    <Icon
                      type={IconType.WALLET}
                      className="fill-[#fff699] hover:fill-[#e0e0e0] w-5 h-5 transition-all ease-in-out duration-500"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="h-[58px] hidden lg:flex flex-row items-center w-1/3">
            {router.pathname === "/play" ? (
              <button
                onClick={() => {
                  router.push("/jackpot_winners");
                }}
                className="border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[100px] h-[35px]"
              >
                WINNERS
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/faq"
                  className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
                >
                  ?
                </Link>
                <Link
                  href="/share"
                  className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
                >
                  <Image
                    src="/images/home/link.svg"
                    width={20}
                    height={20}
                    alt="Link icon"
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="/share_report"
                  className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
                >
                  <Image
                    src="/images/home/earning_today.svg"
                    width={20}
                    height={20}
                    alt="Earnings icon"
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex justify-center items-center border-2 border-solid border-[#e5c869] hover:border-[#9e8130] rounded-lg font-open-sans text-xs text-[#e5c869] hover:text-[#9e8130] w-[40px] h-[35px]"
                >
                  <Image
                    src="/images/home/dashboard.svg"
                    width={20}
                    height={20}
                    alt="Dashboard icon"
                    className="w-5 h-5"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="h-[58px] flex flex-row justify-end items-center gap-3 w-1/3">
          {/* Sound Control */}
          <SoundControl className="hidden md:block" />

          {/* Authentication Buttons */}
          {!isLoggedIn ? (
            <div className="hidden md:flex flex-row items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white font-medium text-sm transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white font-medium text-sm transition-all duration-200"
              >
                📝 Register
              </button>

            </div>
          ) : (
            <div className="hidden md:flex flex-row items-center gap-2">
              <div className="px-3 py-2 bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] rounded-lg">
                <div className="text-white font-medium text-sm">
                  {authService.getUserDisplayName()}
                </div>
                <div className="text-gray-400 text-xs">
                  Balance: {authService.getFormattedBalance()}
                </div>
              </div>
              <button
                onClick={() => {
                  authService.logout();
                  toast.success("Logged out successfully!");
                }}
                className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-white font-medium text-sm transition-all duration-200"
              >
                Logout
              </button>
            </div>
          )}

          {!hiddenChat && !isChatview && (
            <button
              onClick={setChatVisible}
              className="hidden md:flex rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[72px] h-[35px] overflow-hidden flex-row items-center justify-center gap-1"
            >
              <span>CHAT</span>
              <Icon type={IconType.CHAT} className="!w-5 !h-5 !fill-black" />
            </button>
          )}
          {isConnected && (
            <button
              onClick={() => {
                setIsOpenMenu(true);
              }}
              className="w-10 h-10 rounded-full border-[3px] border-solid border-[#e5c869] overflow-hidden"
            >
              <Image
                alt="avatar"
                src={
                  player?.avatar
                    ? `${Config.serverUrl.avatars}${player.avatar}`
                    : "/images/avatar-default.png"
                }
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </button>
          )}
          {/* {isConnected && ( */}
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
          {/* )} */}
        </div>
      </div>
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
                <Image
                  alt="avatar"
                  src={
                    player?.avatar
                      ? `${Config.serverUrl.avatars}${player.avatar}`
                      : "/images/avatar-default.png"
                  }
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
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
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => {
                    setViewCountries(!viewCountries);
                  }}
                >
                  <Flag country={player?.country || Country.US} className="!w-8 !h-8" />
                </button>
                {viewCountries && (
                  <div className="absolute bg-[#202230] border border-solid border-[#808080] rounded-lg px-3 py-2 top-9 flex flex-col items-center gap-2">
                    <button
                      onClick={() => {
                        handleCountry(Country.US);
                        setViewCountries(false);
                      }}
                    >
                      <Flag country={Country.US} className="!w-8 !h-8" />
                    </button>
                    <button
                      onClick={() => {
                        handleCountry(Country.UK);
                        setViewCountries(false);
                      }}
                    >
                      <Flag country={Country.UK} className="!w-8 !h-8" />
                    </button>
                    <button
                      onClick={() => {
                        handleCountry(Country.CA);
                        setViewCountries(false);
                      }}
                    >
                      <Flag country={Country.CA} className="!w-8 !h-8" />
                    </button>
                  </div>
                )}
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
                    api.userDisconnect().then((response: any) => {
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
                    localStorage.setItem("tutorial", "true");
                    if (router.pathname === "/play") {
                      setIsOpenMenu(false);
                      setIsOpenSoundEffectModal(true);
                    }
                    else
                      router.push("/play");
                  }}
                >
                  Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {isLeaderboardView && (
        <div className="absolute z-10 top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-[#161721]">
          <LeaderboardPanel />
        </div>
      )}

      <Modal
        isOpen={isOpenSwapModal}
        onClose={() => {
          setIsOpenSwapModal(false);
        }}
      >
        <SwapPanel
          address={player?.address || ''}
          gameBalance={player?.balance || 0}
          walletBalance={Number(balanceData?.formatted) || 0}
          refreshBalances={handlePlayerUpdate}
          onClose={() => {
            setIsOpenSwapModal(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={isOpenConnectModal}
        onClose={() => setIsOpenConnectModal(false)}
      >
        <div className="connect-wallet-modal-container">
          <p className="connect-wallet-modal-header-desc">Connect With</p>
          <button
            className="connect-wallet-modal-close-btn hover:opacity-80"
            onClick={() => setIsOpenConnectModal(false)}
          />
          <div className="flex flex-col w-full gap-5 px-5 my-10">
            {connectors.map((x: any) => (
              <div
                key={x.id}
                className="connect-wallet-modal-walletconnect-btn hover:bg-[#595757]"
                onClick={() => connect({ connector: x })}
              >
                <Image
                  src={
                    x.name === "MetaMask"
                      ? "/images/metamask.png"
                      : x.name === "Coinbase Wallet"
                        ? "/images/coinbase.png"
                        : "/images/walletConnect.png"
                  }
                  width={40}
                  height={40}
                  alt={x.name + " wallet"}
                  className="connect-wallet-modal-default-img-walletconnect"
                />
                <p className="connect-wallet-modal-default-desc">
                  {x.name}
                  {isLoading &&
                    x.id === pendingConnector?.id &&
                    " (connecting)"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isOpenGanerateLinkModal}
        onClose={() => setIsOpenGanerateLinkModal(false)}
      >
        <div className="relative max-h-screen overflow-auto rounded-2xl bg-[#202230] shadow-[0_5px_20px_#000] px-10 pt-14 pb-5 flex flex-col md:flex-row items-center gap-5">
          <button
            className="absolute top-4 right-4"
            onClick={() => setIsOpenGanerateLinkModal(false)}
          >
            <Icon
              type={IconType.CLOSE}
              className="w-5 h-5 fill-[#fff699] hover:fill-[#e0e0e0]"
            />
          </button>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col justify-center gap-2 w-[400px]">
              <div className="popup_title">
                <div className="title_popup">GENERATE AFFILIATE LINK</div>
              </div>
              <div className="popup_entry">
                <div className="text_simple">My Affiliate Link Nickname</div>
                <div className="form">
                  <input
                    type="text"
                    className="text-white text-center bg-[#0A090D] border-none focus:ring-0"
                    placeholder="Name your affiliate link"
                    value={affiliateLinkName}
                    onChange={(e) => setAffiliateLinkName(e.target.value)}
                  />
                </div>
                {(affiliateLinkName.length < 6 ||
                  affiliateLinkName.length > 15 ||
                  onlyLettersAndNumbers(affiliateLinkName) === false) && (
                    <div className="text_small">
                      6 to 15 characters, only english letters and numbers
                      allowed.
                    </div>
                  )}
              </div>
              <div className="popup_button">
                <button
                  type="button"
                  className={clsx(
                    "affiliate_button !border-[2px] !border-[#3F404F] text-white",
                    affiliateLinkName.length < 6 ||
                      affiliateLinkName.length > 15 ||
                      onlyLettersAndNumbers(affiliateLinkName) === false
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  )}
                  disabled={
                    affiliateLinkName.length < 6 ||
                      affiliateLinkName.length > 15 ||
                      onlyLettersAndNumbers(affiliateLinkName) === false
                      ? true
                      : false
                  }
                  onClick={generateLink}
                >
                  GENERATE LINKS
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isOpenSoundEffectModal}
        onClose={() => {
          setIsOpenSoundEffectModal(false);
          setIsOpenMsgPool(true);
        }}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="relative flex flex-col items-center justify-center px-14 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-right 1.5s ease"
          }}>
            <button className="absolute top-4 right-4" onClick={() => {
              setIsOpenSoundEffectModal(false);
              if (localStorage.getItem("tutorial") === null || localStorage.getItem("tutorial") === "true") {
                localStorage.setItem("tutorial", "false");
                setIsOpenMsgPool(true);
              }
            }}>
              <Icon
                type={IconType.CLOSE}
                className="w-5 h-5 fill-[#fff699] hover:fill-[#e0e0e0]"
              />
            </button>
            <p className="text-3xl uppercase">maximize your experience</p>
            <p className="text-xl">In order to maximize your experience,<br /> please confirm the sound effects</p>
            <button
              className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center uppercase"
              onClick={() => {
                (audioRef as any).current.play();
                setIsOpenSoundEffectModal(false);
                dispatch(setState(true));
                if (localStorage.getItem("tutorial") === null || localStorage.getItem("tutorial") === "true") {
                  localStorage.setItem("tutorial", "false");
                  setIsOpenMsgPool(true);
                }
              }}
            >
              confirm
            </button>
          </div>
        </div>
      </Modal>
      <audio ref={audioRef} loop>
        <source src="/audio/ambience.mp3" type="audio/mpeg" />
      </audio>
      <Modal
        isOpen={isOpenMsgPool}
        onClose={() => setIsOpenMsgPool(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="relative flex flex-col items-center justify-center px-14 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-down 1.5s ease"
          }}>
            <Image src="/images/pools_img.png" alt="Pools" width={200} height={100} />
            <Image className="absolute -left-[2.8%] top-[18%] rotate-90 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <Image className="absolute left-[99%] top-[18%] -rotate-90 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgPool(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgPool(false);
                  setIsOpenMsgInvestment(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgInvestment}
        onClose={() => setIsOpenMsgInvestment(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute left-1/4 bottom-24 flex flex-col items-center justify-center px-14 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-left 1.5s ease"
          }}>
            <Image className="absolute -top-14 w-40" src="/images/investment.png" alt="Investment" width={160} height={100} />
            <div className="flex justify-between items-center pt-10">
              <p className="text-[40px] font-bold text-center">Select Your Investment</p>
            </div>
            <Image className="absolute left-[45%] -bottom-[19px] w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgInvestment(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgInvestment(false);
                  setIsOpenMsgBetUp(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgBetUp}
        onClose={() => setIsOpenMsgBetUp(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute left-[1%] bottom-24 flex flex-col items-center justify-center px-14 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-up 1.5s ease"
          }}>
            <Image className="absolute -top-14 w-40" src="/images/pressUp.png" alt="Press Up" width={160} height={100} />
            <div className="flex justify-between items-center pt-10">
              <p className="text-[40px] pt-10 font-bold text-center">Join UP Pool If You Think Bitcoin<br /> Is Going Up</p>
            </div>
            <Image className="absolute left-[27%] -bottom-[19px] w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgBetUp(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgBetUp(false);
                  setIsOpenMsgBetDown(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgBetDown}
        onClose={() => setIsOpenMsgBetDown(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute right-[1%] bottom-24 flex flex-col items-center justify-center px-14 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-down 1.5s ease"
          }}>
            <Image className="absolute -top-14 w-40" src="/images/pressDown.png" alt="Press Down" width={160} height={100} />
            <div className="flex justify-between items-center pt-10">
              <p className="text-[40px] pt-10 font-bold text-center">Join Down Pool If You Think Bitcoin<br /> Is Going Down</p>
            </div>
            <Image className="absolute right-[27%] -bottom-[19px] w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgBetDown(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgBetDown(false);
                  setIsOpenMsgEarnings(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgEarnings}
        onClose={() => setIsOpenMsgEarnings(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute left-[27%] top-[104px] flex flex-col items-center justify-center px-8 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl w-[550px] border-2 border-[#e5c869]" style={{
            animation: "bounce-in-left 1.5s ease"
          }}>
            <Image className="absolute -top-14 w-[75px]" src="/images/earnings.png" alt="Earnings" width={75} height={50} />
            <Image className="absolute left-[32%] -top-5 -rotate-180 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <div className="flex justify-between items-center pt-10">
              <p className="text-[40px] pt-10 font-bold text-center">Earnings Distribution</p>
            </div>
            <div className="text-2xl font-normal text-center w-[85%]">
              At the End Of The Round, The Winners Will<br /> Get Their Earnings Directly To The Same<br /> Digital Wallet They Signed The Trade With.
            </div>
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgEarnings(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgEarnings(false);
                  setIsOpenMsgConnectWallet(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgConnectWallet}
        onClose={() => setIsOpenMsgConnectWallet(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-[12%] flex flex-col items-center justify-center px-8 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl w-[550px] border-2 border-[#e5c869]" style={{
            animation: "bounce-in-down 1.5s ease"
          }}>
            <Image className="absolute -top-[3.2px] w-[190px]" src="/images/connectWallet.png" alt="Connect Wallet" width={190} height={50} />
            <Image className="absolute left-[45%] -top-[19px] -rotate-180 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <div className="flex justify-between items-center pt-10">
              <p className="text-[27px] font-bold text-center pt-10 mx-auto">Connect Your Wallet,<br /> or Create Social Wallet</p>
            </div>
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgConnectWallet(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgConnectWallet(false);
                  setIsOpenMsgTerms(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgTerms}
        onClose={() => setIsOpenMsgTerms(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-[12%] flex flex-col items-center justify-evenly py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl w-[600px] border-2 border-[#e5c869]" style={{
            animation: "bounce-in-down 1.5s ease"
          }}>
            <p className="text-[50px] font-bold text-center">Disclaimer</p>
            <div className="flex items-center w-[90%]">
              <SimpleCheckbox
  checked={disclaimerCheck}
  onChange={(ck) => setdisclaimerCheck(ck)}
  boxClassName="w-12 h-12"
  label={
    <>
      I Agree To All&nbsp;
      <span className="underline">Technology License Agreements</span>
    </>
  }
/>

            </div>
            <button
              className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center uppercase"
              onClick={() => {
                setIsOpenMsgTerms(false);
                setIsOpenMsgUpProfit(true);
              }}
              disabled={disclaimerCheck === true ? false : true}
            >
              Next
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgUpProfit}
        onClose={() => setIsOpenMsgUpProfit(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-[21%] left-[18%] flex flex-col items-center justify-center px-8 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl w-[424px] border-2 border-[#e5c869]" style={{
            animation: "bounce-in-up 1.5s ease"
          }}>
            <Image className="absolute left-[11%] -top-[6%] rotate-180 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <p className="text-[73px] font-bold text-center">
              UP
            </p>
            <p className="text-[27px] font-semibold w-[80%] mx-auto text-center">
              Pool Potential Profit Based on Players Trades
            </p>
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgUpProfit(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgUpProfit(false);
                  setIsOpenMsgDownProfit(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgDownProfit}
        onClose={() => setIsOpenMsgDownProfit(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-[22%] right-[18%] flex flex-col items-center justify-center px-8 py-10 gap-8 bg-[#161721] text-[#e5c869] font-oswald rounded-xl w-[424px] border-2 border-[#e5c869]" style={{
            animation: "bounce-in-down 1.5s ease"
          }}>
            <Image className="absolute right-[11%] -top-[6%] rotate-180 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <p className="text-[73px] font-bold text-center">
              DOWN
            </p>
            <p className="text-[27px] font-semibold w-[80%] mx-auto text-center">
              Pool Potential Profit Based on Players Trades
            </p>
            <div className="flex justify-between w-full">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgDownProfit(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgDownProfit(false);
                  setIsOpenMsgPoolRound(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgPoolRound}
        onClose={() => setIsOpenMsgPoolRound(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-[33%] flex flex-col items-center justify-center px-8 py-10 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-left 1.5s ease"
          }}>
            <Image className="absolute -top-[5%] rotate-180 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <p className="text-[3.6em] font-bold text-center">
              POOL ROUND
            </p>
            <p className="text-[2.43em] font-bold text-center">
              30 SEC
            </p>
            <p className="text-[1.45em] font-bold text-center">
              Time to place a trade and join the pool
            </p>
            <p className="text-[2.43em] font-bold text-center">
              15 SEC
            </p>
            <p className="text-[1.45em] font-bold text-center">
              Knock Out time and winners announcement
            </p>
            <div className="flex justify-between w-full pt-8">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgPoolRound(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgPoolRound(false);
                  setIsOpenMsgStartRate(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgStartRate}
        onClose={() => setIsOpenMsgStartRate(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute w-[34.5em] flex flex-col items-center justify-center px-8 py-10 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-right 1.5s ease"
          }}>
            <p className="text-[3.6em] font-bold text-center">
              START RATE
            </p>
            <p className="text-[1.71em] text-center mt-[0.35em]">
              Higher than start rate
            </p>
            <p className="text-[2.43em] font-bold text-center">
              UP POOL WINS
            </p>
            <p className="text-[1.71em] text-center mt-[0.35em]">
              Lower than start rate
            </p>
            <p className="text-[2.43em] font-bold text-center">
              DOWN POOL WINS
            </p>
            <div className="flex justify-between w-full pt-8">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgStartRate(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgStartRate(false);
                  setIsOpenMsgLiveRate(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgLiveRate}
        onClose={() => setIsOpenMsgLiveRate(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute w-[34.5em] flex flex-col items-center justify-center px-8 py-10 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-left 1.5s ease"
          }}>
            <p className="text-[3.6em] font-bold text-center">
              Live<br /> Bitcoin Rate
            </p>
            <p className="text-[1.5em] font-semibold text-center mt-[0.25em] w-[95%]">
              The live Bitcoin rate that announces the winners
            </p>
            <div className="flex justify-between w-full pt-8">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgLiveRate(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgLiveRate(false);
                  setIsOpenMsgProfit(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenMsgProfit}
        onClose={() => setIsOpenMsgProfit(false)}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/30 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute w-[34.5em] flex flex-col items-center justify-center px-8 py-10 bg-[#161721] text-[#e5c869] font-oswald rounded-xl border-2 border-[#e5c869]" style={{
            animation: "bounce-in-right 1.5s ease"
          }}>
            <Image className="absolute -top-[4%] rotate-180 w-10" src="/images/rectangle.png" alt="Rectangle" width={40} height={40} />
            <p className="text-[3.6em] font-bold text-center">
              PROFITS
            </p>
            <p className="text-[1.5em] font-semibold w-[95%] mt-[0.25em] text-center">
              The Profits are Divided Equally Subject To The Investment Ratio of The Investors In The Pools Minus The Earnings Fees Commission (up to 10%).
            </p>
            <p className="text-[2.1em] font-bold w-[85%] mt-[0.25em] text-center">
              The winners get their profits immediately into their digital wallets.
            </p>
            <div className="flex justify-between w-full pt-8">
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => setIsOpenMsgProfit(false)}
              >
                Skip
              </button>
              <button
                className="rounded-lg text-base font-oswald font-semibold leading-3 text-black bg-gradient-to-r from-[#ffe499] to-[#e5c869] hover:from-[#fff3d4] hover:to-[#ffe499] w-[140px] h-[40px] overflow-hidden flex flex-row items-center justify-center"
                onClick={() => {
                  setIsOpenMsgProfit(false);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(authData) => {
          setAuthData(authData);
          setIsLoggedIn(true);
          toast.success("Authentication successful!");
        }}
        initialMode={authMode}
      />
    </div>
  );
}
