// src/pages/play/index.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Wallet } from "ethers";
import { useAccount } from "wagmi";
import { generateAndStoreWallet, loadStoredWallet } from "@/utils/wallet";
import {
  fetchBalance as apiFetchBalance,
  fetchTradeHistory,
} from "@/components/api";
import Header from "@/layouts/header";
import BetPanel from "@/layouts/bet-panel";
import SelectPricePanel from "@/layouts/select-price-panel";
import GraphPanel from "@/layouts/graph-panel";
import GameStatus from "@/layouts/game-status";
import ChatPanel, { ChatDataProps } from "@/layouts/chat-panel";
import WalletConnection from "@/components/WalletConnection";
import DepositPanel from "@/components/DepositPanel";
import AuthModal from "@/components/AuthModal";
import Modal from "@/components/modal";
import { Config } from "@/config";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { soundService } from "@/services/soundService";
import { authService, AuthData } from "@/services/authService";
import { useRoundAudio } from "@/hooks/useRoundAudio";
import { RoundPhase } from "@/services/soundService";
import { setIsUpdate } from "@/store/globalState";
import type { PlayerProps } from "@/components/avatar";

const betPrices = Config.betPrices;
const basicPriceCount = Config.roundTime.basic / Config.interval.priceUpdate;
const preparePriceCount =
  Config.roundTime.prepare / Config.interval.priceUpdate;
const playPriceCount = Config.roundTime.play / Config.interval.priceUpdate;
const refreshPriceCount =
  Config.roundTime.refresh / Config.interval.priceUpdate;
const maxPriceCount =
  basicPriceCount + preparePriceCount + playPriceCount + refreshPriceCount;

export interface RoundResultProps {
  playerCount: number;
  winnerCount: number;
  loserCount: number;
  isUpPoolWin: boolean;
  winAmount: number;
}

export interface RecentProps {
  startPrice: number;
  endPrice: number;
}

export default function Home() {
  const dispatch = useDispatch();

  // Round audio integration
  const roundAudio = useRoundAudio({ enabled: true, autoStartAmbience: true });

  // Wagmi hooks for wallet connection
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();

  // Legacy wallet state (for passphrase-based wallets)
  const [localWallet, setLocalWallet] = useState<Wallet | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Game state
  const [jackpotBalance, setJackpotBalance] = useState<number>(0);
  const [recentHistories, setRecentHistories] = useState<RecentProps[]>([]);

  // Current round state (resets with each new round)
  const [currentRoundPlayers, setCurrentRoundPlayers] = useState<PlayerProps[]>([]);
  const [upTreasury, setUpTreasury] = useState<number | null>(null);
  const [downTreasury, setDownTreasury] = useState<number | null>(null);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [bettedBalance, setBettedBalance] = useState<number>(betPrices[0]);
  const [isResultReady, setIsResultReady] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<RoundResultProps | null>(null);
  const [hasWebSocketSettlement, setHasWebSocketSettlement] =
    useState<boolean>(false);

  // Historical/persistent state (preserved across rounds)
  const [recentRoundResults, setRecentRoundResults] = useState<any[]>([]);
  const [persistentPlayers, setPersistentPlayers] = useState<PlayerProps[]>([]);
  const [cumulativeTreasuryUp, setCumulativeTreasuryUp] = useState<number>(0);
  const [cumulativeTreasuryDown, setCumulativeTreasuryDown] = useState<number>(0);
  const [currentRoundStatus, setCurrentRoundStatus] =
    useState<string>("waiting");
  const [ethPrices, setEthPrices] = useState<number[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatData, setChatData] = useState<ChatDataProps[]>([]);
  const [newMessage, setNewMessage] = useState<ChatDataProps>({
    avatar: "",
    message: "",
  });
  const [isChatView, setIsChatView] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastRoundId, setLastRoundId] = useState<string | null>(null);

  // Modal states for wallet integration
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showPassphraseWallet, setShowPassphraseWallet] =
    useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode] = useState<"login" | "register">("login");

  // Authentication state
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const lastReceiveIdRef = useRef<string | number>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fetchedHistoryRef = useRef<boolean>(false);
  const isConnectingRef = useRef<boolean>(false); // Track if connection is in progress

  // Initialize authentication
  useEffect(() => {
    const handleAuthChange = (auth: AuthData | null) => {
      setAuthData(auth);
      setIsLoggedIn(!!auth?.isAuthenticated);

      if (auth) {
        // Update player balance from auth data
        setJackpotBalance(auth.user.balance);
      }
    };

    authService.addListener(handleAuthChange);

    return () => {
      authService.removeListener(handleAuthChange);
    };
  }, []);

  // Sync round status with audio phases
  useEffect(() => {
    const mapStatusToPhase = (status: string): RoundPhase => {
      switch (status) {
        case 'betting':
          return RoundPhase.BETTING;
        case 'playing':
          return RoundPhase.PLAYING;
        case 'settling':
          return RoundPhase.SETTLING;
        case 'completed':
          return RoundPhase.COMPLETED;
        default:
          return RoundPhase.WAITING;
      }
    };

    const phase = mapStatusToPhase(currentRoundStatus);
    console.log(`[Frontend] Syncing audio phase: ${currentRoundStatus} -> ${phase}`);
    roundAudio.setRoundPhase(phase);
  }, [currentRoundStatus, roundAudio]);

  // Initialize wallet connections
  useEffect(() => {
    (async () => {
      const w = await loadStoredWallet("");
      if (w) setLocalWallet(w);
    })();
  }, []);

  // Handle Wagmi wallet connection
  useEffect(() => {
    if (wagmiConnected && wagmiAddress) {
      setAddress(wagmiAddress);
      setIsConnected(true);
      soundService.playNotification();
      toast.success("Wallet connected successfully!");
    } else if (localWallet) {
      setAddress(localWallet.address);
      setIsConnected(true);
    } else {
      setAddress("");
      setIsConnected(false);
    }
  }, [wagmiConnected, wagmiAddress, localWallet]);

  const lastBalanceLoad = useRef<number>(0);
  const BALANCE_THROTTLE_MS = 2000; // Only load balance every 2 seconds max

  const loadBalance = async () => {
    try {
      // Throttle balance loading to prevent excessive API calls
      const now = Date.now();
      if (now - lastBalanceLoad.current < BALANCE_THROTTLE_MS) {
        return;
      }
      lastBalanceLoad.current = now;

      // Check if we're in demo mode
      const auth = authService.getAuth();
      if (auth?.isDemo) {
        // Use demo jackpot balance from auth service
        setJackpotBalance(auth.user.balance);
        return;
      }

      // Only make API call if user is authenticated (not demo and not guest)
      if (!auth?.isAuthenticated) {
        // For guest users, set a default jackpot balance without error
        setJackpotBalance(1000); // Default guest jackpot balance
        return;
      }

      // Regular API call for authenticated users
      const resp = await apiFetchBalance();
      setJackpotBalance(resp.data.balance ?? resp.data.jackpot);
    } catch (error) {
      console.error("Balance loading error:", error);

      // Check if we're in demo mode as fallback
      const auth = authService.getAuth();
      if (auth?.isDemo) {
        setJackpotBalance(auth.user.balance); // Use auth service balance
        return;
      }

      // Only show error for authenticated users, not guests
      if (auth?.isAuthenticated) {
        toast.error("Unable to load jackpot balance");
      } else {
        // For guests, silently set default balance
        setJackpotBalance(1000);
      }
    }
  };

  // Load balance when authentication state changes (but only if authenticated)
  useEffect(() => {
    if (authData?.isAuthenticated || authData?.isDemo) {
      loadBalance();
    } else {
      // For guests, set default balance without API call
      setJackpotBalance(1000);
    }
  }, [authData, isLoggedIn]);

  const loadHistory = async () => {
    const auth = authService.getAuth();
    // Skip fetching history for unauthenticated or demo users to avoid 401 spams
    if (!auth?.isAuthenticated || auth?.isDemo) {
      return;
    }
    try {
      const resp = await fetchTradeHistory();
      setRecentHistories(resp.data.data || []);
    } catch {
      toast.error("Unable to load recent history");
    }
  };

  useEffect(() => {
    if (localWallet) {
      // Only load balance if user is authenticated, demo mode will be handled by auth change effect
      const auth = authService.getAuth();
      if (auth?.isAuthenticated && !auth?.isDemo) {
        loadBalance();
      }
      loadHistory();
    }
  }, [localWallet]);

  useEffect(() => {
    const buildUrl = () => {
      const envUrl = process.env.NEXT_PUBLIC_WSS_URL;
      if (envUrl) return envUrl;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      // Connect to the main backend WebSocket server on port 5001 with /ws path
      return `${protocol}//${host}:5001/ws`;
    };
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let manualClose = false;

    const connect = () => {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current) {
        console.log("[Frontend] Connection already in progress, skipping");
        return;
      }

      // Check if we already have an active connection
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("[Frontend] WebSocket already connected, skipping");
        return;
      }

      isConnectingRef.current = true;
      const url = buildUrl();
      console.log("[Frontend] Attempting WebSocket connection to:", url);
      const newSocket = new WebSocket(url);
      setSocket(newSocket);

      newSocket.onopen = () => {
        console.log("[Frontend] WebSocket connected successfully");

        isConnectingRef.current = false;
        if (reconnectTimer) clearTimeout(reconnectTimer);

        // Sonner handles deduplication automatically
        toast.success("Connected to game server");
      };

      newSocket.onclose = () => {
        console.log("[Frontend] WebSocket disconnected");
        isConnectingRef.current = false;
        setSocket(null);
        if (!manualClose) {
          toast.warning("Connection lost. Reconnecting...");
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      newSocket.onerror = (error) => {
        console.error("[Frontend] WebSocket error:", error);
        isConnectingRef.current = false;
        try {
          newSocket?.close();
        } catch {}
      };

      newSocket.onmessage = (event: MessageEvent<string>) => {
        let payload: any;
        let message: any;

        // Try to parse as base64-encoded JSON first
        try {
          payload = JSON.parse(atob(event.data));
          message = payload?.message;
        } catch {
          // If that fails, try to parse as direct JSON
          try {
            payload = JSON.parse(event.data);
            message = payload?.message || payload;
          } catch {
            // If both fail, treat as plain text message (like server greeting)
            console.log("WS received plain text:", event.data);
            return;
          }
        }

        if (!message || message.id === lastReceiveIdRef.current) return;
        lastReceiveIdRef.current = message.id;

        console.log(
          "[Frontend] Received WebSocket message:",
          message.type,
          message
        );

        switch (message.type) {
          case Config.socketType.btcPrice:
            setEthPrices(message.btcPrices);
            break;
          case Config.socketType.players:
            setCurrentRoundPlayers(message.data);
            // Also update persistent players for continuity
            setPersistentPlayers(prev => {
              const newPlayers = message.data || [];
              // Merge with existing persistent players, updating existing ones
              const merged = [...prev];
              newPlayers.forEach((newPlayer: PlayerProps) => {
                const existingIndex = merged.findIndex(p =>
                  p.address?.toLowerCase() === newPlayer.address?.toLowerCase()
                );
                if (existingIndex >= 0) {
                  merged[existingIndex] = newPlayer;
                } else {
                  merged.push(newPlayer);
                }
              });
              return merged;
            });
            break;
          case "poolUpdate": {
            const d = message.data || message;
            console.log("[Frontend] Pool update received:", d);
            if (!d) break;
            // If activeRoundId is set, only accept updates for that round
            if (activeRoundId && d.roundId && d.roundId !== activeRoundId)
              break;
            if (typeof d?.upTreasury === "number") {
              console.log("[Frontend] Updating up treasury:", d.upTreasury);
              setUpTreasury(d.upTreasury);
            }
            if (typeof d?.downTreasury === "number") {
              console.log("[Frontend] Updating down treasury:", d.downTreasury);
              setDownTreasury(d.downTreasury);
            }
            // If first time, set activeRoundId to incoming
            if (!activeRoundId && d.roundId) setActiveRoundId(d.roundId);
            break;
          }
          case "roundSettled": {
            const d = message.data || message;
            if (d) {
              // Handle round settlement audio
              roundAudio.handleRoundSettlement();

              // Update round result with actual backend data
              const winnerCount = d.winnerCount || 0;
              const loserCount = d.loserCount || 0;
              const totalPlayers =
                d.totalPlayers || d.results?.length || currentRoundPlayers.length;
              const isUpWin = d.winningPool === "up";
              const winAmount = d.totalPayout || 0;

              console.log("[Frontend] Round settled:", {
                winnerCount,
                loserCount,
                totalPlayers,
                isUpWin,
                winAmount,
                winningPool: d.winningPool,
              });

              const newRoundResult = {
                playerCount: totalPlayers,
                winnerCount: winnerCount,
                loserCount: loserCount,
                isUpPoolWin: isUpWin,
                winAmount: winAmount,
              };

              setRoundResult(newRoundResult);

              // Also add to recent results for historical tracking
              setRecentRoundResults(prev => [newRoundResult, ...prev.slice(0, 4)]);
              setIsResultReady(true);
              setHasWebSocketSettlement(true);

              // Auto-clear results after 8 seconds to allow new betting
              setTimeout(() => {
                setIsResultReady(false);
                console.log(
                  "[Frontend] Results cleared automatically, ready for new round"
                );
              }, 8000);

              // Play sound for winners/losers
              const currentAuth = authService.getAuth();
              if (currentAuth && d.results) {
                const userResult = d.results.find((result: any) => {
                  if (currentAuth.isDemo) {
                    return result.guestId === currentAuth.user.id;
                  } else {
                    return result.userId === currentAuth.user.id;
                  }
                });

                if (userResult) {
                  if (userResult.result === "win") {
                    roundAudio.handleWin();
                  } else if (userResult.result === "loss") {
                    roundAudio.handleLoss();
                  }
                }
              }
            }
            break;
          }
          case "roundReady": {
            const d = message.data || message;
            const roundId = d?.roundId;

            // Handle round start audio
            roundAudio.handleRoundStart();

            console.log("[Frontend] roundReady message received:", {
              roundId,
              messageData: d,
              fullMessage: message
            });

            // Sonner handles deduplication automatically
            toast.info("New round started - place your bets!");

            setIsResultReady(false);

            // Preserve the current round result as historical data before clearing
            if (roundResult) {
              setRecentRoundResults(prev => [roundResult, ...prev.slice(0, 4)]); // Keep last 5 results
            }

            // Clear current round result to prepare for new round
            setRoundResult(null);

            // Reset current round specific state but preserve historical data
            setCurrentRoundPlayers([]); // Clear current round players
            setUpTreasury(0); // Reset current round treasury
            setDownTreasury(0);

            // Fetch recent history to update historical context
            fetchRecentHistory();

            break;
          }
          case "balanceUpdate": {
            const d = message.data || message;
            console.log("[Frontend] Balance update received:", d);

            // Handle demo user balance updates
            if (d.isDemo && d.guestId && authData?.isDemo) {
              const currentAuth = authService.getAuth();
              if (currentAuth?.user.id === d.guestId) {
                console.log("[Frontend] Updating demo balance:", d.balance);
                authService.updateBalance(d.balance);
                setJackpotBalance(d.balance); // Also update local state
                toast.success(`Demo balance updated: ${d.balance}`);
              }
            }
            // Handle user balance updates
            else if (d.userId && authData?.user.id === d.userId) {
              console.log("[Frontend] Updating user balance:", d.balance);
              authService.updateBalance(d.balance);
              setJackpotBalance(d.balance); // Also update local state
              toast.success(`Balance updated: ${d.balance}`);
            }
            // Handle regular user balance updates
            else if (
              d.userId &&
              address &&
              d.userId.toLowerCase() === address.toLowerCase()
            ) {
              console.log("[Frontend] Updating user balance:", d.balance);
              authService.updateBalance(d.balance);
              setJackpotBalance(d.balance); // Also update local state
              toast.success(`Balance updated: ${d.balance}`);
            }
            break;
          }
          case Config.socketType.updateMessage:
            setNewMessage({
              avatar: message.data.avatar,
              message: message.data.message,
            });
            break;
          case Config.socketType.basicMessages:
            if (chatData.length === 0) {
              setChatData(
                (message.data as any[]).map((i: any) => ({
                  avatar: i.avatar,
                  message: i.message,
                }))
              );
            }
            break;
          case "betError": {
            const d = message.data || message;
            console.log("[Frontend] Bet error received:", d);
            toast.error(`Bet failed: ${d.error}`);

            // Revert optimistic balance update if it was a demo bet
            const currentAuth = authService.getAuth();
            if (currentAuth?.isDemo && d.originalBet) {
              const revertedBalance =
                (authData?.user.balance || 0) + d.originalBet.bettedBalance;
              setJackpotBalance(revertedBalance);
              authService.updateBalance(revertedBalance);
            }
            break;
          }
          case "priceUpdate": {
            // Universal price updates for all users (authenticated, anonymous, demo, real)
            const d = message.data || message;
            if (d && typeof d.price === 'number') {
              setEthPrices((prev) => {
                const next = [...prev, d.price];
                // Maintain price history limit
                if (next.length > maxPriceCount) {
                  return next.slice(-maxPriceCount);
                }
                return next;
              });
            }
            break;
          }
          default:
            break;
        }
      };
    };

    connect();
    return () => {
      manualClose = true;
      isConnectingRef.current = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      setSocket((prevSocket) => {
        if (prevSocket && prevSocket.readyState === WebSocket.OPEN) {
          prevSocket.close();
        }
        return null;
      });
    };
  }, []);

  // Price updates now come universally from WebSocket for all users
  // No need for demo-specific price simulation

  useEffect(() => {
    if (newMessage.message) {
      setChatData((prev) => [...prev, newMessage]);
      setNewMessage({ avatar: "", message: "" });
    }
  }, [newMessage]);

  // Load history when we have enough price data (removed old result logic that conflicted with WebSocket settlement)
  useEffect(() => {
    if (ethPrices.length >= maxPriceCount && !fetchedHistoryRef.current) {
      fetchedHistoryRef.current = true;
      loadHistory();
    }
  }, [ethPrices]);

  // Initial data fetch when component loads
  useEffect(() => {
    // Fetch recent history on component mount
    fetchRecentHistory();
  }, []);

  // Polling system to replace WebSocket for round info and updates
  useEffect(() => {
    if (!isLoggedIn) return; // Only poll when user is logged in

    setIsPolling(true);
    console.log("[Frontend] Starting round info polling...");

    // Initial fetch
    refreshRoundInfo();

    // Set up polling interval - poll every 2 seconds for active gameplay
    const pollInterval = setInterval(() => {
      refreshRoundInfo();
    }, 2000);

    return () => {
      setIsPolling(false);
      clearInterval(pollInterval);
      console.log("[Frontend] Stopped round info polling");
    };
  }, [isLoggedIn, lastRoundId]); // Re-run when login status or round changes

  // Balance polling for demo users (less frequent)
  useEffect(() => {
    if (!authData?.isDemo) return;

    const balanceInterval = setInterval(async () => {
      try {
        const response = await apiCall("/api/bet/balance", {
          headers: {
            ...(authData?.token && {
              Authorization: `Bearer ${authData.token}`,
            }),
          },
        });

        const data = await response.json();
        if (response.ok && data.balance !== undefined) {
          const currentBalance = authData?.user.balance || 0;
          if (data.balance !== currentBalance) {
            console.log(
              "[Frontend] Balance updated via polling:",
              data.balance
            );
            setJackpotBalance(data.balance);
            authService.updateBalance(data.balance);
          }
        }
      } catch (error) {
        console.error("[Frontend] Balance polling error:", error);
      }
    }, 5000); // Poll balance every 5 seconds for demo users

    return () => clearInterval(balanceInterval);
  }, [authData?.isDemo, authData?.token]);

  // Periodic settlement check - check for settlement results every 10 seconds
  useEffect(() => {
    if (!isLoggedIn) return;

    const settlementInterval = setInterval(async () => {
      // Only check if we're not already showing results
      if (!isResultReady) {
        await fetchAndShowSettlementResults();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(settlementInterval);
  }, [isLoggedIn, isResultReady]);

  const onChangeBet = (newBet: number) => {
    const me = currentRoundPlayers.find(
      (p: PlayerProps) => p.address?.toLowerCase() === address.toLowerCase()
    );
    setBettedBalance(me ? me.bettedBalance : newBet);
  };

  // Utility function for API calls
  const apiCall = async (endpoint: string, options?: RequestInit) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    return fetch(`${apiBaseUrl}${endpoint}`, options);
  };

  // Function to fetch recent round history
  const fetchRecentHistory = async () => {
    try {
      const response = await apiCall("/api/bet/round/recent-history?limit=5");
      const data = await response.json();

      if (response.ok && data.rounds) {
        console.log("[Frontend] Recent history fetched:", data.rounds);
        setRecentRoundResults(data.rounds);

        // Update cumulative treasury totals from historical data
        const totalUp = data.rounds.reduce((sum: number, round: any) => sum + (round.upPoolTotal || 0), 0);
        const totalDown = data.rounds.reduce((sum: number, round: any) => sum + (round.downPoolTotal || 0), 0);
        setCumulativeTreasuryUp(totalUp);
        setCumulativeTreasuryDown(totalDown);
      }
    } catch (error) {
      console.error("[Frontend] Failed to fetch recent history:", error);
    }
  };

  // Function to refresh round information from server
  const refreshRoundInfo = async () => {
    try {
      const response = await apiCall("/api/bet/round?includeHistory=true");
      const data = await response.json();

      if (response.ok && data) {
        console.log("[Frontend] Round info refreshed:", data);

        // Update round status from server
        if (data.status) {
          setCurrentRoundStatus(data.status);
          console.log("[Frontend] Round status updated:", data.status);
        }

        // Update pool treasuries if available
        if (data.upPoolTotal !== undefined) {
          setUpTreasury(data.upPoolTotal);
        }
        if (data.downPoolTotal !== undefined) {
          setDownTreasury(data.downPoolTotal);
        }

        // Update recent history if included
        if (data.recentHistory) {
          setRecentRoundResults(data.recentHistory);
        }

        // Check for round changes (settlement detection)
        if (data.roundId && data.roundId !== lastRoundId) {
          console.log("[Frontend] Round change detected:", {
            old: lastRoundId,
            new: data.roundId,
          });

          // If we had a previous round and it's different, the old round was settled
          if (lastRoundId && data.status === "betting") {
            console.log(
              "[Frontend] Previous round was settled, new round started"
            );

            // Only fetch settlement results if we don't already have results from WebSocket
            if (!hasWebSocketSettlement && !roundResult) {
              console.log(
                "[Frontend] No WebSocket settlement data, fetching from API"
              );
              await fetchAndShowSettlementResults();
            } else {
              console.log(
                "[Frontend] WebSocket settlement data already available, skipping API fetch"
              );
            }
          }

          setLastRoundId(data.roundId);
          setActiveRoundId(data.roundId);

          // Reset WebSocket settlement flag for new round
          setHasWebSocketSettlement(false);
        }

        // Update round status
        if (data.status === "completed" && !isResultReady) {
          // Round completed, show results
          handleRoundSettlement(data);
        }

        return data;
      }
    } catch (error) {
      console.error("[Frontend] Failed to refresh round info:", error);
    }
  };

  // Fetch and show settlement results
  const fetchAndShowSettlementResults = async () => {
    try {
      const response = await apiCall("/api/bet/round/last-settled");
      const settlementData = await response.json();

      if (response.ok && settlementData.hasResults) {
        console.log("[Frontend] Settlement results fetched:", settlementData);
        handleRoundSettlement(settlementData);
      }
    } catch (error) {
      console.error("[Frontend] Failed to fetch settlement results:", error);
    }
  };

  // Handle round settlement
  const handleRoundSettlement = (
    roundData: any,
    isFromWebSocket: boolean = false
  ) => {
    // Don't override WebSocket settlement data with API data
    if (!isFromWebSocket && hasWebSocketSettlement) {
      console.log(
        "[Frontend] Skipping API settlement - WebSocket data already available"
      );
      return;
    }

    if (roundData.hasResults || roundData.results) {
      const winnerCount = roundData.winnerCount || 0;
      const loserCount = roundData.loserCount || 0;
      const totalPlayers =
        roundData.totalPlayers ||
        (roundData.results ? roundData.results.length : 0) ||
        currentRoundPlayers.length;
      const isUpWin = roundData.winningPool === "up";
      const winAmount = roundData.totalPayout || 0;

      console.log("[Frontend] Round settled:", {
        winnerCount,
        loserCount,
        totalPlayers,
        isUpWin,
        winAmount,
        winningPool: roundData.winningPool,
      });

      const newRoundResult = {
        playerCount: totalPlayers,
        winnerCount: winnerCount,
        loserCount: loserCount,
        isUpPoolWin: isUpWin,
        winAmount: winAmount,
      };

      setRoundResult(newRoundResult);

      // Also add to recent results for historical tracking
      setRecentRoundResults(prev => [newRoundResult, ...prev.slice(0, 4)]);
      setIsResultReady(true);
      setHasWebSocketSettlement(true);

      // Auto-clear results after 8 seconds to allow new betting
      setTimeout(() => {
        setIsResultReady(false);
        console.log(
          "[Frontend] Results cleared automatically, ready for new round"
        );
      }, 8000);

      // Play sound for winners
      const currentAuth = authService.getAuth();
      if (currentAuth && roundData.results) {
        const userResult = roundData.results.find((result: any) => {
          if (currentAuth.isDemo) {
            return result.guestId === currentAuth.user.id;
          } else {
            return result.userId === currentAuth.user.id;
          }
        });

        if (userResult && userResult.result === "win") {
          audioRef.current?.play();
        }
      }
    }
  };

  const bet = async (isUp: boolean) => {
    // Clear results overlay if user is trying to bet (allows immediate new round)
    if (isResultReady) {
      setIsResultReady(false);
      console.log(
        "[Frontend] Results cleared by user action, ready for new bet"
      );
    }

    // Check authentication first
    if (!isLoggedIn) {
      toast.warning("Please login or try demo mode to place bets.");
      setShowAuthModal(true);
      return;
    }

    // Check wallet connection for non-demo users
    if (!authData?.isDemo && !isConnected) {
      toast.warning("Connect wallet to bet with real tokens.");
      setShowWalletModal(true);
      return;
    }

    // Check balance
    const currentBalance = authData?.user.balance || 0;
    if (currentBalance < bettedBalance) {
      toast.warning("Insufficient balance");
      return;
    }

    // Place bet
    soundService.playButtonClick();

    try {
      // Prepare bet data for REST API
      const betPayload = {
        amount: bettedBalance,
        direction: isUp ? "up" : "down",
        isDemo: authData?.isDemo || false,
        guestId: authData?.isDemo ? authData.user.id : undefined,
        address: authData?.isDemo ? `demo-${authData.user.id}` : address,
      };

      // Optimistic update: immediately deduct bet amount from balance
      const currentAuth = authService.getAuth();
      if (currentAuth?.isDemo) {
        const newBalance = currentBalance - bettedBalance;
        setJackpotBalance(newBalance);
        authService.updateBalance(newBalance);
      }

      console.log("[Frontend] Placing bet via REST API:", betPayload);

      // Send bet via REST API
      const response = await apiCall("/api/bet/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authData?.token && { Authorization: `Bearer ${authData.token}` }),
        },
        body: JSON.stringify(betPayload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("[Frontend] Bet placed successfully:", result);
        toast.success(
          `Bet placed: ${bettedBalance} on ${isUp ? "UP" : "DOWN"}`
        );

        // Update balance with server response if available
        if (result.balance !== undefined) {
          setJackpotBalance(result.balance);
          if (authData?.isDemo) {
            authService.updateBalance(result.balance);
          }
        }

        // Trigger round info refresh
        await refreshRoundInfo();
      } else {
        console.error("[Frontend] Bet placement failed:", result);
        toast.error(`Bet failed: ${result.error || "Unknown error"}`);

        // Revert optimistic update on failure
        if (currentAuth?.isDemo) {
          setJackpotBalance(currentBalance);
          authService.updateBalance(currentBalance);
        }
      }
    } catch (error) {
      console.error("[Frontend] Bet placement error:", error);
      toast.error("Failed to place bet. Please try again.");

      // Revert optimistic update on error
      const currentAuth = authService.getAuth();
      if (currentAuth?.isDemo) {
        setJackpotBalance(currentBalance);
        authService.updateBalance(currentBalance);
      }
    }

    // Trigger UI updates
    setTimeout(() => {
      dispatch(setIsUpdate());
    }, 100);
  };
  const isBettable = () => {
    // Don't allow betting while results are shown
    if (isResultReady) {
      return false;
    }

    // Check if user is authenticated
    if (!isLoggedIn) {
      return false;
    }

    // Check if user has sufficient balance
    const currentBalance = authData?.user.balance || 0;
    if (currentBalance < bettedBalance) {
      return false;
    }

    // ✅ FIXED: Use server-provided round status instead of ethPrices.length
    // Allow betting only when round is in 'betting' status
    return currentRoundStatus === "betting" && activeRoundId !== null;
  };

  // The UI rendering block remains unchanged from your original file
  // ... (same as in your latest upload)
  // ── Render ──
  return (
    <div className="w-screen relative">
      {/* MAIN CONTENT - Full Width */}
      <div className="w-full transition-all duration-500">
        <Header
          setChatVisible={() => setIsChatView((v) => !v)}
          setReferralLinkData={() => {}}
          isChatview={isChatView}
          hiddenChat={false}
        />
        <main className="h-[calc(100vh-72px)] flex">
          {/* Desktop */}
          <div
            className={`hidden lg:flex flex-row w-full ${
              isChatView ? "xl:flex" : ""
            }`}
          >
            <BetPanel
              isUpPool
              players={currentRoundPlayers.filter((p) => p.isUpPool)}
              treasuryTotal={upTreasury ?? undefined}
              bet={bet}
              isBettable={isBettable()}
              isResultReady={isResultReady}
              roundResult={roundResult!}
              isChatView={isChatView}
            />
            <div className="flex-1 flex flex-col px-5 py-5 gap-5">
              <SelectPricePanel
                betPrices={betPrices}
                bettedPrice={bettedBalance}
                onChangeBet={onChangeBet}
                isBettable={isBettable()}
              />
              <div className="flex-1">
                <GraphPanel
                  ethPrices={ethPrices}
                  jackpot={jackpotBalance}
                  histories={recentHistories}
                />
              </div>
              <GameStatus
                address={address}
                priceCount={ethPrices.length}
                bettedBalance={bettedBalance}
                players={currentRoundPlayers}
              />
            </div>
            <BetPanel
              isUpPool={false}
              players={currentRoundPlayers.filter((p) => !p.isUpPool)}
              treasuryTotal={downTreasury ?? undefined}
              bet={bet}
              isBettable={isBettable()}
              isResultReady={isResultReady}
              roundResult={roundResult!}
              isChatView={isChatView}
            />
          </div>
          {/* Mobile */}
          <div className={`flex lg:hidden flex-col w-full`}>
            <div className="flex-1 px-5 py-5 flex flex-col-reverse gap-5">
              <SelectPricePanel
                betPrices={betPrices}
                bettedPrice={bettedBalance}
                onChangeBet={onChangeBet}
                isBettable={isBettable()}
              />
              <div className="flex-1">
                <GraphPanel
                  ethPrices={ethPrices}
                  jackpot={jackpotBalance}
                  histories={recentHistories}
                />
              </div>
              <GameStatus
                address={address}
                priceCount={ethPrices.length}
                bettedBalance={bettedBalance}
                players={currentRoundPlayers}
              />
            </div>
            <div className="flex justify-between px-5 pb-5">
              <BetPanel
                isUpPool
                players={currentRoundPlayers.filter((p) => p.isUpPool)}
                treasuryTotal={upTreasury ?? undefined}
                bet={bet}
                isBettable={isBettable()}
                isResultReady={isResultReady}
                roundResult={roundResult!}
                isChatView={isChatView}
              />
              <BetPanel
                isUpPool={false}
                players={currentRoundPlayers.filter((p) => !p.isUpPool)}
                treasuryTotal={downTreasury ?? undefined}
                bet={bet}
                isBettable={isBettable()}
                isResultReady={isResultReady}
                roundResult={roundResult!}
                isChatView={isChatView}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(authData) => {
          setAuthData(authData);
          setIsLoggedIn(true);
        }}
        initialMode={authMode}
      />

      {/* Wallet Connection Modal */}
      <Modal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)}>
        <div className="p-6 bg-[#1a1b26] rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <div className="space-y-4">
            <WalletConnection
              onConnectionChange={(connected) => {
                if (connected) {
                  setShowWalletModal(false);
                }
              }}
            />
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-3">
                Or use a passphrase-based wallet
              </div>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setShowPassphraseWallet(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                Use Passphrase Wallet
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      >
        <div className="max-w-lg w-full">
          <DepositPanel
            onDepositSuccess={(_result) => {
              setShowDepositModal(false);
              loadBalance();
            }}
          />
        </div>
      </Modal>

      {/* Passphrase Wallet Modal */}
      <Modal
        isOpen={showPassphraseWallet}
        onClose={() => setShowPassphraseWallet(false)}
      >
        <div className="p-6 bg-[#1a1b26] rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">
            Passphrase Wallet
          </h2>
          <div className="space-y-4">
            <button
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
              onClick={async () => {
                const pass = window.prompt(
                  "Enter passphrase to generate new wallet:"
                );
                if (!pass) return;
                soundService.playButtonClick();
                setLocalWallet(await generateAndStoreWallet(pass));
                setShowPassphraseWallet(false);
              }}
            >
              🆕 Generate Fresh Wallet
            </button>
            <button
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              onClick={async () => {
                const pass = window.prompt(
                  "Enter passphrase to unlock existing wallet:"
                );
                if (!pass) return;
                soundService.playButtonClick();
                const w = await loadStoredWallet(pass);
                if (w) {
                  setLocalWallet(w);
                  setShowPassphraseWallet(false);
                  toast.success("Wallet unlocked successfully!");
                } else {
                  toast.error("Wrong passphrase or no wallet found");
                }
              }}
            >
              🔓 Unlock Existing Wallet
            </button>
            <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <div className="text-yellow-400 text-xs">
                <strong>Note:</strong> Passphrase wallets are stored locally in
                your browser. Make sure to remember your passphrase as it cannot
                be recovered.
              </div>
            </div>
          </div>
        </div>
      </Modal>

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

      <audio ref={audioRef}>
        <source src="/audio/winner.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
