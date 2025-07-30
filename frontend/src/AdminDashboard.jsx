import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import MemberManagement from './MemberManagement';

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">System Overview</h3>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <StatCard title="Total Members" value="12" icon="👥" trend="up" />
            <StatCard title="Pending Loans" value="3" icon="🏦" trend="up" />
            <StatCard title="Monthly Contributions" value="1,200,000 RWF" icon="💰" trend="same" />
            <StatCard title="Active Penalties" value="2" icon="⚠️" trend="down" />
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
          <LotteryStatus />
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

const LoanRequestsTable = () => (
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
        <tr style={{ background: '#f9f9f9' }}>
          <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>John Doe</td>
          <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>200,000 RWF</td>
          <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>2023-06-15</td>
          <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}><span className="status-badge pending" style={{ background: '#ffeeba', color: '#856404', padding: '4px 10px', borderRadius: 6 }}>Pending</span></td>
          <td style={{ border: '1px solid #e0e0e0', padding: '10px' }}>
            <button className="btn-action approve" style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', marginRight: 6 }}>Approve</button>
            <button className="btn-action reject" style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}>Reject</button>
          </td>
        </tr>
        {/* More rows... */}
      </tbody>
    </table>
  </div>
);

const LotteryStatus = () => (
  <div className="lottery-status">
    <div className="lottery-info">
      <div className="lottery-stat">
        <span className="stat-label">Current Month:</span>
        <span className="stat-value">June 2023</span>
      </div>
      <div className="lottery-stat">
        <span className="stat-label">Status:</span>
        <span className="stat-value active">Active</span>
      </div>
      <div className="lottery-stat">
        <span className="stat-label">Eligible Members:</span>
        <span className="stat-value">10</span>
      </div>
    </div>
    <button className="btn-draw">Conduct Lottery Draw</button>
  </div>
);

export default AdminDashboard;