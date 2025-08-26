import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    approvalLevel: '',
    status: '',
    remarks: ''
  });
  const navigate = useNavigate();

  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
  const teacherToken = localStorage.getItem('teacherToken');

  useEffect(() => {
    if (!teacherToken) {
      navigate('/teacher/login');
      return;
    }
    fetchRequests();
  }, [teacherToken, navigate]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teacher/requests', {
        headers: {
          'Authorization': `Bearer ${teacherToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = (request) => {
    setSelectedRequest(request);
    setReviewData({
      approvalLevel: '',
      status: '',
      remarks: ''
    });
    setReviewModal(true);
  };

  const submitReview = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/review/${selectedRequest._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teacherToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setReviewModal(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh the list
        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Network error occurred');
      console.error('Error submitting review:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherInfo');
    navigate('/teacher/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">Welcome, {teacherInfo.firstName} {teacherInfo.lastName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{requests.length}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                      <dd className="text-lg font-medium text-gray-900">{requests.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {requests.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {requests.filter(r => r.status === 'pending').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {requests.filter(r => r.status === 'approved').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {requests.filter(r => r.status === 'approved').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">OD Requests for Review</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review and approve/reject student on-duty requests
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <li className="px-4 py-4 text-center text-gray-500">
                  No requests available for review
                </li>
              ) : (
                requests.map((request) => (
                  <li key={request._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-400' :
                            request.status === 'approved' ? 'bg-green-400' :
                            'bg-red-400'
                          }`}></div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.studentId?.firstName} {request.studentId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.studentId?.email} • {request.studentId?.rollNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.reason} • {new Date(request.eventDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleReviewRequest(request)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Review OD Request
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <p className="text-sm text-gray-900">
                  {selectedRequest.studentId?.firstName} {selectedRequest.studentId?.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedRequest.studentId?.email}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Event Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedRequest.eventDate).toLocaleDateString()}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Approval Level</label>
                <select
                  value={reviewData.approvalLevel}
                  onChange={(e) => setReviewData({...reviewData, approvalLevel: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="mentor">Mentor</option>
                  <option value="hod">HOD</option>
                  <option value="principal">Principal</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  value={reviewData.remarks}
                  onChange={(e) => setReviewData({...reviewData, remarks: e.target.value})}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Add your comments..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setReviewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={!reviewData.approvalLevel || !reviewData.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
