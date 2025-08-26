import { useState } from 'react';
import DutyRequestForm from '../components/DutyRequestForm';
import TeacherDashboard from '../components/TeacherDashboard';
import ChangePassword from '../components/ChangePassword';

const Home = ({ user }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  const userToken = localStorage.getItem('token');

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Welcome, {user?.name}!
            </h1>
            <button
              onClick={() => setShowChangePassword(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              🔐 Change Password
            </button>
          </div>
          <p className="text-lg text-gray-600">
            Submit your on-duty request using the form below
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <DutyRequestForm />
        </div>

        <ChangePassword
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          userToken={userToken}
          userRole={user?.role}
        />
      </div>
    </div>
  );
};

export default Home;
