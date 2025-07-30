import DashboardLayout from './DashboardLayout';
import MemberManagement from './MemberManagement';

export default function MembersPage() {
  return (
    <DashboardLayout role="admin">
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
} 