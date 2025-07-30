import DashboardLayout from './DashboardLayout';
import ContributionManagement from './ContributionManagement';

export default function ContributionsPage() {
  return (
    <DashboardLayout role="admin">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Contribution Management</h3>
        </div>
        <div className="card-body">
          <ContributionManagement />
        </div>
      </div>
    </DashboardLayout>
  );
} 