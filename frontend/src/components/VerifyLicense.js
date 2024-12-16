import React, { useState } from 'react';
import axios from 'axios';

const VerifyLicense = () => {
    const [studentDID, setStudentDID] = useState('');
    const [isLicenseValid, setIsLicenseValid] = useState(null);
    const [licenseStudentDID, setLicenseStudentDID] = useState('');
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!studentDID) {
            setError('Please enter a student DID');
            return;
        }

        try {
            const response = await axios.get('http://localhost:8000/api/v1/verify-license', {
                params: { studentDID: "yourStudentDID" }
            });

            if (response.data.success) {
                setIsLicenseValid(response.data.isValid);
                setLicenseStudentDID(response.data.licenseStudentDID);
                setError('');
            } else {
                setIsLicenseValid(false);
                setLicenseStudentDID('');
                setError('License not found');
            }
        } catch (err) {
            setError('Error verifying license');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
            {/* Input field for student DID */}
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Verify License</h2>

            <input
                type="text"
                placeholder="Enter Student DID"
                value={studentDID}
                onChange={(e) => setStudentDID(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Button to trigger license verification */}
            <button
                onClick={handleVerify}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            >
                Verify License
            </button>

            {/* Display error message if there was an error */}
            {error && (
                <p className="mt-4 text-red-500 font-medium">
                    {error}
                </p>
            )}

            {/* Display license validity result */}
            {isLicenseValid !== null && (
                <p className="mt-4 text-lg font-medium truncate">
                    License {isLicenseValid ? 'Valid' : 'Invalid'} for Student DID:
                    <span className="font-semibold">{licenseStudentDID}</span>
                </p>
            )}
        </div>
</div>
    );
};

export default VerifyLicense;
