import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers);
      } else {
        throw new Error('Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Fetch teachers error:', error);
      if (error.message.includes('401')) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingTeacher 
        ? `http://localhost:5000/api/admin/teachers/${editingTeacher._id}`
        : 'http://localhost:5000/api/admin/teachers';
      
      const method = editingTeacher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchTeachers();
        setShowCreateForm(false);
        setEditingTeacher(null);
        reset();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const toggleTeacherStatus = async (teacherId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/teachers/${teacherId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchTeachers();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Failed to update teacher status.');
    }
  };

  const startEdit = (teacher) => {
    setEditingTeacher(teacher);
    reset({
      fullName: teacher.profile.fullName,
      email: teacher.email,
      employeeId: teacher.profile.employeeId,
      designation: teacher.profile.designation,
      department: teacher.profile.department
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setShowCreateForm(false);
    reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-gray-600">Manage teachers and their permissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Add New Teacher
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Create/Edit Teacher Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Full name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                      <span className="text-xs text-gray-500 ml-1">(any domain accepted)</span>
                    </label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      disabled={editingTeacher}
                      placeholder="teacher@gmail.com, teacher@yahoo.com, etc."
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                    {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <input
                      type="text"
                      {...register('employeeId', { required: 'Employee ID is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.employeeId && <p className="text-red-600 text-sm">{errors.employeeId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <select
                      {...register('designation', { required: 'Designation is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Designation</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="HOD">HOD</option>
                      <option value="Principal">Principal</option>
                      <option value="Vice Principal">Vice Principal</option>
                    </select>
                    {errors.designation && <p className="text-red-600 text-sm">{errors.designation.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      {...register('department', { required: 'Department is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                      <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Biomedical Engineering">Biomedical Engineering</option>
                    </select>
                    {errors.department && <p className="text-red-600 text-sm">{errors.department.message}</p>}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                      {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Teachers List */}
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Teachers ({teachers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{teacher.profile.fullName}</div>
                        <div className="text-sm text-gray-500">{teacher.profile.designation}</div>
                        <div className="text-sm text-gray-500">ID: {teacher.profile.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.profile.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Total: {teacher.approvalStats?.totalRequests || 0}
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ {teacher.approvalStats?.approved || 0}
                      </div>
                      <div className="text-xs text-red-600">
                        ✗ {teacher.approvalStats?.rejected || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(teacher)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleTeacherStatus(teacher._id)}
                          className={`${
                            teacher.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {teacher.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/teachers/${teacher._id}/performance`)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Performance
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teachers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No teachers found. Add some teachers to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherManagement;
