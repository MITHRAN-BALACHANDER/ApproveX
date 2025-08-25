import { useState, useEffect } from 'react';
import { dutyRequestAPI } from '../services/api';

const RequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await dutyRequestAPI.getAll();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Fallback to mock data if API fails
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const mockRequests = [
    {
      _id: '1',
      description: 'On-Duty request',
      status: 'in-progress',
      submittedAt: '2025-04-02'
    },
    {
      _id: '2', 
      description: 'Attendance correction request',
      status: 'resolved',
      submittedAt: '2025-03-28'
    },
    {
      _id: '3',
      description: 'checking',
      status: 'pending',
      submittedAt: '2025-04-03'
    },
    {
      _id: '4',
      description: 'Fake On-Duty found',
      status: 'rejected',
      submittedAt: '2025-04-03'
    }
  ];

  const getStatusBadgeClass = (status) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-semibold mr-4";
    switch (status) {
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'in-progress':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'resolved':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-dark)' }}>
          Your On-Duty Requests
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-dark)' }}>
        Your On-Duty Requests
      </h2>
      <div className="bg-white rounded-xl shadow-lg">
        <ul className="divide-y divide-gray-200">
          {requests.map((request) => (
            <li
              key={request._id}
              className="flex items-center p-4 hover:bg-blue-50 transition-colors duration-200"
            >
              <span className={getStatusBadgeClass(request.status)}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  {request.description || request.name || 'On-Duty Request'}
                </div>
                <div className="text-sm text-gray-500">
                  Submitted: {formatDate(request.submittedAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RequestStatus;
