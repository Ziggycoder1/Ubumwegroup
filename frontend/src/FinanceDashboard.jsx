import { useState, useEffect } from "react";
import API_BASE from "./api";
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';

const FinanceDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${API_BASE}/contributions`);
        const data = await res.json();
        // Format each contribution as a transaction row
        const formatted = data.map((item) => ({
          date: item.paidAt ? item.paidAt.slice(0, 10) : "N/A",
          member: item.member?.username || "N/A",
          type: "Contribution",
          amount: item.amount + " RWF",
          balance: "-", // You can calculate running balance if needed
        }));
        setTransactions(formatted);
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <DashboardLayout role="finance">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Financial Overview</h3>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <StatCard title="Total Group Funds" value="5,400,000 RWF" icon="💰" trend="up" />
            <StatCard title="Active Loans" value="2,400,000 RWF" icon="🏦" trend="up" />
            <StatCard title="Pending Penalties" value="50,000 RWF" icon="⚠️" trend="same" />
            <StatCard title="Lottery Fund" value="200,000 RWF" icon="🎟️" trend="down" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
          <button className="btn-view-all">View All</button>
        </div>
        <div className="card-body">
          <TransactionsTable transactions={transactions} loading={loading} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Generate Reports</h3>
        </div>
        <div className="card-body">
          <ReportOptions />
        </div>
      </div>
    </DashboardLayout>
  );
};

const TransactionsTable = ({ transactions, loading }) => (
  <table className="data-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Member</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan={5}>Loading...</td>
        </tr>
      ) : transactions.length === 0 ? (
        <tr>
          <td colSpan={5}>No transactions found.</td>
        </tr>
      ) : (
        transactions.map((tx, idx) => (
          <tr key={idx}>
            <td>{tx.date}</td>
            <td>{tx.member}</td>
            <td>{tx.type}</td>
            <td>{tx.amount}</td>
            <td>{tx.balance}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const ReportOptions = () => (
  <div className="report-options">
    <button className="report-btn">
      <span className="report-icon">📅</span>
      Monthly Contributions
    </button>
    <button className="report-btn">
      <span className="report-icon">🏦</span>
      Loan Portfolio
    </button>
    <button className="report-btn">
      <span className="report-icon">🎟️</span>
      Lottery History
    </button>
    <button className="report-btn">
      <span className="report-icon">⚖️</span>
      Penalties Summary
    </button>
  </div>
);

export default FinanceDashboard;