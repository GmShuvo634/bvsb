import React, { useState, useEffect } from "react";
import { fetchBalance, withdraw, fetchTradeHistory } from "@/components/api";
import { toast } from "react-toastify";

export default function WalletPanel({ address }: { address: string }) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<{ type:string; amount:number; date:string }[]>([]);
  const [amount, setAmount]   = useState(0);

  const load = async() => {
    const b = await fetchBalance(); setBalance(b.data.balance);
    const h = await fetchTradeHistory(); setHistory(h.data);
  };

  useEffect(() => { load(); }, []);

  const onWithdraw = async() => {
    try {
      await withdraw(amount);
      toast.success("Withdrawal queued");
      setAmount(0); load();
    } catch {
      toast.error("Withdraw failed");
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h2 className="font-bold mb-2">Your Wallet</h2>
      <p className="mb-4">Address: <code>{address}</code></p>
      <p className="mb-4">Balance: {balance} ETH</p>
      <div className="mb-4">
        <input
          type="number" step="any" min="0"
          value={amount}
          onChange={e=>setAmount(Number(e.target.value))}
          className="px-2 py-1 rounded text-black mr-2"
        />
        <button onClick={onWithdraw} className="px-3 py-1 bg-blue-600 rounded">Withdraw</button>
      </div>
      <h3 className="font-semibold mb-2">History</h3>
      <ul className="text-sm max-h-40 overflow-auto">
        {history.map((h,i)=>(
          <li key={i}>
            [{new Date(h.date).toLocaleString()}] {h.type}: {h.amount} ETH
          </li>
        ))}
      </ul>
    </div>
  );
}

