import DashboardLayout from './DashboardLayout';
import LotteryManagement from './LotteryManagement';

export default function LotteryPage() {
  return (
    <DashboardLayout role="admin">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lottery Management</h3>
        </div>
        <div className="card-body">
          <LotteryManagement />
        </div>
      </div>
    </DashboardLayout>
  );
} 