import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { dutyRequestAPI, getCurrentUser } from '../services/api';

const ComprehensiveDutyRequestForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [files, setFiles] = useState({
    invitation: null,
    permissionLetter: null,
    travelProof: null,
    additionalDocs: []
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const watchDates = watch(['startDate', 'endDate']);
  const watchReasonType = watch('reasonType');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData();
      
      // Prepare request data
      const requestData = {
        studentInfo: {
          fullName: data.fullName,
          registerNumber: data.registerNumber,
          department: data.department,
          year: data.year,
          section: data.section
        },
        eventDetails: {
          reasonType: data.reasonType,
          eventTitle: data.eventTitle,
          eventTheme: data.eventTheme || '',
          venue: {
            institutionName: data.institutionName,
            city: data.city,
            address: data.address || ''
          },
          dateRange: {
            startDate: data.startDate,
            endDate: data.endDate,
            startTime: data.startTime || '',
            endTime: data.endTime || ''
          },
          organizer: {
            name: data.organizerName,
            type: data.organizerType,
            contactInfo: data.organizerContact || ''
          }
        },
        academicDetails: {
          subjectsMissed: data.subjectsMissed || [],
          undertaking: data.undertaking || "I undertake to compensate for all missed classes/labs and complete any assignments given during my absence."
        }
      };

      formData.append('requestData', JSON.stringify(requestData));

      // Append files
      if (files.invitation) {
        formData.append('invitation', files.invitation);
      }
      if (files.permissionLetter) {
        formData.append('permissionLetter', files.permissionLetter);
      }
      if (files.travelProof) {
        formData.append('travelProof', files.travelProof);
      }
      if (files.additionalDocs.length > 0) {
        files.additionalDocs.forEach(file => {
          formData.append('additionalDocs', file);
        });
      }

      await dutyRequestAPI.create(formData);
      setSubmitMessage('✅ Request submitted successfully! Your request is now under review.');
      reset();
      setFiles({
        invitation: null,
        permissionLetter: null,
        travelProof: null,
        additionalDocs: []
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitMessage('❌ Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (fieldName, file) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleMultipleFileChange = (files) => {
    setFiles(prev => ({
      ...prev,
      additionalDocs: Array.from(files)
    }));
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Access denied. Only students can submit duty requests.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          Student On-Duty Request Form
        </h2>
        <p style={{ color: 'var(--color-dark)' }}>
          Complete all sections accurately. Incomplete forms will be rejected.
        </p>
      </div>

      {submitMessage && (
        <div className={`p-4 rounded-lg mb-6 ${submitMessage.includes('Error') || submitMessage.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Core Student Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-dark)' }}>
            1. Core Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Full Name (as per college records) *
              </label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                type="text"
                defaultValue={user?.profile?.fullName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Register/Roll Number *
              </label>
              <input
                {...register('registerNumber', { required: 'Register number is required' })}
                type="text"
                defaultValue={user?.profile?.registerNumber}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 21CS001"
              />
              {errors.registerNumber && <p className="text-red-500 text-sm mt-1">{errors.registerNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Department & Year *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  {...register('department', { required: 'Department is required' })}
                  defaultValue={user?.profile?.department}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Dept</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="IT">IT</option>
                </select>
                <select
                  {...register('year', { required: 'Year is required' })}
                  defaultValue={user?.profile?.year}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Year</option>
                  <option value="1st Year">1st</option>
                  <option value="2nd Year">2nd</option>
                  <option value="3rd Year">3rd</option>
                  <option value="4th Year">4th</option>
                </select>
              </div>
              {(errors.department || errors.year) && <p className="text-red-500 text-sm mt-1">Department and year required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Section/Class *
              </label>
              <select
                {...register('section', { required: 'Section is required' })}
                defaultValue={user?.profile?.section}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
              {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section.message}</p>}
            </div>
          </div>
        </div>

        {/* Event/Reason Details */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-dark)' }}>
            2. Event/Reason Details
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Reason for OD *
                </label>
                <select
                  {...register('reasonType', { required: 'Reason type is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select reason</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="symposium">Symposium</option>
                  <option value="internship">Internship</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="placement_drive">Placement Drive</option>
                  <option value="cultural">Cultural Event</option>
                  <option value="sports">Sports Event</option>
                  <option value="medical">Medical</option>
                  <option value="conference">Conference</option>
                  <option value="competition">Competition</option>
                  <option value="training">Training Program</option>
                  <option value="other">Other</option>
                </select>
                {errors.reasonType && <p className="text-red-500 text-sm mt-1">{errors.reasonType.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Event Title & Theme *
                </label>
                <input
                  {...register('eventTitle', { required: 'Event title is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Official event name (not just 'seminar')"
                />
                {errors.eventTitle && <p className="text-red-500 text-sm mt-1">{errors.eventTitle.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Event Theme/Description
              </label>
              <input
                {...register('eventTheme')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the event theme"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Institution/Venue Name *
                </label>
                <input
                  {...register('institutionName', { required: 'Institution name is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="College/Company/Organization name"
                />
                {errors.institutionName && <p className="text-red-500 text-sm mt-1">{errors.institutionName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  City *
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Event city"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Complete Address
              </label>
              <textarea
                {...register('address')}
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full venue address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Start Date *
                </label>
                <input
                  {...register('startDate', { required: 'Start date is required' })}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  End Date *
                </label>
                <input
                  {...register('endDate', { required: 'End date is required' })}
                  type="date"
                  min={watchDates?.[0] || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Start Time
                </label>
                <input
                  {...register('startTime')}
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  End Time
                </label>
                <input
                  {...register('endTime')}
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Organizer Name *
                </label>
                <input
                  {...register('organizerName', { required: 'Organizer name is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Organizing body"
                />
                {errors.organizerName && <p className="text-red-500 text-sm mt-1">{errors.organizerName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Organizer Type *
                </label>
                <select
                  {...register('organizerType', { required: 'Organizer type is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="college">College/University</option>
                  <option value="company">Company/Corporate</option>
                  <option value="club">Club/Society</option>
                  <option value="organization">NGO/Organization</option>
                </select>
                {errors.organizerType && <p className="text-red-500 text-sm mt-1">{errors.organizerType.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                  Contact Information
                </label>
                <input
                  {...register('organizerContact')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone/Email (if external)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Compliance */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-dark)' }}>
            3. Academic Compliance
          </h3>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
              Subjects/Classes That Will Be Missed
            </label>
            <textarea
              {...register('subjectsMissed')}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List subjects, faculty names, dates, and time slots that will be missed during the OD period"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: Subject Name - Faculty Name - Date - Time Slot (e.g., Mathematics - Dr. Smith - 25/08/2025 - 9:00-10:00 AM)
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
              Student Undertaking *
            </label>
            <textarea
              {...register('undertaking', { required: 'Undertaking is required' })}
              rows="3"
              defaultValue="I undertake to compensate for all missed classes/labs and complete any assignments given during my absence. I will coordinate with respective faculty members and classmates to cover the missed content."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.undertaking && <p className="text-red-500 text-sm mt-1">{errors.undertaking.message}</p>}
          </div>
        </div>

        {/* Supporting Documents */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-dark)' }}>
            4. Supporting Documents
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Invitation/Brochure/Circular * (Required)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('invitation', e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Upload official invitation or event brochure (PDF/Image, Max 10MB)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Permission Letter/Nomination Letter
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange('permissionLetter', e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">If external participation (PDF/DOCX, Max 10MB)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Travel Proof (Tickets/Booking)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('travelProof', e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">If travel is required (PDF/Image, Max 10MB)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-dark)' }}>
                Additional Documents
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleMultipleFileChange(e.target.files)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Any additional supporting documents (Max 5 files, 10MB each)</p>
            </div>
          </div>
        </div>

        {/* Student Declaration */}
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-dark)' }}>
            5. Student Declaration
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                {...register('declaration', { required: 'Declaration is required' })}
                type="checkbox"
                className="mt-1 w-4 h-4"
              />
              <label className="text-sm" style={{ color: 'var(--color-dark)' }}>
                I hereby declare that all the information provided is true and correct. I understand that any false information may lead to rejection of my application and disciplinary action. I commit to maintaining good conduct during the OD period and representing the institution positively.
              </label>
            </div>
            {errors.declaration && <p className="text-red-500 text-sm mt-1">Declaration acceptance is required</p>}

            <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-yellow-800">
                <strong>Note:</strong> Submit this form at least 3-5 working days before the event. Emergency requests may not be processed. Keep copies of all submitted documents for your records.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 text-white font-bold text-lg rounded-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isSubmitting ? '🔄 Submitting Request...' : '📤 Submit OD Request'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Your request will be reviewed by Mentor → HOD → Principal
          </p>
        </div>
      </form>
    </div>
  );
};

export default ComprehensiveDutyRequestForm;
