import DashboardLayout from './DashboardLayout';
import ProfileForm from './ProfileForm';

export default function AdminProfilePage() {
  return (
    <DashboardLayout role="admin">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Admin Profile</h3>
        </div>
        <div className="card-body">
          <ProfileForm role="admin" />
        </div>
      </div>
    </DashboardLayout>
  );
}
