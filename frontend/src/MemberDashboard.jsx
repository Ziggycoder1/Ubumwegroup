import DashboardLayout from './DashboardLayout';
import StatCard from './StatCard';
import LotteryParticipation from './LotteryParticipation';

const MemberDashboard = () => {
  return (
    <DashboardLayout role="member">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Status</h3>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <StatCard title="My Contributions" value="600,000 RWF" icon="💰" trend="up" />
            <StatCard title="My Loans" value="200,000 RWF" icon="🏦" trend="down" />
            <StatCard title="Lottery Eligibility" value="Eligible" icon="🎟️" trend="same" />
            <StatCard title="Active Penalties" value="0" icon="⚠️" trend="same" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Participate in Lottery</h3>
        </div>
        <div className="card-body">
          <LotteryParticipation />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Loan Options</h3>
        </div>
        <div className="card-body">
          {/* LoanOptions component or content here */}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lottery Information</h3>
        </div>
        <div className="card-body">
          {/* MemberLotteryStatus component or content here */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;