import { useEffect, useState } from 'react';
import API_BASE from './api';
import ResponsiveTable from './components/ResponsiveTable';
import './LotteryManagement.css';

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

  const lotteryColumns = [
    { 
      key: 'date', 
      label: 'Month/Year',
      render: (lottery) => `${lottery.month}/${lottery.year}`
    },
    { 
      key: 'winner', 
      label: 'Winner',
      render: (lottery) => lottery.winner?.username || '-'
    },
    { 
      key: 'buyout', 
      label: 'Buyout By',
      render: (lottery) => lottery.boughtBy?.username || '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (lottery) => (
        <span className={`status-badge status-${lottery.status}`}>
          {lottery.status.charAt(0).toUpperCase() + lottery.status.slice(1)}
        </span>
      )
    },
    { 
      key: 'drawDate', 
      label: 'Draw Date',
      render: (lottery) => lottery.drawDate ? new Date(lottery.drawDate).toLocaleDateString() : '-'
    }
  ];

  return (
    <div className="lottery-management">
      <div className="page-header">
        <h1>Lottery Management</h1>
        <p className="page-description">Manage monthly lottery draws and view history</p>
      </div>

      {(error || success) && (
        <div className="alerts-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      )}

      <div className="card current-lottery">
        <div className="card-header">
          <h2>Current Month: {month}/{year}</h2>
        </div>
        <div className="card-body">
          <div className="status-summary">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value status-${currentLottery?.status || 'pending'}`}>
                {currentLottery ? currentLottery.status.charAt(0).toUpperCase() + currentLottery.status.slice(1) : 'Not drawn'}
              </span>
            </div>
            
            {currentLottery?.status === 'active' && (
              <div className="status-item">
                <span className="status-label">Winner:</span>
                <span className="status-value winner">
                  {currentLottery.winner?.username || 'Not available'}
                </span>
              </div>
            )}
            
            {currentLottery?.status === 'bought' && (
              <div className="status-item">
                <span className="status-label">Buyout by:</span>
                <span className="status-value buyout">
                  {currentLottery.boughtBy?.username || 'Unknown'}
                </span>
              </div>
            )}
            
            {!currentLottery && (
              <div className="no-lottery">
                No draw or buyout recorded for this month.
              </div>
            )}
          </div>
          
          <div className="actions">
            <button 
              onClick={handleDraw} 
              disabled={drawLoading || drawDisabled} 
              className={`btn btn-primary ${drawLoading ? 'loading' : ''}`}
            >
              {drawLoading ? 'Drawing...' : `Draw Lottery for ${month}/${year}`}
            </button>
            
            {drawDisabled && (
              <div className="draw-disabled-note">
                <i className="icon-info"></i>
                <span>Draw is disabled: already drawn or bought for this month.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Lottery History</h2>
        </div>
        <div className="table-container">
          <ResponsiveTable 
            columns={lotteryColumns}
            data={history}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default LotteryManagement; 