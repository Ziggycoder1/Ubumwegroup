import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import API_BASE from "./api";
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';

const EarningsDashboard = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch(`${API_BASE}/earnings/summary`);
        if (!res.ok) {
          throw new Error('Failed to fetch earnings data');
        }
        const data = await res.json();
        setEarnings(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  if (loading) {
    return (
      <DashboardLayout role="finance">
        <div className="card">
          <div className="card-body">
            <div className="loading">Loading earnings data...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="finance">
        <div className="card">
          <div className="card-body">
            <div className="error">Error: {error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="finance">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Earnings Overview</h3>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <StatCard 
              title="Total Contributions" 
              value={formatCurrency(earnings.totalEarnings.contributions)} 
              icon="💰" 
              trend="up" 
            />
            <StatCard 
              title="Loan Interest" 
              value={formatCurrency(earnings.totalEarnings.loanInterest)} 
              icon="🏦" 
              trend="up" 
            />
            <StatCard 
              title="Loan Penalties" 
              value={formatCurrency(earnings.totalEarnings.loanPenalty)} 
              icon="⚠️" 
              trend="up" 
            />
            <StatCard 
              title="Lottery Sales" 
              value={formatCurrency(earnings.totalEarnings.lottery)} 
              icon="🎟️" 
              trend="up" 
            />
            <StatCard 
              title="Penalties" 
              value={formatCurrency(earnings.totalEarnings.penalties)} 
              icon="🚫" 
              trend="up" 
            />
            <StatCard 
              title="Total Earnings" 
              value={formatCurrency(earnings.totalEarnings.overall)} 
              icon="📈" 
              trend="up" 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Current Month Earnings</h3>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <StatCard 
              title="Contributions" 
              value={formatCurrency(earnings.currentMonthEarnings.contributions)} 
              icon="💰" 
              trend="up" 
            />
            <StatCard 
              title="Loan Interest" 
              value={formatCurrency(earnings.currentMonthEarnings.loanInterest)} 
              icon="🏦" 
              trend="up" 
            />
            <StatCard 
              title="Loan Penalties" 
              value={formatCurrency(earnings.currentMonthEarnings.loanPenalty)} 
              icon="⚠️" 
              trend="up" 
            />
            <StatCard 
              title="Lottery Sales" 
              value={formatCurrency(earnings.currentMonthEarnings.lottery)} 
              icon="🎟️" 
              trend="up" 
            />
            <StatCard 
              title="Penalties" 
              value={formatCurrency(earnings.currentMonthEarnings.penalties)} 
              icon="🚫" 
              trend="up" 
            />
            <StatCard 
              title="Current Month Total" 
              value={formatCurrency(earnings.currentMonthEarnings.overall)} 
              icon="📈" 
              trend="up" 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Breakdown</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Contributions</th>
                  <th>Loan Interest</th>
                  <th>Loan Penalties</th>
                  <th>Lottery Sales</th>
                  <th>Penalties</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {earnings.monthlyBreakdown.map((monthData) => (
                  <tr key={monthData.month}>
                    <td>{getMonthName(monthData.month)}</td>
                    <td>{formatCurrency(monthData.contributions)}</td>
                    <td>{formatCurrency(monthData.loanInterest)}</td>
                    <td>{formatCurrency(monthData.loanPenalty)}</td>
                    <td>{formatCurrency(monthData.lottery)}</td>
                    <td>{formatCurrency(monthData.penalties)}</td>
                    <td><strong>{formatCurrency(monthData.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="action-buttons">
            <Link to="/finance" className="btn btn-primary">
              Back to Finance Dashboard
            </Link>
            <Link to="/contributions" className="btn btn-secondary">
              View Contributions
            </Link>
            <Link to="/loans" className="btn btn-secondary">
              View Loans
            </Link>
            <Link to="/lottery" className="btn btn-secondary">
              View Lottery
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading, .error {
          text-align: center;
          padding: 2rem;
          font-size: 1.1rem;
        }
        .error {
          color: #dc3545;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .table th,
        .table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }
        .table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          text-decoration: none;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        .btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default EarningsDashboard;
