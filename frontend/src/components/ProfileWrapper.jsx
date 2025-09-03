import { useAuth } from '../context/AuthContext';
import AdminProfilePage from '../AdminProfilePage';
import MemberProfilePage from '../MemberProfilePage';
import FinanceProfilePage from '../FinanceProfilePage';

export default function ProfileWrapper() {
  const { user } = useAuth();
  
  console.log('ProfileWrapper - User:', user);
  console.log('ProfileWrapper - User role:', user?.role);
  
  // Convert role to lowercase for case-insensitive comparison
  const role = user?.role?.toLowerCase();
  
  switch (role) {
    case 'admin':
      return <AdminProfilePage />;
    case 'member':
      return <MemberProfilePage />;
    case 'finance':
      return <FinanceProfilePage />;
    default:
      // Fallback to member profile if role is not recognized
      console.warn('Unknown role, defaulting to member profile');
      return <MemberProfilePage />;
  }
}
