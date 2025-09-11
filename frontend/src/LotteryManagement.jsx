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
  const [currentLotteryData, setCurrentLotteryData] = useState(null);
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

  const fetchCurrentLottery = async () => {
    try {
      const res = await fetch(`${API_BASE}/lottery/current`);
      const data = await res.json();
      setCurrentLotteryData(data);
    } catch (err) {
      console.error('Error fetching current lottery:', err);
    }
  };


  useEffect(() => {
    fetchHistory();
    fetchCurrentLottery();
  }, []);

  // Find current month lottery
  const currentLottery = currentLotteryData?.currentLottery;
  const boughtMonths = currentLotteryData?.boughtMonths || [];
  const totalFund = currentLotteryData?.totalFund || 0;
  const drawDisabled = !!currentLottery && (currentLottery.status === 'active' || currentLottery.status === 'bought');

  const handleDraw = async () => {
    setDrawLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to perform this action');
      }
      
      const res = await fetch(`${API_BASE}/lottery/draw`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ month, year })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to draw lottery');
      setSuccess(`Winner: ${data.winner}`);
      fetchHistory();
      fetchCurrentLottery();
    } catch (err) {
      setError(err.message);
    }
    setDrawLoading(false);
  };

  const handleBuyout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to perform this action');
      }
      
      const res = await fetch(`${API_BASE}/lottery/buyout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          month, 
          year, 
          totalAmount: 10000 
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to buyout lottery');
      setSuccess('Lottery buyout completed successfully');
      fetchHistory();
      fetchCurrentLottery();
    } catch (err) {
      setError(err.message);
    }
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
      render: (lottery) => lottery.boughtBy?.username || lottery.requestedBy?.username || '-'
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
      key: 'amount', 
      label: 'Amount',
      render: (lottery) => lottery.status === 'bought' ? '10000 RWF' : '0 RWF'
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
            
            <div className="status-item">
              <span className="status-label">Total Fund:</span>
              <span className="status-value fund">
                {totalFund.toLocaleString()} RWF
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Bought Months:</span>
              <span className="status-value bought-months">
                {boughtMonths.length > 0 ? boughtMonths.join(', ') : 'None'}
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
                  {currentLottery.boughtBy?.username || currentLottery.requestedBy?.username || 'Unknown'}
                </span>
              </div>
            )}
            
            {currentLottery?.status === 'pending' && (
              <div className="status-item">
                <span className="status-label">Requested by:</span>
                <span className="status-value requested">
                  {currentLottery.requestedBy?.username || 'Unknown'}
                </span>
              </div>
            )}
            
            {currentLottery?.status === 'approved' && (
              <div className="status-item">
                <span className="status-label">Approved by:</span>
                <span className="status-value approved">
                  {currentLottery.approvedBy?.username || 'Unknown'}
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
              disabled={drawLoading || drawDisabled || boughtMonths.includes(month)} 
              className={`btn btn-primary ${drawLoading ? 'loading' : ''}`}
            >
              {drawLoading ? 'Drawing...' : `Draw Lottery for ${month}/${year}`}
            </button>
            
            <button 
              onClick={handleBuyout} 
              disabled={drawLoading || drawDisabled || boughtMonths.includes(month)} 
              className="btn btn-success"
            >
              Buyout Month ({month}/{year}) - 10000 RWF
            </button>
            
            {(drawDisabled || boughtMonths.includes(month)) && (
              <div className="draw-disabled-note">
                <i className="icon-info"></i>
                <span>This month is already processed or bought.</span>
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