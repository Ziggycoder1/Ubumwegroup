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

  const getMonthName = (month) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1];
  }

  const statusBadgeStyle = (type) => {
    switch (type) {
      case 'success':
        return { background: '#c6efce', color: '#2e865f', padding: '0.25rem 0.5rem', borderRadius: '20px' };
      case 'error':
        return { background: '#ffcdd2', color: '#c62828', padding: '0.25rem 0.5rem', borderRadius: '20px' };
      case 'info':
        return { background: '#add8e6', color: '#2196f3', padding: '0.25rem 0.5rem', borderRadius: '20px' };
      case 'warning':
        return { background: '#ffe082', color: '#ff9800', padding: '0.25rem 0.5rem', borderRadius: '20px' };
      default:
        return {};
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#9e9e9e' };
      case 'won':
        return { color: '#4caf50' };
      case 'bought':
        return { color: '#ff9800' };
      default:
        return {};
    }
  }

  const formatDate = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

  const TableHeader = ({ children }) => (
    <th style={{ padding: '1rem', background: '#f5f7fa', color: '#2c3e50', borderTop: '1px solid #eaeef5', borderBottom: '1px solid #eaeef5' }}>
      {children}
    </th>
  );

  const TableCell = ({ children, colSpan }) => (
    <td style={{ padding: '1rem', background: '#fff', color: '#2c3e50', borderTop: '1px solid #eaeef5' }} colSpan={colSpan}>
      {children}
    </td>
  );

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>My Lottery Status</h3>
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{ marginTop: 0, color: '#2c3e50' }}>Current Month: {getMonthName(currentMonth)} {currentYear}</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: '#e3f2fd',
            borderRadius: '20px',
            color: '#1976d2',
            fontWeight: 500
          }}>
            Status: <strong>{current ? current.status.toUpperCase() : 'PENDING'}</strong>
          </div>

          {eligible ? (
            <div style={statusBadgeStyle('success')}>
              Eligible for this month's draw
            </div>
          ) : (
            <div style={statusBadgeStyle('error')}>
              Not eligible for this month's draw
            </div>
          )}

          {hasWon && (
            <div style={statusBadgeStyle('info')}>
              You won in the current cycle
            </div>
          )}

          {hasBought && (
            <div style={statusBadgeStyle('warning')}>
              You bought out the lottery
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          borderLeft: '4px solid #ef5350'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading lottery history...</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            background: '#fff',
            color: '#2c3e50',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ background: '#f5f7fa' }}>
                <TableHeader>Month/Year</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Winner</TableHeader>
                <TableHeader>Buyout By</TableHeader>
                <TableHeader>Buyout Date</TableHeader>
                <TableHeader>Draw Date</TableHeader>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map(lottery => (
                  <tr
                    key={lottery._id}
                    style={{
                      background: lottery.boughtBy?._id === user.id ? '#f0f7eb' : '#fff',
                      borderTop: '1px solid #eaeef5'
                    }}
                  >
                    <TableCell>
                      <strong>{getMonthName(lottery.month)} {lottery.year}</strong>
                    </TableCell>
                    <TableCell>
                      <span style={getStatusStyle(lottery.status)}>
                        {lottery.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lottery.winner ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: lottery.winner._id === user.id ? '#4caf50' : '#9e9e9e'
                          }} />
                          {lottery.winner.name}
                          {lottery.winner._id === user.id && ' (You)'}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {lottery.boughtBy ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: lottery.boughtBy._id === user.id ? '#ff9800' : '#9e9e9e'
                          }} />
                          {lottery.boughtBy.name}
                          {lottery.boughtBy._id === user.id && ' (You)'}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {lottery.buyoutDate ? formatDate(lottery.buyoutDate) : '-'}
                    </TableCell>
                    <TableCell>
                      {lottery.drawDate ? formatDate(lottery.drawDate) : '-'}
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <TableCell colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No lottery history found
                  </TableCell>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MemberLotteryStatus;