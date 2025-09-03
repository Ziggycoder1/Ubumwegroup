import DashboardLayout from './DashboardLayout';
import ProfileForm from './ProfileForm';

export default function MemberProfilePage() {
  return (
    <DashboardLayout role="member">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Member Profile</h3>
        </div>
        <div className="card-body">
          <ProfileForm role="member" />
        </div>
      </div>
    </DashboardLayout>
  );
}
