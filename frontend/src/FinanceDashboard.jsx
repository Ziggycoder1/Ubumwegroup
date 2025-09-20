import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import API_BASE from "./api";
import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import { useAuth } from './context/AuthContext';
import './FinanceDashboard.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const FinanceDashboard = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({
    summary: {},
    monthlyBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch(`${API_BASE}/earnings/summary`);
        const data = await res.json();
        setEarnings(data);
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError('Failed to fetch earnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  // Prepare data for charts
  const revenueSourcesData = [
    { name: 'Contributions', value: earnings.totalEarnings?.contributions || 0 },
    { name: 'Loan Interest', value: earnings.totalEarnings?.loanInterest || 0 },
    { name: 'Lottery Sales', value: earnings.totalEarnings?.lottery || 0 },
    { name: 'Loan Penalties', value: earnings.totalEarnings?.loanPenalty || 0 },
    { name: 'Other Penalties', value: earnings.totalEarnings?.penalties || 0 },
  ];

  const monthlyData = earnings.monthlyBreakdown || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const totalEarnings = earnings.totalEarnings?.overall || 0;

  if (loading) {
    return (
      <DashboardLayout role="finance">
        <div className="loading">Loading financial data...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="finance">
        <div className="error">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="finance">
      {/* Financial Overview Cards */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Financial Overview</h3>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <StatCard 
              title="Total Earnings" 
              value={formatCurrency(totalEarnings)} 
              icon="💰" 
              trend="up" 
            />
            <StatCard 
              title="Contributions" 
              value={formatCurrency(earnings.totalEarnings?.contributions || 0)} 
              icon="👥" 
              trend="up" 
            />
            <StatCard 
              title="Lottery Revenue" 
              value={formatCurrency(earnings.totalEarnings?.lottery || 0)} 
              icon="🎟️" 
              trend="up" 
            />
          </div>
        </div>
      </div>

      {/* Revenue Sources Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Revenue Sources</h3>
        </div>
        <div className="card-body">
          <div className="charts-grid">
            <div className="chart-container">
              <h4>Revenue Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueSourcesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-container">
              <h4>Revenue by Source</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueSourcesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#8884d8">
                    {revenueSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Earnings Breakdown</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(month) => new Date(2025, month - 1).toLocaleString('default', { month: 'short' })}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(month) => new Date(2025, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              />
              <Legend />
              <Line type="monotone" dataKey="contributions" stroke="#8884d8" name="Contributions" />
              <Line type="monotone" dataKey="loanInterest" stroke="#82ca9d" name="Loan Interest" />
              <Line type="monotone" dataKey="lottery" stroke="#ffc658" name="Lottery Sales" />
              <Line type="monotone" dataKey="penalties" stroke="#ff7300" name="Penalties" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lottery Focus Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lottery Revenue Analysis</h3>
        </div>
        <div className="card-body">
          <div className="lottery-stats">
            <div className="stat-item">
              <h4>Total Lottery Revenue</h4>
              <p className="stat-value">{formatCurrency(earnings.totalEarnings?.lottery || 0)}</p>
            </div>
            <div className="stat-item">
              <h4>This Month</h4>
              <p className="stat-value">{formatCurrency(earnings.currentMonthEarnings?.lottery || 0)}</p>
            </div>
            <div className="stat-item">
              <h4>Lottery Tickets Sold</h4>
              <p className="stat-value">{(earnings.totalEarnings?.lottery || 0) / 10000}</p>
            </div>
          </div>
          
          <div className="chart-container">
            <h4>Monthly Lottery Revenue</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(month) => new Date(2025, month - 1).toLocaleString('default', { month: 'short' })}
                />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="lottery" fill="#ffc658" name="Lottery Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Generate Reports Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Generate Reports</h3>
        </div>
        <div className="card-body">
          <div className="report-options">
            <Link to="/reports" className="report-btn">
              <span className="report-icon">📊</span>
              View Full Financial Report
            </Link>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceDashboard;