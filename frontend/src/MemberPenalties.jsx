import { useEffect, useState } from 'react';
import API_BASE from './api';
import { useAuth } from './context/AuthContext';

function MemberPenalties() {
  const { user } = useAuth();
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPenalties = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/penalties?member=${user.id}`);
        const data = await res.json();
        setPenalties(data);
      } catch (err) {
        setError('Failed to fetch penalties');
      }
      setLoading(false);
    };
    if (user?.id) fetchPenalties();
  }, [user]);

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>My Penalties</h3>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Reason</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Amount</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Assigned</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Paid</th>
            </tr>
          </thead>
          <tbody>
            {penalties.map(p => (
              <tr key={p._id} style={{ background: p.status === 'unpaid' ? '#ffeaea' : '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.reason}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.amount}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.assignedAt ? new Date(p.assignedAt).toLocaleDateString() : '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MemberPenalties; 