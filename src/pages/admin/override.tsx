'use client';
import { useState } from 'react';
import axios from 'axios';

type FormData = {
  roundNumber: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

export default function AdminOverride() {
  const [form, setForm] = useState<FormData>({ roundNumber: '', open: '', high: '', low: '', close: '' });
  const [msg, setMsg] = useState('');
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/override-candle', {
        roundNumber: Number(form.roundNumber),
        open:  Number(form.open),
        high:  Number(form.high),
        low:   Number(form.low),
        close: Number(form.close),
      });
      setMsg('Success: ' + JSON.stringify(res.data.round));
    } catch (err: any) {
      setMsg('Error: ' + err.response?.data?.error || err.message);
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-xl mb-4">Admin Candle Override</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        {(['roundNumber','open','high','low','close'] as const).map((key)=>(
          <div key={key}>
            <label className="block">{key}</label>
            <input
              type="number"
              step="any"
              className="border p-1"
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white">Override</button>
      </form>
      {msg && <pre className="mt-4">{msg}</pre>}
    </div>
  );
}

