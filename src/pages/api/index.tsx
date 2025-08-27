// src/pages/api/index.tsx
import axios from "axios";
import { Config } from "@/config";

const serverUrl = Config.serverUrl.https;

// Helper to grab the JWT from localStorage (or adapt if you store it elsewhere)
function getAuthHeader() {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const balanceRequest = async (address: string) => {
  try {
    const resp = await axios.get(
      `${serverUrl}/api/fund`,
      { headers: getAuthHeader() }
    );
    return {
      result: true,
      balance: resp.data.balance,
      avatar: resp.data.avatar,
      country: resp.data.country,
    };
  } catch (err: any) {
    return {
      result: false,
      error: err.response?.data?.error || err.message,
    };
  }
};

export const swapCoinRequest = async (
  address: string,
  isDepositMode: boolean,
  amount: string
) => {
  try {
    // backend expects { amount: number } on POST /api/fund
    await axios.post(
      `${serverUrl}/api/fund`,
      { amount: parseFloat(amount) },
      { headers: getAuthHeader() }
    );
    return { result: true };
  } catch (err: any) {
    return {
      result: false,
      error: err.response?.data?.error || err.message,
    };
  }
};

