import React, { useEffect, useState } from 'react';

export default function ApplicationForm() {
  const [studentID, setStudentID] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [ethAddress, setEthAddress] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyID, setSelectedFacultyID] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'
  const [attestationType, setAttestationType] = useState('Public'); 

  useEffect(() => {
    const walletAddress = sessionStorage.getItem('walletAddress');
    if (!walletAddress) {
      setMessage('User not logged in or Ethereum address missing.');
      setMessageType('error');
      return;
    }

    setEthAddress(walletAddress);

    // First, get user info
    fetch(`/users/eth/${walletAddress}`)
      .then(res => {
        console.log('User response status:', res.status);
        console.log('User response ok:', res.ok);
        if (!res.ok) throw new Error(`User not found - Status: ${res.status}`);
        return res.json();
      })
      .then(userData => {
        console.log('User data received:', userData);
        setUserInfo(userData);

        // Then, get student info using UserID
        const userID = userData.UserID || userData.userid;
        console.log('UserID for student lookup:', userID);

        if (userID) {
          return fetch(`/students/user/${userID}`);
        } else {
          throw new Error('UserID not found in user data');
        }
      })
      .then(res => {
        console.log('Student response status:', res.status);
        console.log('Student response ok:', res.ok);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Student record not found for this user');
          }
          throw new Error(`Student fetch failed - Status: ${res.status}`);
        }

        // Check if response has content
        const contentType = res.headers.get('content-type');
        console.log('Student response content-type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Student response is not JSON');
        }

        return res.json();
      })
      .then(studentData => {
        console.log('Student data received:', studentData);
        setStudentID(studentData.StudentID || studentData.studentid);
        setStudentInfo(studentData);
      })
      .catch((error) => {
        console.error('Error in user/student fetch chain:', error);
        setMessage('Failed to get student info: ' + error.message);
        setMessageType('error');
      });
  }, []);

  useEffect(() => {
    fetch('/faculties')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Faculties data received:', data);
        setFaculties(data);
      })
      .catch((error) => {
        console.error('Error fetching faculties:', error);
        setMessage('Failed to load faculties: ' + error.message);
        setMessageType('error');
      });
  }, []);

  const handleSubmit = async e => {
  e.preventDefault();
  setMessage('');
  setMessageType('');
  
  console.log('Submit - StudentID:', studentID);
  
  if (!studentID) {
    setMessage('Student information not loaded.');
    setMessageType('error');
    return;
  }
  if (!selectedFacultyID) {
    setMessage('Please select a faculty.');
    setMessageType('error');
    return;
  }
  try {
    const res = await fetch('/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        StudentID: studentID, 
        FacultyID: selectedFacultyID,
        AttestationType: attestationType 
      }),
    });
    if (res.ok) {
      setMessage('Application submitted successfully!');
      setMessageType('success');
      setSelectedFacultyID('');
      setAttestationType('Public');
    } else {
      const err = await res.json();
      setMessage('Error: ' + (err.error || 'Failed to submit application'));
      setMessageType('error');
    }
  } catch (error) {
    setMessage('Error: ' + error.message);
    setMessageType('error');
  }
};

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Submit Attestation Application
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information Section */}
        <div className="bg-gray-50 p-4 rounded-md border">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Student Information</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ethereum Address
              </label>
              <input
                type="text"
                value={ethAddress}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 cursor-not-allowed"
              />
            </div>

            {userInfo && (
              <>
                {(userInfo.FirstName || userInfo.firstname) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={`${userInfo.FirstName || userInfo.firstname || ''} ${userInfo.LastName || userInfo.lastname || ''}`.trim()}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                )}

                {(userInfo.Email || userInfo.email) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userInfo.Email || userInfo.email}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Faculty Selection */}
        <div>
          <label
            htmlFor="faculty"
            className="block mb-2 font-medium text-gray-700"
          >
            Select Faculty *
          </label>
          <select
            id="faculty"
            value={selectedFacultyID}
            onChange={e => setSelectedFacultyID(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          >
            <option value="">-- Select Faculty --</option>
            {faculties.map((f, index) => (
              <option
                key={f.facultyid || index}
                value={f.facultyid}
              >
                {f.departmentname}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="attestationType"
            className="block mb-2 font-medium text-gray-700"
          >
            Attestation Type *
          </label>
          <select
            id="attestationType"
            value={attestationType}
            onChange={e => setAttestationType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          >
            <option value="Public">Public Attestation</option>
            <option value="Private">Private Attestation</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Public attestations are visible to everyone, while private attestations are only visible to authorized parties.
          </p>
        </div>
        {/* Application Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Application Date
          </label>
          <input
            type="text"
            value={new Date().toLocaleDateString()}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!studentID || !ethAddress}
        >
          Submit Application
        </button>
      </form>

      {message && (
        <p
          className={`mt-6 text-center px-4 py-3 rounded ${messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  );
}
