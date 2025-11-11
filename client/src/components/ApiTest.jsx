import { useState } from 'react';
import axios from '../utils/axios';

export default function ApiTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/health');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data || {}, null, 2)}`);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        email: 'demo@inturnx.com',
        password: 'demo123'
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data || {}, null, 2)}`);
    }
    setLoading(false);
  };

  const testDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/demo');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data || {}, null, 2)}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testHealth}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Test Health Endpoint
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 ml-4"
        >
          Test Login
        </button>
        
        <button
          onClick={testDemo}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 ml-4"
        >
          Test Demo Login
        </button>
      </div>

      {loading && <p className="text-yellow-400">Loading...</p>}
      
      {result && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Result:</h2>
          <pre className="text-sm overflow-auto">{result}</pre>
        </div>
      )}

      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open browser DevTools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click the test buttons above</li>
          <li>Check console for detailed request/response logs</li>
        </ol>
      </div>
    </div>
  );
}