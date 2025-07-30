import DashboardLayout from './DashboardLayout';
import PenaltiesManagement from './PenaltiesManagement';

export default function PenaltiesPage() {
  return (
    <DashboardLayout role="admin">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Penalties Management</h3>
        </div>
        <div className="card-body">
          <PenaltiesManagement />
        </div>
      </div>
    </DashboardLayout>
  );
} 