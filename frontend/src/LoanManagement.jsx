import { useEffect, useState } from 'react';
import API_BASE from './api';
import ResponsiveTable from './components/ResponsiveTable';
import { useAuth } from './context/AuthContext';
import './LoanManagement.css';

function LoanManagement() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentLoading, setRepaymentLoading] = useState(false);
  
  // Loan request state
  const [loanAmount, setLoanAmount] = useState('');
  const [loanError, setLoanError] = useState('');
  const [loanSuccess, setLoanSuccess] = useState('');

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

  // Handle loan request
  const handleLoanRequest = async (e) => {
    e.preventDefault();
    setLoanError('');
    setLoanSuccess('');
    
    if (!loanAmount || Number(loanAmount) <= 0) {
      setLoanError('Please enter a valid loan amount');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: user.id || user._id, amount: loanAmount })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to request loan');
      }
      
      setLoanSuccess('Loan request submitted successfully!');
      setLoanAmount('');
      fetchLoans(); // Refresh the loans list
    } catch (err) {
      setLoanError(err.message);
    }
  };

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

  const handleAddRepayment = (loan) => {
    setSelectedLoan(loan);
    setRepaymentAmount('');
    setShowRepaymentModal(true);
  };

  const handleRepaymentSubmit = async () => {
    if (!repaymentAmount || isNaN(repaymentAmount) || parseFloat(repaymentAmount) <= 0) {
      setError('Please enter a valid repayment amount');
      return;
    }

    setRepaymentLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE}/loans/admin-repay/${selectedLoan._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(repaymentAmount) }),
      });

      if (!res.ok) throw new Error('Failed to process repayment');

      const data = await res.json();
      setSuccess(`Repayment processed successfully! Interest rate: ${data.interestRate}%, Interest amount: ${formatCurrency(data.interestAmount)}`);
      setShowRepaymentModal(false);
      fetchLoans();
    } catch (err) {
      setError(err.message);
    } finally {
      setRepaymentLoading(false);
    }
  };

  const calculateLoanDetails = (loan) => {
    if (!loan.approvedAt) return { interestRate: 0, interestAmount: 0, totalDue: loan.amount };
    
    const approvalDate = new Date(loan.approvedAt);
    const currentDate = new Date();
    const monthsDiff = Math.floor((currentDate - approvalDate) / (1000 * 60 * 60 * 24 * 30));
    
    let interestRate = 5;
    if (monthsDiff >= 3) {
      interestRate = 10;
    }
    
    const interestAmount = (loan.amount * interestRate) / 100;
    const totalDue = loan.amount + interestAmount;
    
    return { interestRate, interestAmount, totalDue };
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
      key: 'takenDate', 
      label: 'Taken Date',
      render: (loan) => (
        <span className="date-field">
          {loan.approvedAt ? new Date(loan.approvedAt).toLocaleDateString() : '-'}
        </span>
      )
    },
    { 
      key: 'repaidAmount', 
      label: 'Repaid Amount',
      render: (loan) => {
        const totalRepaid = loan.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0;
        return (
          <span className="repaid-amount">
            {formatCurrency(totalRepaid)}
          </span>
        );
      }
    },
    { 
      key: 'remainingBalance', 
      label: 'Remaining Balance',
      render: (loan) => {
        const balance = loan.remainingBalance || 0;
        return (
          <span className={`remaining-balance ${balance > 0 ? 'has-balance' : 'paid-off'}`}>
            {formatCurrency(balance)}
          </span>
        );
      }
    },
    { 
      key: 'returnedDate', 
      label: 'Returned Date',
      render: (loan) => {
        if (loan.status === 'paid' && loan.repayments?.length > 0) {
          const lastRepayment = loan.repayments[loan.repayments.length - 1];
          return (
            <span className="date-field returned">
              {new Date(lastRepayment.paidAt).toLocaleDateString()}
            </span>
          );
        }
        return <span className="date-field">-</span>;
      }
    },
    { 
      key: 'interest', 
      label: 'Interest (%)',
      render: (loan) => `${loan.interest}%`
    },
    { 
      key: 'repayments', 
      label: 'Repayments',
      render: (loan) => {
        const totalRepaid = loan.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0;
        return (
          <span className="repayment-total">
            {formatCurrency(totalRepaid)}
          </span>
        );
      }
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
        <div className="action-buttons">
          {loan.status === 'pending' ? (
            <button 
              onClick={() => handleApprove(loan._id)}
              className="btn btn-approve"
            >
              Approve
            </button>
          ) : loan.status === 'approved' ? (
            <button 
              onClick={() => handleAddRepayment(loan)}
              className="btn btn-edit"
            >
              Add Repayment
            </button>
          ) : (
            <span className="status-paid">Paid</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="loan-management">
      <div className="page-header">
        <h1>Loan Management</h1>
        <p className="page-description">View and manage loan applications and approvals</p>
      </div>

      {(error || success || loanError || loanSuccess) && (
        <div className="alerts-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {loanError && <div className="alert alert-error">{loanError}</div>}
          {loanSuccess && <div className="alert alert-success">{loanSuccess}</div>}
        </div>
      )}

      {/* Loan Request Section */}
      <div className="card">
        <div className="card-header">
          <h2>Request New Loan</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleLoanRequest} className="loan-request-form">
            <div className="form-group">
              <label htmlFor="loanAmount">Loan Amount (RWF)</label>
              <input 
                id="loanAmount"
                type="number" 
                value={loanAmount} 
                onChange={(e) => setLoanAmount(e.target.value)} 
                placeholder="Enter loan amount" 
                required 
                min="1" 
                className="loan-amount-input"
              />
            </div>
            <button type="submit" className="loan-request-button">
              Submit Loan Request
            </button>
          </form>
        </div>
      </div>

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

      {/* Repayment Modal */}
      {showRepaymentModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Repayment</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRepaymentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="loan-details">
                <div className="detail-row">
                  <span className="label">Member:</span>
                  <span className="value">{selectedLoan.member?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Original Loan Amount:</span>
                  <span className="value">{formatCurrency(selectedLoan.originalAmount || selectedLoan.amount)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Remaining Balance:</span>
                  <span className={`value ${(selectedLoan.remainingBalance || 0) > 0 ? 'has-balance' : 'paid-off'}`}>
                    {formatCurrency(selectedLoan.remainingBalance || 0)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Current Interest Rate:</span>
                  <span className="value">{selectedLoan.interest}%</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Interest Paid:</span>
                  <span className="value">{formatCurrency(selectedLoan.totalInterestPaid || 0)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Repaid:</span>
                  <span className="value">{formatCurrency(selectedLoan.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0)}</span>
                </div>
              </div>
              <div className="repayment-form">
                <div className="form-group">
                  <label htmlFor="repaymentAmount">Payment Amount (Principal - RWF):</label>
                  <input
                    type="number"
                    id="repaymentAmount"
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(e.target.value)}
                    placeholder={`Enter amount (max: ${formatCurrency(selectedLoan.remainingBalance || 0)})`}
                    min="1"
                    max={selectedLoan.remainingBalance || 0}
                    required
                  />
                  <small className="payment-help">
                    Interest will be calculated on this amount. Total payment = Principal + Interest
                  </small>
                </div>
                {repaymentAmount && parseFloat(repaymentAmount) > 0 && (
                  <div className="payment-preview">
                    <div className="detail-row">
                      <span className="label">Principal Amount:</span>
                      <span className="value">{formatCurrency(parseFloat(repaymentAmount) || 0)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Interest ({selectedLoan.interest}%):</span>
                      <span className="value">{formatCurrency((parseFloat(repaymentAmount) || 0) * (selectedLoan.interest || 0) / 100)}</span>
                    </div>
                    <div className="detail-row total-row">
                      <span className="label">Total Payment:</span>
                      <span className="value">{formatCurrency((parseFloat(repaymentAmount) || 0) + ((parseFloat(repaymentAmount) || 0) * (selectedLoan.interest || 0) / 100))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-cancel"
                onClick={() => setShowRepaymentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleRepaymentSubmit}
                disabled={repaymentLoading}
              >
                {repaymentLoading ? 'Processing...' : 'Process Repayment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanManagement;