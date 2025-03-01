import { useState } from 'react';

const TestVeramo = () => {
  const [credential, setCredential] = useState(null);
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/test-credentials', {
        method: 'POST'
      });
      const data = await response.json();
      setCredential(data.credential);
      setPresentation(data.presentation);
    } catch (error) {
      console.error('Error testing credentials:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
          Test Veramo Credentials
        </h2>

        <button
          onClick={handleTestCredentials}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
        >
          {loading ? 'Testing...' : 'Test Credentials'}
        </button>

        {credential && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Credential:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(credential, null, 2)}
            </pre>
          </div>
        )}

        {presentation && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Presentation:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(presentation, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestVeramo;
