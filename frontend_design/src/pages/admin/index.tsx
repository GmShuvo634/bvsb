// src/pages/admin/index.tsx
"use client";

import React, { useState } from "react";
import { overrideCandle } from "@/components/api";
import { toast } from "sonner";

export default function AdminPage() {
  const [roundId, setRoundId] = useState("");
  const [outcome, setOutcome] = useState<"up" | "down" | "">("");
  const [open, setOpen]       = useState<number>(0);
  const [high, setHigh]       = useState<number>(0);
  const [low, setLow]         = useState<number>(0);
  const [close, setClose]     = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build payload: either outcome or full OHLC
    const payload: any = { roundId };
    if (outcome) {
      payload.outcome = outcome;
    } else {
      payload.open  = open;
      payload.high  = high;
      payload.low   = low;
      payload.close = close;
    }

    try {
      const resp = await overrideCandle(payload);
      toast.success("Candle overridden successfully");
      console.log("Server response:", resp.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Override failed");
    }
  };  // ← HERE: close handleSubmit

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin – Override Candle</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium">Round ID</label>
          <input
            type="text"
            value={roundId}
            onChange={(e) => setRoundId(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded"
            placeholder="e.g. 64a1f3..."
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="font-medium">Outcome</label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as "up" | "down" | "")}
            className="p-2 border rounded"
          >
            <option value="">— explicit OHLC —</option>
            <option value="up">Up (close &gt; open)</option>
            <option value="down">Down (close &lt; open)</option>
          </select>
        </div>

        {outcome === "" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Open</label>
              <input
                type="number"
                step="any"
                value={open}
                onChange={(e) => setOpen(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium">High</label>
              <input
                type="number"
                step="any"
                value={high}
                onChange={(e) => setHigh(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Low</label>
              <input
                type="number"
                step="any"
                value={low}
                onChange={(e) => setLow(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Close</label>
              <input
                type="number"
                step="any"
                value={close}
                onChange={(e) => setClose(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="mt-4 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Override Candle
        </button>
      </form>
    </div>
  );
}

