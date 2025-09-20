import DashboardLayout from './DashboardLayout';
import LotteryParticipation from './LotteryParticipation';

export default function LotteryParticipationPage() {
  return (
    <DashboardLayout role="member">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Participate in Lottery</h3>
        </div>
        <div className="card-body">
          <LotteryParticipation />
        </div>
      </div>
    </DashboardLayout>
  );
}
