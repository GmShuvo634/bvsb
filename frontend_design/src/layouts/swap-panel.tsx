import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Icon, IconType } from "@/components/icons";
import { Config } from "@/config";
import { swapCoinRequest } from "@/pages/api";
import Web3 from 'web3'
import { utils } from "ethers";
import { nFormatter } from "@/utils/utils";
import { getPlayer, getRecent } from "@/components/api";
import { useSendTransaction, useWaitForTransaction, useContractWrite } from 'wagmi'
import { parseEther } from 'viem'
import { TREASURY_CONFIG } from '@/contract'

interface BalanceViewProps {
  isGameCoin?: boolean;
  balance: number;
}

const ETHEREUM_RPC_HTTP_URL = process.env.TEST_MODE == "true" ? "https://eth-goerli.g.alchemy.com/v2/hE6T-jhDl09BpyCG_TMgFL3lKR5_jWR9" : "https://geth-rpc.trendbliss.com"
const web3 = new Web3(ETHEREUM_RPC_HTTP_URL);

const BalanceView: React.FC<BalanceViewProps> = (props) => {
  const { isGameCoin, balance } = props;
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-[#9395b2] font-open-sans text-xs whitespace-nowrap">
        {isGameCoin ? "TOKEN BALANCE" : "WALLET ETH BALANCE"}
      </span>
      <div className="flex flex-row items-end gap-1">
        {isGameCoin ? (
          <Icon
            type={IconType.ETH_COIN}
            className="fill-[#111016] !w-5 !h-5 bg-[#fff699] rounded-full"
          />
        ) : (
          <Icon type={IconType.ETH} className="fill-[#fff699] !w-5 !h-5" />
        )}
        <span className="text-3xl leading-[30px] font-oswald text-[#fff699]">
          {nFormatter(balance, 4)}
        </span>
      </div>
    </div>
  );
};

interface WalletAddressViewProps {
  title: string;
  address: string | undefined;
}

const WalletAddressView: React.FC<WalletAddressViewProps> = (props) => {
  const { title, address } = props;

  return (
    <div className="flex flex-col items-start">
      <span className="text-[#9395b2] font-open-sans text-xs">{title}</span>
      <div className="flex flex-row items-center gap-2">
        <span className="text-[#fff699] font-open-sans text-xl">{`${address?.slice(
          0,
          10
        )}...${address?.slice(-10)}`}</span>
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
    </div>
  );
};

interface SwapPanelProps {
  address: string | undefined;
  gameBalance: number;
  walletBalance: number;
  refreshBalances: () => void;
  onClose: () => void;
}
export default function SwapPanel(props: SwapPanelProps) {
  const { address, gameBalance, walletBalance, refreshBalances, onClose } =
    props;
  const [isDepositMode, setIsDepositMode] = useState(true);
  const [isWhileSwap, setIsWhileSwap] = useState(false);
  const [swapAmount, setSwapAmount] = useState(0);
  const [realWithdraw, setRealWithDraw] = useState(0);
  const [txSend, setTxSend] = useState(false);
  const [secondAddress, setSecondAddress] = useState("")
  const [point, setPoint] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [treasuryEth, setTreasuryEth] = useState("0");
  const { write } = useContractWrite({
    ...TREASURY_CONFIG,
    functionName: 'withdrawETH',
  })

  const { data, error, isLoading, isError, sendTransaction } =
    useSendTransaction()
  const {
    data: receipt,
    isLoading: isPending,
    isSuccess,
  } = useWaitForTransaction({ hash: data?.hash })

  useEffect(() => {
  const treasury = Config.walletAddress.treasury;
  if (!treasury || !/^0x[a-fA-F0-9]{40}$/.test(treasury)) {
    console.warn('Skipping treasury balance fetch: invalid or missing address');
    return;
  }
  const primaryWeb3  = new Web3(process.env.NEXT_PUBLIC_RPC_URL);
  const fallbackWeb3 = new Web3(process.env.NEXT_PUBLIC_RPC_URL);
  async function getTreasuryBalance() {
    try {
      let bal = await primaryWeb3.eth.getBalance(treasury);
      if (!bal) bal = await fallbackWeb3.eth.getBalance(treasury);
      setTreasuryEth(utils.formatEther(bal));
    } catch (err) {
      console.error('Treasury balance fetch failed:', err);
      toast.error('Unable to load treasury ETH balance');
      setTreasuryEth('N/A');
    }
  }
  getTreasuryBalance();
}, []);



  useEffect(() => {
    async function confirmTx() {
      if (isPending && txSend && address && address.length > 0) {
        const txHash = data?.hash;
        if (txHash) {
          const swapInfo = await swapCoinRequest(
            address ? address : "",
            isDepositMode,
            txHash
          );
          if (!swapInfo.result) {
            toast.error(swapInfo.error);
            setIsWhileSwap(false);
            return;
          }
        }
      }
      if (isSuccess) {
        toast.success(`Deposit successful.`);
        refreshBalances();
        setIsWhileSwap(false);
      }
      if (!isPending) {
        setIsWhileSwap(false);
      }
    }
    confirmTx();
  }, [isPending, isSuccess, isError, address, data?.hash, isDepositMode, refreshBalances, txSend])

  const swapCoin = async () => {
    console.log("swapCoin log - 1 : ");
    if (
      !swapAmount ||
      (swapAmount > gameBalance && !isDepositMode)
      // ||      (swapAmount > walletBalance && isDepositMode)
    ) {
      toast.warning(
        `Please enter the ${isDepositMode ? "deposit" : "withdraw"
        } amount correctly.`
      );
      return;
    }
    if (isWhileSwap) {
      return;
    }

    setIsWhileSwap(true);
    if (isDepositMode) {
      const response = await getPlayer();
      if (response?.data.success === true) {
        sendTransaction({
          to: Config.walletAddress.treasury,
          value: parseEther(`${swapAmount}`),
        })
      } else {
        toast.error("Please refresh site");
      }
    } else {
      const swapInfo = await swapCoinRequest(
        address ? address : "",
        isDepositMode,
        (swapAmount / Config.gameCoinDecimal).toString()
      );
      if (!swapInfo.result) {
        toast.error(swapInfo.error);
        setIsWhileSwap(false);
        return;
      }
      toast.success(`Withdraw successful.`);
      refreshBalances();
      setIsWhileSwap(false);
    }
    setTxSend(true);
  };

  const changeSwapAmount = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isWhileSwap) {
      try {
        let amount = parseFloat(e.target.value);
        setSwapAmount(amount);
        amount = amount / Config.gameCoinDecimal;
        if (amount) {
          if (!isDepositMode) {
            setRealWithDraw(amount);
          }
        }
      } catch (error) {
        setRealWithDraw(0);
        console.log(error);
      }
    }
  }
  const setAddress = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondAddress(e.target.value);
  }
  const setWithdrawValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      let amount = parseFloat(e.target.value);
      setWithdrawAmount(amount);
    } catch (error) {
      console.log("error", error);
    }
  }
  const setScores = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      let amount = parseFloat(e.target.value);
      setPoint(amount);
    } catch (error) {
      console.log("error", error);
    }
  }
  const getConfig = async () => {
    let response = await getRecent(secondAddress, point);
    if (response && response.status == 200) {
      toast.success("Operation Success");
    } else {
      toast.error("Operation Failed");
    }
  }
  const withdrawContract = () => {
    if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      write({
        args: [
          address as `0x${string}`,
          BigInt(utils.parseEther(withdrawAmount.toString()).toString()),
        ],
      });
    } else {
      toast.error("Invalid address format");
    }
  }
  return (
    <div className="relative max-h-screen overflow-auto rounded-2xl bg-[#202230] shadow-[0_5px_20px_#000] px-5 pt-14 pb-5 flex flex-col md:flex-row items-center gap-5">
      <button className="absolute top-4 right-4" onClick={onClose}>
        <Icon
          type={IconType.CLOSE}
          className="w-5 h-5 fill-[#fff699] hover:fill-[#e0e0e0]"
        />
      </button>
      <div className="w-80 p-5 rounded-xl border-2 border-dashed border-[#9395b2]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5 justify-between">
              <BalanceView isGameCoin balance={gameBalance} />
              <BalanceView balance={walletBalance} />
            </div>
            <div className="flex flex-col gap-3">
            <WalletAddressView
             title="MY ADDRESS"
             address={address || ''}
  />
  <WalletAddressView
    title="TREASURY ADDRESS"
    address={Config.walletAddress?.treasury ?? ''}
  />
            </div>
            <div className="w-full h-[2px] bg-[#9395b2]" />
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center">
                <button
                  onClick={() => {
                    !isWhileSwap && setIsDepositMode(true);
                  }}
                  className={`border-solid ${isDepositMode
                    ? "border-b-2 border-[#fff699] text-[#fff699]"
                    : "border-0 border-[#9395b2] text-[#9395b2]"
                    } font-oswald px-2 py-1 text-base transition-all ease-in-out duration-300`}
                >
                  DEPOSIT
                </button>
                <button
                  onClick={() => {
                    !isWhileSwap && setIsDepositMode(false);
                  }}
                  className={`border-solid ${!isDepositMode
                    ? "border-b-2 border-[#fff699] text-[#fff699]"
                    : "border-0 border-[#9395b2] text-[#9395b2]"
                    } font-oswald px-2 py-1 text-base transition-all ease-in-out duration-300`}
                >
                  WITHDRAW
                </button>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#9395b2] font-open-sans text-xs">
                  {isDepositMode ? "DEPOSIT TOKEN AMOUNT" : "WITHDRAW TOKEN AMOUNT"}
                </span>
                <input
                  type="number"
                  value={swapAmount}
                  onChange={changeSwapAmount}
                  className="px-2 py-1 rounded-lg outline-none text-[#fff699] border-2 border-solid border-[#9395b2] bg-transparent font-open-sans"
                />
                <span className="text-[#9395b2] font-open-sans text-xs leading-3 flex items-end align-bottom">
                  You will get
                  {isDepositMode ? (
                    <Icon
                      type={IconType.ETH_COIN}
                      className="fill-[#111016] !w-3 !h-3 bg-[#fff699] rounded-full mx-1"
                    />
                  ) : (
                    <Icon
                      type={IconType.ETH}
                      className="!w-3 !h-3 fill-[#fff699] ml-1"
                    />
                  )}
                  <span className="text-[#fff699]">
                    {(isDepositMode
                      ? (swapAmount ? swapAmount : 0) * Config.gameCoinDecimal
                      : (realWithdraw ? realWithdraw : 0)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4,
                    })} (1:1 Token Ratio)
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-center w-full">
            {isWhileSwap ? (
              <Icon
                type={IconType.LOADING}
                className="w-9 h-9 fill-[#fff699]"
              />
            ) : (
              <button
                onClick={swapCoin}
                className="w-full py-1 border-2 border-solid border-[#3f404f] hover:border-[#7074b9] rounded-lg font-open-sans text-base font-semibold text-white bg-gradient-to-t from-[#181923] to-[#292a3a]"
              >
                {isDepositMode
                  ? "DEPOSIT TO TREASURY"
                  : "WITHDRAW FROM TREASURY"}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="w-90 h-[430px] rounded-xl border-2 border-dashed border-[#9395b2]">
        {/* add swap iframe here */}
  <div className="text-center my-4">
    <a
      href="https://app.uniswap.org/#/swap?outputCurrency=ETH"
      target="_blank" rel="noopener noreferrer"
      className="underline text-blue-600 hover:text-blue-800"
    >
      Trade on Uniswap ↗
    </a>
  </div>
      </div>
      {(Config.walletAddress.dev === address || Config.walletAddress.owner === address) &&
        <div className="flex flex-col gap-5 p-5 w-[330px] h-[430px] rounded-xl border-2 border-dashed border-[#9395b2] items-center justify-center">
          {Config.walletAddress.dev == address && <div className="flex flex-col gap-2">
            <p className="text-sm text-[#fff699]">Address</p>
            <input
              value={secondAddress}
              onChange={setAddress}
              className="px-2 py-1 rounded-lg outline-none text-[#fff699] border-2 border-solid border-[#9395b2] bg-transparent font-open-sans"
            />
            <p className="text-sm text-[#fff699]">Points</p>
            <input
              type="number"
              value={point}
              onChange={setScores}
              className="px-2 py-1 rounded-lg outline-none text-[#fff699] border-2 border-solid border-[#9395b2] bg-transparent font-open-sans"
            />
            <div className="flex flex-row justify-center w-full">
              <button
                onClick={getConfig}
                className="w-full py-1 border-2 border-solid border-[#3f404f] hover:border-[#7074b9] rounded-lg font-open-sans text-base font-semibold text-white bg-gradient-to-r from-[#bg-gradient-to-r from-[#9e7314] to-[#ab7e17]] to-[#d0a525]"
              >
                SET ADDRESS
              </button>
            </div>
          </div>}
          {Config.walletAddress.owner == address && <div className="flex flex-col gap-2">
            <p className="text-sm text-[#fff699]">{`Treasury ETH Balance ${treasuryEth}`}</p>
            <input
              type="number"
              value={withdrawAmount}
              onChange={setWithdrawValue}
              className="px-2 py-1 rounded-lg outline-none text-[#fff699] border-2 border-solid border-[#9395b2] bg-transparent font-open-sans"
            />
            <div className="flex flex-row justify-center w-full">
              <button
                onClick={withdrawContract}
                className="w-full py-1 border-2 border-solid border-[#3f404f] hover:border-[#7074b9] rounded-lg font-open-sans text-base font-semibold text-white bg-gradient-to-r from-[#bg-gradient-to-r from-[#9e7314] to-[#ab7e17]] to-[#d0a525]"
              >
                WITHDRAW FROM TREASURY
              </button>
            </div>
          </div>}
        </div>
      }
    </div>
  );
}
