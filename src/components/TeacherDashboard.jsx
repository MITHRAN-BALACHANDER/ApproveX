import { useState, useEffect } from 'react';
import { dutyRequestAPI, getCurrentUser } from '../services/api';

const TeacherDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('mentor');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    fetchPendingRequests();
  }, [selectedLevel]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await dutyRequestAPI.getPendingApprovals(selectedLevel);
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId, status, remarks = '') => {
    try {
      await dutyRequestAPI.updateApproval(requestId, {
        approvalLevel: selectedLevel,
        status,
        remarks
      });
      
      // Refresh the list
      fetchPendingRequests();
      
      alert(`Request ${status} successfully!`);
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Error updating approval. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user || user.role !== 'teacher') {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Access denied. Only teachers can access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          Teacher Approval Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome {user.profile.fullName} ({user.profile.designation})
        </p>

        {/* Approval Level Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedLevel('mentor')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLevel === 'mentor' 
                ? 'text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ backgroundColor: selectedLevel === 'mentor' ? 'var(--color-primary)' : '' }}
          >
            Mentor Approval
          </button>
          <button
            onClick={() => setSelectedLevel('hod')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLevel === 'hod' 
                ? 'text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ backgroundColor: selectedLevel === 'hod' ? 'var(--color-primary)' : '' }}
          >
            HOD Approval
          </button>
          <button
            onClick={() => setSelectedLevel('principal')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLevel === 'principal' 
                ? 'text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ backgroundColor: selectedLevel === 'principal' ? 'var(--color-primary)' : '' }}
          >
            Principal Approval
          </button>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-dark)' }}>
          Pending {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Approvals
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-primary)' }}></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No pending requests for {selectedLevel} approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <RequestCard 
                key={request._id} 
                request={request} 
                onApproval={handleApproval}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RequestCard = ({ request, onApproval }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApprovalAction = (action) => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const confirmApproval = () => {
    onApproval(request._id, approvalAction, remarks);
    setShowApprovalModal(false);
    setRemarks('');
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {request.studentInfo.fullName}
            </h3>
            <p className="text-sm text-gray-600">
              {request.studentInfo.registerNumber} • {request.studentInfo.department} • {request.studentInfo.year}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            request.overallStatus === 'submitted' ? 'bg-blue-100 text-blue-800' : 
            request.overallStatus === 'under_review' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {request.overallStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Event</p>
            <p className="font-medium">{request.eventDetails.eventTitle}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Reason</p>
            <p className="font-medium capitalize">{request.eventDetails.reasonType.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-medium">
              {formatDate(request.eventDetails.dateRange.startDate)} - {formatDate(request.eventDetails.dateRange.endDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Venue</p>
            <p className="font-medium">{request.eventDetails.venue.city}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
          
          <div className="space-x-2">
            <button
              onClick={() => handleApprovalAction('rejected')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => handleApprovalAction('approved')}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: 'var(--color-success)' }}
            >
              Approve
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Event:</strong> {request.eventDetails.eventTitle}</p>
                  <p><strong>Theme:</strong> {request.eventDetails.eventTheme || 'Not specified'}</p>
                  <p><strong>Venue:</strong> {request.eventDetails.venue.institutionName}, {request.eventDetails.venue.city}</p>
                  <p><strong>Organizer:</strong> {request.eventDetails.organizer.name} ({request.eventDetails.organizer.type})</p>
                  <p><strong>Contact:</strong> {request.eventDetails.organizer.contactInfo || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Academic Impact</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Classes Missed:</strong></p>
                  <p className="bg-gray-50 p-2 rounded text-xs">
                    {request.academicDetails.subjectsMissed?.join(', ') || 'Not specified'}
                  </p>
                  <p><strong>Student Undertaking:</strong></p>
                  <p className="bg-gray-50 p-2 rounded text-xs">
                    {request.academicDetails.undertaking}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {approvalAction === 'approved' ? 'Approve Request' : 'Reject Request'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Remarks {approvalAction === 'rejected' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Add your ${approvalAction === 'approved' ? 'approval' : 'rejection'} remarks...`}
                required={approvalAction === 'rejected'}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                disabled={approvalAction === 'rejected' && !remarks.trim()}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  approvalAction === 'approved' 
                    ? 'hover:opacity-90' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                style={{ backgroundColor: approvalAction === 'approved' ? 'var(--color-success)' : '' }}
              >
                Confirm {approvalAction === 'approved' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherDashboard;
