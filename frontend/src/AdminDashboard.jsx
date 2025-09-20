import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import MemberManagement from './MemberManagement';
import { useAuth } from './context/AuthContext';

import { useState, useEffect } from 'react';
import API_BASE from './api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lotteryData, setLotteryData] = useState({
    currentMonth: 'August 2023',
    status: 'Active',
    eligibleMembers: 0,
    totalPot: 0,
    nextDraw: ''
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        // Fetch only the endpoints that exist
        const [
          usersRes, 
          loansRes, 
          contribRes, 
          penRes
        ] = await Promise.all([
          fetch(`${API_BASE}/users`),
          fetch(`${API_BASE}/loans`),
          fetch(`${API_BASE}/contributions`),
          fetch(`${API_BASE}/penalties`)
        ]);

        // Parse responses
        const [
          users, 
          allLoans, 
          allContributions, 
          allPenalties
        ] = await Promise.all([
          usersRes.json(),
          loansRes.json(),
          contribRes.json(),
          penRes.json()
        ]);

        setMembers(users);
        setLoans(allLoans);
        setContributions(allContributions);
        setPenalties(allPenalties);
        
        // Set default lottery data since the endpoint doesn't exist
        setLotteryData({
          currentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          status: 'Inactive',
          eligibleMembers: 0,
          totalPot: 0,
          nextDraw: 'Not scheduled'
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setMembers([]);
        setLoans([]);
        setContributions([]);
        setPenalties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Calculate stats
  const totalMembers = members.length;
  const pendingLoans = loans.filter(l => l.status && l.status.toLowerCase() === 'pending').length;
  
  // Total contributions (all paid contributions)
  const totalContributions = contributions
    .filter(c => c.status && c.status.toLowerCase() === 'paid')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    
  // Count all penalties (both paid and unpaid)
  const totalPenalties = penalties.length;
  
  // Check if there's a lottery winner in the current month
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const hasWinner = members.some(member => 
    member.lotteryWinDate && 
    new Date(member.lotteryWinDate).getMonth() === new Date().getMonth() &&
    new Date(member.lotteryWinDate).getFullYear() === currentYear
  );
  
  // Get lottery winner if exists
  const lotteryWinner = hasWinner ? members.find(member => 
    member.lotteryWinDate && 
    new Date(member.lotteryWinDate).getMonth() === new Date().getMonth() &&
    new Date(member.lotteryWinDate).getFullYear() === currentYear
  ) : null;

  return (
    <DashboardLayout role="admin">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">System Overview</h3>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <StatCard title="Total Members" value={loading ? '...' : totalMembers} icon="👥" trend="up" />
            <StatCard title="Pending Loans" value={loading ? '...' : pendingLoans} icon="🏦" trend="up" />
            <StatCard 
              title="Total Contributions" 
              value={loading ? '...' : `${totalContributions.toLocaleString()} RWF`} 
              icon="💰" 
              trend="same" 
            />
            <StatCard 
              title="Total Penalties" 
              value={loading ? '...' : totalPenalties} 
              icon="⚠️" 
              trend="down" 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Loan Approval Requests</h3>
          <button className="btn-view-all">View All</button>
        </div>
        <div className="card-body">
          <LoanRequestsTable />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lottery Status</h3>
        </div>
        <div className="card-body">
          <LotteryStatus 
            data={{
              ...lotteryData,
              status: hasWinner ? 'Completed' : 'Inactive',
              winner: lotteryWinner ? {
                name: lotteryWinner.name || lotteryWinner.username || 'Unknown',
                amount: lotteryWinner.lotteryWinAmount || 'N/A',
                date: lotteryWinner.lotteryWinDate ? new Date(lotteryWinner.lotteryWinDate).toLocaleDateString() : 'N/A'
              } : null
            }} 
            loading={loading} 
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Member Management</h3>
        </div>
        <div className="card-body">
          <MemberManagement />
        </div>
      </div>
    </DashboardLayout>
  );
};

const LoanRequestsTable = () => {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [loansRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/loans`),
          fetch(`${API_BASE}/users`)
        ]);
        const loansData = await loansRes.json();
        const usersData = await usersRes.json();
        setLoans(loansData.filter(l => l.status === 'pending'));
        setMembers(usersData);
      } catch (err) {
        setLoans([]);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMemberName = (userId) => {
    const user = members.find(m => m.id === userId || m._id === userId);
    if (!user) return 'Unknown';
    return user.name || user.fullName || user.username || user.email || 'Unknown';
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
        <thead>
          <tr style={{ background: '#f0f4fa', color: '#222' }}>
            <th style={{ border: '1px solid #e0e0e0', padding: '10px' }}>Member</th>
            <th style={{ border: '1px solid #e0e0e0', padding: '10px' }}>Amount</th>
            <th style={{ border: '1px solid #e0e0e0', padding: '10px' }}>Request Date</th>
            <th style={{ border: '1px solid #e0e0e0', padding: '10px' }}>Status</th>
            <th style={{ border: '1px solid #e0e0e0', padding: '10px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
          ) : loans.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center' }}>No pending loan requests</td></tr>
          ) : (
            loans.map((loan) => (
              <tr key={loan.id || loan._id} style={{ background: '#f9f9f9' }}>
                <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>{getMemberName(loan.userId || loan.memberId)}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>{loan.amount ? `${Number(loan.amount).toLocaleString()} RWF` : '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>{loan.requestDate ? new Date(loan.requestDate).toLocaleDateString() : '-'}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>
                  <span className="status-badge pending" style={{ background: '#ffeeba', color: '#856404', padding: '4px 10px', borderRadius: 6 }}>Pending</span>
                </td>
                <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>
                  <button
                    className="btn-action approve"
                    style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', marginRight: 6 }}
                    disabled={loan._actionLoading}
                    onClick={async () => {
                      setLoans(loans => loans.map(l => (l._id === loan._id || l.id === loan.id) ? { ...l, _actionLoading: true } : l));
                      try {
                        await fetch(`${API_BASE}/loans/${loan._id || loan.id}/approve`, { method: 'POST' });
                        // Refetch loans after action
                        const loansRes = await fetch(`${API_BASE}/loans`);
                        const loansData = await loansRes.json();
                        setLoans(loansData.filter(l => l.status === 'pending'));
                      } catch (err) {
                        alert('Failed to approve loan.');
                      } finally {
                        setLoans(loans => loans.map(l => (l._id === loan._id || l.id === loan.id) ? { ...l, _actionLoading: false } : l));
                      }
                    }}
                  >
                    {loan._actionLoading ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    className="btn-action reject"
                    style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}
                    disabled={loan._actionLoading}
                    onClick={async () => {
                      setLoans(loans => loans.map(l => (l._id === loan._id || l.id === loan.id) ? { ...l, _actionLoading: true } : l));
                      try {
                        await fetch(`${API_BASE}/loans/${loan._id || loan.id}/reject`, { method: 'POST' });
                        // Refetch loans after action
                        const loansRes = await fetch(`${API_BASE}/loans`);
                        const loansData = await loansRes.json();
                        setLoans(loansData.filter(l => l.status === 'pending'));
                      } catch (err) {
                        alert('Failed to reject loan.');
                      } finally {
                        setLoans(loans => loans.map(l => (l._id === loan._id || l.id === loan.id) ? { ...l, _actionLoading: false } : l));
                      }
                    }}
                  >
                    {loan._actionLoading ? 'Rejecting...' : 'Reject'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const LotteryStatus = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="lottery-status">
        <div className="text-center py-4">Loading lottery data...</div>
      </div>
    );
  }

  return (
    <div className="lottery-status">
      <div className="lottery-info">
        <div className="lottery-stat">
          <span className="stat-label">Current Status:</span>
          <span className={`stat-value ${data.status === 'Completed' ? 'completed' : 'inactive'}`}>
            {data.status}
            {data.status === 'Completed' && data.winner && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f0f8ff', borderRadius: '5px' }}>
                <div><strong>Winner:</strong> {data.winner.name}</div>
                <div><strong>Amount Won:</strong> {data.winner.amount}</div>
                <div><strong>Date Won:</strong> {data.winner.date}</div>
              </div>
            )}
          </span>
        </div>
        <div className="lottery-stat">
          <span className="stat-label">Eligible Members:</span>
          <span className="stat-value">{data.eligibleMembers}</span>
        </div>
        <div className="lottery-stat">
          <span className="stat-label">Total Pot:</span>
          <span className="stat-value">
            {new Intl.NumberFormat('en-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(data.totalPot)}
          </span>
        </div>
        <div className="lottery-stat">
          <span className="stat-label">Next Draw:</span>
          <span className="stat-value">{data.status === 'Completed' ? 'Already drawn for this month' : data.nextDraw}</span>
        </div>
      </div>
      <button 
        className="btn-draw"
        disabled={data.status !== 'Active'}
        title={data.status !== 'Active' ? 'Lottery is not active or already completed' : 'Conduct lottery draw now'}
      >
        {data.status === 'Completed' ? 'Draw Completed' : 'Conduct Lottery Draw'}
      </button>
    </div>
  );
};

export default AdminDashboard;