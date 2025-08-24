import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import apiClient from '../services/apiClient';

const TestPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testWorksheetGeneration = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await apiClient.post('/ai/test-worksheet-generation');
      setTestResult(response.data);
      
      if (response.data.success) {
        showToast({
          type: 'success',
          message: 'Worksheet generation test successful!'
        });
      } else {
        showToast({
          type: 'error',
          message: 'Worksheet generation test failed: ' + response.data.error
        });
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResult({
        success: false,
        message: 'Test request failed',
        error: error.response?.data?.message || error.message
      });
      showToast({
        type: 'error',
        message: 'Test request failed: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testRegularWorksheetGeneration = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await apiClient.post('/ai/generate-worksheet', {
        topic: 'Kvadratické rovnice',
        question_count: 5,
        difficulty: 'střední',
        include_answers: true
      });
      
      setTestResult({
        success: true,
        message: 'Regular worksheet generation test completed',
        data: response.data
      });
      showToast({
        type: 'success',
        message: 'Regular worksheet generation test completed!'
      });
    } catch (error: any) {
      console.error('Regular test failed:', error);
      setTestResult({
        success: false,
        message: 'Regular worksheet generation test failed',
        error: error.response?.data?.message || error.message
      });
      showToast({
        type: 'error',
        message: 'Regular test failed: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Worksheet Generation Tests</h2>
          
          <div className="space-y-4">
            <Button
              onClick={testWorksheetGeneration}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Simple Worksheet Generation'}
            </Button>
            
            <Button
              onClick={testRegularWorksheetGeneration}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Regular Worksheet Generation'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Test Results</h2>
          
          {testResult ? (
            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <strong>{testResult.message}</strong>
                {testResult.error && (
                  <div className="mt-2 text-sm">
                    <strong>Error:</strong> {testResult.error}
                  </div>
                )}
              </div>
              
              {testResult.data && (
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <strong>Data:</strong>
                  <pre className="mt-2 text-sm overflow-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResult.rawResponse && (
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <strong>Raw Response:</strong>
                  <pre className="mt-2 text-sm overflow-auto max-h-40">
                    {testResult.rawResponse}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-500">No test results yet. Run a test to see results.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>User ID:</strong> {user?.id}
          </div>
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Role:</strong> {user?.role}
          </div>
          <div>
            <strong>Credits:</strong> {user?.credits_balance}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestPage;
