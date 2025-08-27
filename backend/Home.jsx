import { useEffect, useState } from 'react';

export default function Home({ user }) {
  const [open, setOpen] = useState([]);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState(1);
  const [dir, setDir] = useState('Up');
  const [expiry, setExpiry] = useState(15);

  const fetchTrades = async () => {
    const tkn = localStorage.token;
    const [op, hi] = await Promise.all([
      fetch('/api/trade/open', { headers:{Authorization:`Bearer ${tkn}`}}).then(r=>r.json()),
      fetch('/api/trade/history', { headers:{Authorization:`Bearer ${tkn}`}}).then(r=>r.json())
    ]);
    setOpen(op);
    setHistory(hi);
  };

  useEffect(fetchTrades, []);

  const place = async () => {
    const tkn = localStorage.token;
    const exp = Math.floor(Date.now()/1000) + (+expiry);
    await fetch('/api/trade', {
      method: 'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${tkn}`},
      body: JSON.stringify({amount:+amount,direction:dir,expiry:exp})
    });
    fetchTrades();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Welcome, {user.address}</h1>

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl mb-2">Place a Trade</h2>
        <div className="flex space-x-2">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            className="p-2 border rounded w-20"
          />
          <select value={dir} onChange={e=>setDir(e.target.value)} className="p-2 border rounded">
            <option>Up</option><option>Down</option>
          </select>
          <select value={expiry} onChange={e=>setExpiry(e.target.value)} className="p-2 border rounded">
            <option value="5">5s</option>
            <option value="15">15s</option>
            <option value="30">30s</option>
            <option value="45">45s</option>
            <option value="60">60s</option>
          </select>
          <button onClick={place} className="px-4 bg-blue-600 text-white rounded">Go</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-2">Open Trades</h2>
          {open.length
            ? open.map(t=>(
                <div key={t._id} className="border-b py-1">
                  {t.amount} @ {t.direction} (expires {t.expiry - Math.floor(Date.now()/1000)}s)
                </div>
              ))
            : <p>No open trades</p>
          }
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-2">History</h2>
          {history.length
            ? history.map(t=>(
                <div key={t._id} className="border-b py-1">
                  {t.amount} @ {t.direction} — <strong>{t.won? '✔':'✖'}</strong>
                </div>
              ))
            : <p>No history yet</p>
          }
        </div>
      </div>
    </div>
  );
}
