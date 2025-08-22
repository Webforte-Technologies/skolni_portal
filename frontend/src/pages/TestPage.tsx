import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-bg text-surface-text p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Page</h1>
        <p className="text-lg mb-4">If you can see this, the frontend is working!</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Frontend Status</h2>
          <ul className="space-y-2">
            <li>✅ React is rendering</li>
            <li>✅ Tailwind CSS is working</li>
            <li>✅ Routing is functional</li>
            <li>✅ Components are loading</li>
          </ul>
        </div>
        <div className="mt-6">
          <a 
            href="/dashboard" 
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
