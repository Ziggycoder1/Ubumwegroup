import { useEffect, useState } from 'react';
import API_BASE from './api';
import { useAuth } from './context/AuthContext';

function MemberLotteryStatus() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/lottery/history`);
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError('Failed to fetch lottery history');
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // Find if user is eligible for the current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const current = history.find(l => l.month === currentMonth && l.year === currentYear);
  let eligible = true;
  if (current) {
    if (current.winner && current.winner._id === user.id) eligible = false;
    if (current.boughtBy && current.boughtBy._id === user.id) eligible = false;
  }
  // Check if user has won in the current cycle
  const hasWon = history.some(l => l.winner && l.winner._id === user.id);
  const hasBought = history.some(l => l.boughtBy && l.boughtBy._id === user.id);

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>My Lottery Status</h3>
      <div style={{ marginBottom: 16, padding: 12, background: '#f0f4fa', borderRadius: 6, border: '1px solid #e0e0e0' }}>
        <strong>Current Month: {currentMonth}/{currentYear}</strong><br />
        Status: <span style={{ fontWeight: 600 }}>{current ? current.status : 'Not drawn'}</span><br />
        {eligible ? <span style={{ color: 'green' }}>You are eligible for this month’s draw.</span> : <span style={{ color: 'red' }}>You are not eligible for this month’s draw.</span>}<br />
        {hasWon && <span style={{ color: 'blue' }}>You have won in the current cycle.</span>}
        {hasBought && <span style={{ color: 'orange' }}>You have bought out the lottery in the current cycle.</span>}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Month/Year</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Winner</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Buyout</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Draw Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map(lottery => (
              <tr key={lottery._id} style={{ background: '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.month}/{lottery.year}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.winner?.name || '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.boughtBy?.name || '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.drawDate ? new Date(lottery.drawDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MemberLotteryStatus; 