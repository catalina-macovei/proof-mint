import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export default function FacultyApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [facultyInfo, setFacultyInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchFacultyApplications = async () => {
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

                // Get faculty info
                const userID = userData.UserID || userData.userid;
                const facultyResponse = await fetch(`/faculties/user/${userID}`);
                if (!facultyResponse.ok) throw new Error('Faculty not found');
                const facultyData = await facultyResponse.json();
                setFacultyInfo(facultyData);

                // Get applications for this faculty
                const facultyID = facultyData.FacultyID || facultyData.facultyid;
                const applicationsResponse = await fetch(`/applications/faculty/${facultyID}`);
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

        fetchFacultyApplications();
    }, []);

    const handleIssueCertificate = (application) => {
        // Determine if it's private or public based on AttestationType
        const isPrivate = (application.attestationtype || application.AttestationType)?.toLowerCase() === 'private';

        // Prepare the data to pass
        const certificateData = {
            studentAddress: application.studentethaddress,
            studentName: application.studentname,
            studentEmail: application.studentemail,
            studentId: application.studentid,
            facultyId: application.facultyid,
            applicationId: application.applicationid || application.ApplicationID,
            attestationType: application.attestationtype || application.AttestationType || 'Public'
        };

        // Navigate to the appropriate form with data
        if (isPrivate) {
            navigate('/issue-private-license', { state: certificateData });
        } else {
            navigate('/issue-license', { state: certificateData });
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            const application = applications.find(app =>
                (app.applicationid || app.ApplicationID) === applicationId
            );

            const response = await fetch(`/applications/${applicationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    StudentID: application.studentid || application.StudentID,
                    FacultyID: application.facultyid || application.FacultyID,
                    Status: newStatus,
                    AttestationType: application.attestationtype || application.AttestationType || 'Public'
                }),
            });

            if (response.ok) {
                // Update the local state
                setApplications(prev => prev.map(app =>
                    (app.applicationid || app.ApplicationID) === applicationId
                        ? { ...app, status: newStatus, Status: newStatus }
                        : app
                ));
                setMessage(`Application ${newStatus.toLowerCase()} successfully!`);
                setMessageType('success');
                setTimeout(() => setMessage(''), 3000);
            } else {
                throw new Error('Failed to update application status');
            }
        } catch (error) {
            setMessage('Error updating application: ' + error.message);
            setMessageType('error');
            setTimeout(() => setMessage(''), 5000);
        }
    };


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

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return (app.status || app.Status)?.toLowerCase() === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Faculty Applications Dashboard</h1>

                    {facultyInfo && (
                        <div className="bg-gray-50 rounded-md p-4">
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">Department Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600">Department:</span>
                                    <span className="ml-2 text-gray-900">
                                        {facultyInfo.DepartmentName || facultyInfo.departmentname}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Faculty Name:</span>
                                    <span className="ml-2 text-gray-900">
                                        {facultyInfo.UserName || facultyInfo.username || userInfo?.UserName || userInfo?.username}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Email:</span>
                                    <span className="ml-2 text-gray-900">
                                        {facultyInfo.Email || facultyInfo.email || userInfo?.Email || userInfo?.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {[
                                { key: 'all', label: 'All Applications', count: applications.length },
                                { key: 'pending', label: 'Pending', count: applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'pending').length },
                                { key: 'in review', label: 'In Review', count: applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'in review').length },
                                { key: 'approved', label: 'Approved', count: applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'approved').length },
                                { key: 'rejected', label: 'Rejected', count: applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'rejected').length },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-md ${messageType === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Applications List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {filter === 'all' ? 'All Applications' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Applications`} ({filteredApplications.length})
                        </h2>
                    </div>

                    {filteredApplications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                            <p className="text-gray-500">
                                {filter === 'all'
                                    ? 'No applications have been submitted to your department yet.'
                                    : `No ${filter} applications found.`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredApplications.map((application, index) => (
                                <div key={application.applicationid || application.ApplicationID || index} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Certificate Application
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(application.status || application.Status)}`}>
                                                    {application.status || application.Status || 'Pending'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Student Name:</span>
                                                    <p className="text-sm text-gray-900 mt-1">
                                                        {application.studentname || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Student Ethereum Address:</span>
                                                    <p className="text-sm text-gray-900 mt-1 font-mono break-all">
                                                        {application.studentethaddress || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Student Email:</span>
                                                    <p className="text-sm text-gray-900 mt-1">
                                                        {application.studentemail || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Submitted:</span>
                                                    <p className="text-sm text-gray-900 mt-1">
                                                        {formatDate(application.createdat || application.CreatedAt)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Attestation Type:</span>
                                                    <p className="text-sm text-gray-900 mt-1">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${(application.attestationtype || application.AttestationType) === 'Private'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {application.attestationtype || application.AttestationType || 'Public'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="ml-4 flex-shrink-0">
                                            <div className="flex flex-col gap-2">
                                                {(application.status || application.Status)?.toLowerCase() === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(application.applicationid || application.ApplicationID, 'In Review')}
                                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                                        >
                                                            Mark In Review
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(application.applicationid || application.ApplicationID, 'Approved')}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(application.applicationid || application.ApplicationID, 'Rejected')}
                                                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {(application.status || application.Status)?.toLowerCase() === 'in review' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(application.applicationid || application.ApplicationID, 'Approved')}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(application.applicationid || application.ApplicationID, 'Rejected')}
                                                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {(application.status || application.Status)?.toLowerCase() === 'approved' && (
                                                    <button
                                                        onClick={() => handleIssueCertificate(application)}
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        Issue {(application.attestationtype || application.AttestationType) === 'Private' ? 'Private' : 'Public'} Certificate
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

                {/* Summary Statistics */}
                {applications.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {applications.length}
                            </div>
                            <div className="text-sm text-gray-600">Total Applications</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'pending').length}
                            </div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'in review').length}
                            </div>
                            <div className="text-sm text-gray-600">In Review</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'approved').length}
                            </div>
                            <div className="text-sm text-gray-600">Approved</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {applications.filter(app => (app.status || app.Status)?.toLowerCase() === 'rejected').length}
                            </div>
                            <div className="text-sm text-gray-600">Rejected</div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
