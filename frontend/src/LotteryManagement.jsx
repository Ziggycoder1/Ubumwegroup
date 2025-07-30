import { useEffect, useState } from 'react';
import API_BASE from './api';

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function LotteryManagement() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [drawLoading, setDrawLoading] = useState(false);
  const { month, year } = getCurrentMonthYear();

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

  useEffect(() => { fetchHistory(); }, []);

  // Find current month lottery
  const currentLottery = history.find(l => l.month === month && l.year === year);
  const drawDisabled = !!currentLottery && (currentLottery.status === 'active' || currentLottery.status === 'bought');

  const handleDraw = async () => {
    setDrawLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/lottery/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to draw lottery');
      setSuccess(`Winner: ${data.winner}`);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    }
    setDrawLoading(false);
  };

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>Lottery Management</h3>
      {/* Current month summary/status */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f0f4fa', borderRadius: 6, border: '1px solid #e0e0e0' }}>
        <strong>Current Month: {month}/{year}</strong><br />
        Status: <span style={{ fontWeight: 600 }}>{currentLottery ? currentLottery.status : 'Not drawn'}</span><br />
        {currentLottery && currentLottery.status === 'active' && (
          <span>Winner: <strong>{currentLottery.winner?.username || '-'}</strong></span>
        )}
        {currentLottery && currentLottery.status === 'bought' && (
          <span>Buyout by: <strong>{currentLottery.boughtBy?.username || '-'}</strong></span>
        )}
        {!currentLottery && <span>No draw or buyout yet for this month.</span>}
      </div>
      <button onClick={handleDraw} disabled={drawLoading || drawDisabled} style={{ marginBottom: 16, background: drawDisabled ? '#bbb' : '#007bff', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 'bold', cursor: drawDisabled ? 'not-allowed' : 'pointer' }}>
        {drawLoading ? 'Drawing...' : `Draw Lottery for ${month}/${year}`}
      </button>
      {drawDisabled && <div style={{ color: '#888', marginBottom: 8 }}>Draw is disabled: already drawn or bought for this month.</div>}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Month/Year</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Winner</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Buyout</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Draw Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map(lottery => (
              <tr key={lottery._id} style={{ background: '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.month}/{lottery.year}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.winner?.username || '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.boughtBy?.username || '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{lottery.drawDate ? new Date(lottery.drawDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LotteryManagement; 