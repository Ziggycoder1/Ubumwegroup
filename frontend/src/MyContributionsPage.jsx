import DashboardLayout from './DashboardLayout';
import MemberContribution from './MemberContribution';

export default function MyContributionsPage() {
  return (
    <DashboardLayout role="member">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Contributions</h3>
        </div>
        <div className="card-body">
          <MemberContribution />
        </div>
      </div>
    </DashboardLayout>
  );
} 