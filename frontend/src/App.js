import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [proof, setProof] = useState(null);

  // Gestioneaza selectarea fisierului
  const captureFile = (event) => {
    const selectedProof = event.target.files[0];
    setProof(selectedProof);
    console.log('Document selectat:', selectedProof); // Afiseaza documentul selectat
  };

  // Gestioneaza trimiterea formularului
  const processForm = async (event) => {
    event.preventDefault();

    if (!proof) {
      alert('Te rugam sa selectezi un document inainte de trimitere');
      return;
    }

    console.log('Document de incarcat:', proof); // Afiseaza documentul care urmeaza sa fie incarcat

    const uploadData = new FormData();
    uploadData.append('file', proof);

    try {
      const result = await axios.post('http://localhost:8000/api/v1/proof', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Document incarcat cu succes');
      console.log('Raspuns server:', result.data); // Afiseaza raspunsul de la server
    } catch (uploadError) {
      console.error('Eroare la incarcarea documentului:', uploadError.response || uploadError);
      alert('Eroare la incarcarea documentului');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <form className="bg-white  flex flex-col justify-around h-96 w-96 rounded-3xl items-center" onSubmit={processForm}>
        <div className="flex items-center justify-center w-5/6 ">
          <label className="flex flex-col w-full h-32 border-4 border-dashed cursor-pointer hover:bg-gray-100 hover:border-gray-300">
            <div className="flex flex-col items-center justify-center pt-7">
              <input type="file" name="data" onChange={captureFile} className="hidden" />
              {!proof ? (
                <p className="pt-4 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">Select a file</p>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-600">
                    {proof.name}
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>

        <button type="submit" className="w-5/6 px-4 py-4 text-white font-semibold bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
          Incarca document
        </button>
      </form>
    </div>
  );
}

export default App;