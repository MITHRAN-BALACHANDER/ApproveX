import DutyRequestForm from '../components/DutyRequestForm';
import TeacherDashboard from '../components/TeacherDashboard';

const Home = ({ user }) => {
  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600">
            Submit your on-duty request using the form below
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <DutyRequestForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
