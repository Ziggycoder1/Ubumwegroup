import DashboardLayout from './DashboardLayout';
import MemberPenalties from './MemberPenalties';

export default function MyPenaltiesPage() {
  return (
    <DashboardLayout role="member">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Penalties</h3>
        </div>
        <div className="card-body">
          <MemberPenalties />
        </div>
      </div>
    </DashboardLayout>
  );
} 