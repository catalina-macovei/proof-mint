import React, { useEffect, useState } from 'react';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const fetchStudentApplications = async () => {
      try {
        const walletAddress = sessionStorage.getItem('walletAddress');
        if (!walletAddress) {
          setMessage('User not logged in or Ethereum address missing.');
          setMessageType('error');
          setLoading(false);
          return;
        }

        // Get user info
        const userResponse = await fetch(`/users/eth/${walletAddress}`);
        if (!userResponse.ok) throw new Error('User not found');
        const userData = await userResponse.json();
        setUserInfo(userData);

        // Get student info
        const userID = userData.UserID || userData.userid;
        const studentResponse = await fetch(`/students/user/${userID}`);
        if (!studentResponse.ok) throw new Error('Student not found');
        const studentData = await studentResponse.json();
        setStudentInfo(studentData);

        // Get applications
        const studentID = studentData.StudentID || studentData.studentid;
        const applicationsResponse = await fetch(`/applications/student/${studentID}`);
        if (!applicationsResponse.ok) throw new Error('Failed to fetch applications');
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);

      } catch (error) {
        console.error('Error fetching applications:', error);
        setMessage('Failed to load applications: ' + error.message);
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentApplications();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Applications</h1>
                  {/* Summary Statistics */}
        {applications.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">
                {applications.length}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status?.toLowerCase() === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status?.toLowerCase() === 'pending' || app.status?.toLowerCase() === 'in review').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status?.toLowerCase() === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        )}
        </div>

        {/* Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            messageType === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Application History ({applications.length})
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500">You haven't submitted any applications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application, index) => (
                <div key={application.applicationid || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Certificate Application
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(application.status)}`}>
                          {application.status || 'Pending'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Faculty:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {application.facultyname || application.departmentname || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Submitted:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {formatDate(application.createdat)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Application Type:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {application.applicationtype || 'Certificate Request'}
                          </p>
                        </div>
                        {application.updatedat && application.updatedat !== application.createdat && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                            <p className="text-sm text-gray-900 mt-1">
                              {formatDate(application.updatedat)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status-specific information */}
                      {application.status?.toLowerCase() === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">
                              Application Approved - Your certificate is ready for blockchain verification
                            </span>
                          </div>
                        </div>
                      )}

                      {application.status?.toLowerCase() === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-red-800">
                              Application Rejected - Please contact your department for more information
                            </span>
                          </div>
                        </div>
                      )}

                      {application.status?.toLowerCase() === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-yellow-800">
                              Application Under Review - We'll notify you once it's processed
                            </span>
                          </div>
                        </div>
                      )}

                      {application.status?.toLowerCase() === 'in review' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-blue-800">
                              Application In Review - Department is currently reviewing your application
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="ml-4 flex-shrink-0">
                      <div className="flex flex-col gap-2">
                        {application.status?.toLowerCase() === 'approved' && (
                          <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                            View Certificate
                          </button>
                        )}
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



      </div>
    </div>
  );
}
