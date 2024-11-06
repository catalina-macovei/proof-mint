import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);

  // Handle file selection
  const retrieveFile = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    console.log('Selected file:', selectedFile); // Log the file selection
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert('Please select a file before submitting');
      return;
    }

    console.log('File to upload:', file); // Log the file being uploaded

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('File uploaded successfully');
      console.log('Server response:', response.data); // Log the server response here
    } catch (error) {
      console.error('Error uploading the file:', error.response || error);
      alert('Error uploading the file');
    }
  };

  return (
    <div className="App">
      <form className="form" onSubmit={handleSubmit}>
        <input type="file" name="data" onChange={retrieveFile} />
        <button type="submit" className="btn">Upload file</button>
      </form>
    </div>
  );
}

export default App;
