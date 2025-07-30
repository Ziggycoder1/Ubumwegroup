import { useEffect, useState } from 'react';
import API_BASE from './api';
import { useAuth } from './context/AuthContext';

function MemberLoanManagement() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [amount, setAmount] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/loans/${user.id}`);
      const data = await res.json();
      setLoans(data);
    } catch (err) {
      setError('Failed to fetch loans');
    }
    setLoading(false);
  };

  useEffect(() => { if (user?.id) fetchLoans(); }, [user]);

  const handleRequest = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: user.id, amount })
      });
      if (!res.ok) throw new Error('Failed to request loan');
      setSuccess('Loan requested!');
      setAmount('');
      fetchLoans();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>My Loans</h3>
      <form onSubmit={handleRequest} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Loan Amount" required type="number" min="1" style={{ flex: 1, minWidth: 120, color: '#222', background: '#f9f9f9', border: '1px solid #bbb' }} />
        <button type="submit" style={{ minWidth: 100 }}>Request Loan</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Amount</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Interest (%)</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Repayments</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan._id} style={{ background: '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{loan.amount}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{loan.status}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{loan.interest}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>
                  {loan.repayments && loan.repayments.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {loan.repayments.map((r, i) => (
                        <li key={i}>RWF {r.amount} ({new Date(r.paidAt).toLocaleDateString()})</li>
                      ))}
                    </ul>
                  ) : 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MemberLoanManagement; 