import DashboardLayout from './DashboardLayout';
import MemberLotteryStatus from './MemberLotteryStatus';

export default function MyLotteryPage() {
  return (
    <DashboardLayout role="member">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Lottery Status</h3>
        </div>
        <div className="card-body">
          <MemberLotteryStatus />
        </div>
      </div>
    </DashboardLayout>
  );
} 