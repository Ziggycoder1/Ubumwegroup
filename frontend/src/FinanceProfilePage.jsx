import DashboardLayout from './DashboardLayout';
import ProfileForm from './ProfileForm';

export default function FinanceProfilePage() {
  return (
    <DashboardLayout role="finance">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Finance Officer Profile</h3>
        </div>
        <div className="card-body">
          <ProfileForm role="finance" />
        </div>
      </div>
    </DashboardLayout>
  );
}
