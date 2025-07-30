import { useEffect, useState } from 'react';
import API_BASE from './api';

function LoanManagement() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/loans`);
      const data = await res.json();
      setLoans(data);
    } catch (err) {
      setError('Failed to fetch loans');
    }
    setLoading(false);
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async (loanId) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/loans/approve/${loanId}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to approve loan');
      setSuccess('Loan approved!');
      fetchLoans();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ margin: '2rem 0', color: '#222' }}>
      <h3 style={{ color: '#111' }}>Loan Management</h3>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr style={{ background: '#e6eaf3', color: '#111' }}>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Member</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Amount</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Interest (%)</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Repayments</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Return By</th>
              <th style={{ border: '1px solid #b0b0b0', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan._id} style={{ background: '#f9f9f9', color: '#222' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>{loan.member?.username || ''}</td>
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
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>
                  {loan.approvedAt ? new Date(new Date(loan.approvedAt).setMonth(new Date(loan.approvedAt).getMonth() + 3)).toLocaleDateString() : '-'}
                </td>
                <td style={{ border: '1px solid #e0e0e0', padding: 8 }}>
                  {loan.status === 'pending' ? (
                    <button onClick={() => handleApprove(loan._id)} style={{ color: 'green' }}>Approve</button>
                  ) : (
                    <button disabled style={{ color: '#fff', background: '#28a745', border: 'none', borderRadius: 4, padding: '6px 12px', opacity: 0.8 }}>Approved</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LoanManagement; 