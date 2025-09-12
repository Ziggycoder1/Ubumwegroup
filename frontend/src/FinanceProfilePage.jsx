import DashboardLayout from './DashboardLayout';
import ProfileForm from './ProfileForm';
import './FinanceProfilePage.css';

export default function FinanceProfilePage() {
  return (
    <DashboardLayout role="finance">
      <div className="finance-profile-container">
        <div className="finance-profile-card">
          <div className="finance-profile-header">
            <h3 className="finance-profile-title">Finance Officer Profile</h3>
            <div className="finance-profile-icon">💰</div>
          </div>
          <div className="finance-profile-body">
            <ProfileForm role="finance" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
