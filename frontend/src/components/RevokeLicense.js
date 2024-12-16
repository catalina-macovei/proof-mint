import React, { useState } from 'react';
import axios from 'axios';

const RevokeLicense = () => {
    const [studentDID, setStudentDID] = useState('');
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    const revokeLicense = async () => {
        if (!studentDID) {
            setError('DID-ul studentului este necesar.');
            return;
        }

        try {
            setError('');
            setTxHash('');

            // Send GET request with studentDID as a query parameter
            const response = await axios.get('http://localhost:8000/api/v1/revoke-license', {
                params: { studentDID },
            });

            // Set the transaction hash from the response
            setTxHash(response.data.transactionHash);

            // Show success message
            alert('Licența a fost revocată cu succes!');
        } catch (error) {
            console.error('Error revoking license:', error);
            setError('Eroare la revocarea licenței. Verificați detaliile și încercați din nou.');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Revoke License</h2>

            {/* Input field for student DID */}
            <input
                type="text"
                placeholder="Enter Student DID"
                value={studentDID}
                onChange={(e) => setStudentDID(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Button to trigger license revocation */}
            <button
                onClick={revokeLicense}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 "
            >
                Revoke License
            </button>

            {/* Display the transaction hash if revocation was successful */}
            {txHash && (
                <p className="mt-4 text-green-500 font-medium truncate">
                    Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                        {txHash}
                    </a>
                </p>
            )}

            {/* Display error message if there was an error */}
            {error && (
                <p className="mt-4 text-red-500 font-medium">
                    {error}
                </p>
            )}
        </div>
        </div>

    );
};

export default RevokeLicense;
