import { useEffect, useState } from 'react';
import API_BASE from './api';
import { useAuth } from './context/AuthContext';

function monthName(num) {
  return [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ][num] || num;
}

function MemberContribution() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContributions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/contributions/${user.id}`);
      const data = await res.json();
      setContributions(data);
    } catch (err) {
      setError('Failed to fetch contributions');
    }
    setLoading(false);
  };

  useEffect(() => { if (user?.id) fetchContributions(); }, [user]);

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>My Contributions</h3>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Amount</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Month</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Year</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map(c => (
              <tr key={c._id} style={{ background: c.status === 'unpaid' ? '#ffeaea' : '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.amount}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{monthName(c.month)}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.year}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{c.paidAt ? new Date(c.paidAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MemberContribution; 