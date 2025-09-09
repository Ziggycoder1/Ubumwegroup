import { useEffect, useState } from 'react';
import API_BASE from './api';
import ResponsiveTable from './components/ResponsiveTable';
import './LoanManagement.css';

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
      setError(err.message);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const columns = [
    { 
      key: 'member', 
      label: 'Member',
      render: (loan) => loan.member?.username || 'N/A'
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (loan) => formatCurrency(loan.amount)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (loan) => (
        <span className={`status-badge status-${loan.status}`}>
          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
        </span>
      )
    },
    { 
      key: 'interest', 
      label: 'Interest (%)',
      render: (loan) => `${loan.interest}%`
    },
    { 
      key: 'repayments', 
      label: 'Repayments',
      render: (loan) => (
        loan.repayments?.length > 0 ? (
          <div className="repayments-list">
            {loan.repayments.map((r, i) => (
              <div key={i} className="repayment-item">
                <span className="repayment-amount">{formatCurrency(r.amount)}</span>
                <span className="repayment-date">
                  {new Date(r.paidAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="no-repayments">No repayments yet</span>
        )
      )
    },
    { 
      key: 'returnBy', 
      label: 'Return By',
      render: (loan) => (
        loan.approvedAt ? (
          <div className="return-date">
            {new Date(new Date(loan.approvedAt).setMonth(
              new Date(loan.approvedAt).getMonth() + 3
            )).toLocaleDateString()}
          </div>
        ) : (
          <span className="not-applicable">-</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (loan) => (
        loan.status === 'pending' ? (
          <button 
            onClick={() => handleApprove(loan._id)}
            className="btn btn-approve"
          >
            Approve
          </button>
        ) : (
          <button 
            disabled 
            className="btn btn-approved"
          >
            Approved
          </button>
        )
      )
    }
  ];

  return (
    <div className="loan-management">
      <div className="page-header">
        <h1>Loan Management</h1>
        <p className="page-description">View and manage loan applications and approvals</p>
      </div>

      {(error || success) && (
        <div className="alerts-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Loan Applications</h2>
        </div>
        <div className="table-container">
          <ResponsiveTable 
            columns={columns}
            data={loans}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default LoanManagement;