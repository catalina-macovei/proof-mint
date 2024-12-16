import React, { useState } from 'react';
import axios from 'axios';

const IssueLicense = () => {
  const [proof, setProof] = useState(null);
  const [studentDID, setStudentDID] = useState('');
  const [txHash, setTxHash] = useState('');

  const captureFile = (event) => {
    const selectedProof = event.target.files[0];
    setProof(selectedProof);
    console.log('Document selectat:', selectedProof);
  };

  const processForm = async (event) => {
    event.preventDefault();

    if (!proof || !studentDID) {
      alert('Te rugam sa selectezi un document si sa introduci DID-ul studentului');
      return;
    }

    console.log('Document de incarcat:', proof);

    const uploadData = new FormData();
    uploadData.append('file', proof);
    uploadData.append('studentDID', studentDID);

    try {
      const result = await axios.post('http://localhost:8000/api/v1/proof', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTxHash(result.data.transactionHash);
      alert('Document incarcat cu succes');
      console.log('Raspuns server:', result.data);
    } catch (uploadError) {
      console.error('Eroare la incarcarea documentului:', uploadError.response || uploadError);
      alert('Eroare la incarcarea documentului');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">


      <form className="bg-white dark:bg-gray-900 flex flex-col justify-around h-96 w-96 rounded-3xl items-center p-4 border border-gray-300" onSubmit={processForm}>
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Issue License</h2>
        <div className="flex items-center justify-center w-5/6">
          <label className="flex flex-col w-full h-32 border-4 border-dashed cursor-pointer hover:bg-gray-100 hover:border-gray-300">
            <div className="flex flex-col items-center justify-center pt-7">
              <input type="file" name="data" onChange={captureFile} className="hidden" />
              {!proof ? (
                <p className="pt-4 text-sm tracking-wider text-gray-300 group-hover:text-gray-600">Select a file</p>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-600 truncate w-full overflow-hidden text-ellipsis">
                    {proof.name}
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>

        <input
          type="text"
          placeholder="Introdu DID-ul studentului"
          value={studentDID}
          onChange={(e) => setStudentDID(e.target.value)}
          className="w-5/6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button type="submit" className="w-5/6 px-4 py-4 text-white font-semibold bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
          Issue License
        </button>

        {txHash && (
          <div className="w-5/6 mt-4 p-4 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800 truncate">Transaction Hash: {txHash}</p>
          </div>
        )}
      </form>
    </div>

  );
}

export default IssueLicense;
