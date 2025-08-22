import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  TestTube, 
  Play, 
  Square,
  RefreshCw, 
  Download,
  Upload,
  Settings,
  AlertTriangle,
  
  Clock,
  Activity,
  Database,
  Server,
  Users,
  Code
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  duration?: number;
  passed: number;
  failed: number;
  total: number;
}

interface TestResult {
  id: string;
  testName: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  timestamp: Date;
  error?: string;
  details?: string;
}

const TestingToolsPage: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTests, setRunningTests] = useState<string[]>([]);

  useEffect(() => {
    // Simulate API call for testing tools data
    const fetchTestingData = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockTestSuites: TestSuite[] = [
          {
            id: '1',
            name: 'Unit Tests',
            description: 'Testy jednotlivých komponent a funkcí',
            category: 'unit',
            status: 'completed',
            lastRun: new Date(Date.now() - 1000 * 60 * 30),
            duration: 45,
            passed: 156,
            failed: 2,
            total: 158
          },
          {
            id: '2',
            name: 'Integration Tests',
            description: 'Testy integrace mezi komponentami',
            category: 'integration',
            status: 'completed',
            lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2),
            duration: 120,
            passed: 89,
            failed: 1,
            total: 90
          },
          {
            id: '3',
            name: 'E2E Tests',
            description: 'End-to-end testy uživatelských scénářů',
            category: 'e2e',
            status: 'idle',
            passed: 23,
            failed: 0,
            total: 23
          },
          {
            id: '4',
            name: 'Performance Tests',
            description: 'Testy výkonu a zátěže',
            category: 'performance',
            status: 'idle',
            passed: 12,
            failed: 0,
            total: 12
          },
          {
            id: '5',
            name: 'Security Tests',
            description: 'Testy bezpečnosti a zranitelností',
            category: 'security',
            status: 'idle',
            passed: 8,
            failed: 0,
            total: 8
          }
        ];

        const mockTestResults: TestResult[] = [
          {
            id: '1',
            testName: 'User authentication flow',
            suite: 'E2E Tests',
            status: 'passed',
            duration: 2.3,
            timestamp: new Date(Date.now() - 1000 * 60 * 15)
          },
          {
            id: '2',
            testName: 'Material creation',
            suite: 'Integration Tests',
            status: 'passed',
            duration: 1.8,
            timestamp: new Date(Date.now() - 1000 * 60 * 20)
          },
          {
            id: '3',
            testName: 'API rate limiting',
            suite: 'Integration Tests',
            status: 'failed',
            duration: 0.5,
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            error: 'Rate limit exceeded expected threshold',
            details: 'Expected max 100 requests/min, got 150 requests/min'
          }
        ];

        setTestSuites(mockTestSuites);
        setTestResults(mockTestResults);
        setLoading(false);
      }, 1000);
    };

    fetchTestingData();
  }, []);

  const runTestSuite = async (suiteId: string) => {
    setRunningTests(prev => [...prev, suiteId]);
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId ? { ...suite, status: 'running' } : suite
    ));

    // Simulate test execution
    setTimeout(() => {
      const randomPassed = Math.floor(Math.random() * 50) + 10;
      const randomFailed = Math.floor(Math.random() * 5);
      const randomDuration = Math.floor(Math.random() * 60) + 30;

      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId ? {
          ...suite,
          status: 'completed',
          lastRun: new Date(),
          duration: randomDuration,
          passed: randomPassed,
          failed: randomFailed,
          total: randomPassed + randomFailed
        } : suite
      ));

      setRunningTests(prev => prev.filter(id => id !== suiteId));
    }, 3000);
  };

  const stopTestSuite = (suiteId: string) => {
    setRunningTests(prev => prev.filter(id => id !== suiteId));
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId ? { ...suite, status: 'idle' } : suite
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'unit':
        return <Code className="w-4 h-4" />;
      case 'integration':
        return <Database className="w-4 h-4" />;
      case 'e2e':
        return <Users className="w-4 h-4" />;
      case 'performance':
        return <Activity className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <TestTube className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'unit':
        return 'Unit';
      case 'integration':
        return 'Integrace';
      case 'e2e':
        return 'E2E';
      case 'performance':
        return 'Výkon';
      case 'security':
        return 'Bezpečnost';
      default:
        return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'idle':
        return 'Neaktivní';
      case 'running':
        return 'Běží';
      case 'completed':
        return 'Dokončeno';
      case 'failed':
        return 'Selhalo';
      default:
        return status;
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultStatusLabel = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Úspěšný';
      case 'failed':
        return 'Selhal';
      case 'skipped':
        return 'Přeskočen';
      default:
        return status;
    }
  };

  const exportTestResults = () => {
    const data = {
      suites: testSuites,
      results: testResults,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Načítání testovacích nástrojů...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testovací nástroje</h1>
          <p className="text-gray-600 mt-2">
            Správa a spouštění testů, monitoring výsledků
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={exportTestResults} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export výsledků
          </Button>
          <TestTube className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TestTube className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Testovací sady</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {testSuites.length}
            </div>
            <p className="text-sm text-gray-600">Celkem dostupných sad</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Play className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Úspěšné testy</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {testSuites.reduce((sum, suite) => sum + suite.passed, 0)}
            </div>
            <p className="text-sm text-gray-600">Všechny úspěšné testy</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold">Selhané testy</h3>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-2">
              {testSuites.reduce((sum, suite) => sum + suite.failed, 0)}
            </div>
            <p className="text-sm text-gray-600">Testy, které selhaly</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Celkový čas</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {testSuites.reduce((sum, suite) => sum + (suite.duration || 0), 0)}s
            </div>
            <p className="text-sm text-gray-600">Doba všech testů</p>
          </div>
        </Card>
      </div>

      {/* Test Suites */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Testovací sady</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testSuites.map((suite) => (
            <Card key={suite.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(suite.category)}
                    <div>
                      <h3 className="text-lg font-semibold">{suite.name}</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getCategoryLabel(suite.category)}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(suite.status)}>
                    {getStatusLabel(suite.status)}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-4">{suite.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Úspěšné:</span> {suite.passed}
                  </div>
                  <div>
                    <span className="font-medium">Selhané:</span> {suite.failed}
                  </div>
                  <div>
                    <span className="font-medium">Celkem:</span> {suite.total}
                  </div>
                  {suite.duration && (
                    <div>
                      <span className="font-medium">Doba:</span> {suite.duration}s
                    </div>
                  )}
                </div>
                
                {suite.lastRun && (
                  <div className="text-xs text-gray-500 mb-4">
                    Poslední spuštění: {suite.lastRun.toLocaleString('cs-CZ')}
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {suite.status === 'running' ? (
                    <Button
                      onClick={() => stopTestSuite(suite.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      Zastavit
                    </Button>
                  ) : (
                    <Button
                      onClick={() => runTestSuite(suite.id)}
                      disabled={runningTests.includes(suite.id)}
                      size="sm"
                    >
                      {runningTests.includes(suite.id) ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          Běží...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Spustit
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* setSelectedSuite(suite.id) */}}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Nastavení
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Poslední výsledky testů</h2>
        
        <Card>
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-medium">Historie testů</h3>
          </div>
          <div className="p-6">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Žádné výsledky testů</p>
                <p className="text-sm">Spusťte testy pro zobrazení výsledků</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={getResultStatusColor(result.status)}>
                          {getResultStatusLabel(result.status)}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{result.testName}</h4>
                          <div className="text-sm text-gray-500">
                            {result.suite} • {result.duration}s • {result.timestamp.toLocaleString('cs-CZ')}
                          </div>
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="text-right">
                          <div className="text-sm text-red-600 font-medium">Chyba</div>
                          <div className="text-xs text-gray-500">{result.error}</div>
                        </div>
                      )}
                    </div>
                    
                    {result.details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Detaily:</span> {result.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Testing Configuration */}
      <Card>
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-medium">Konfigurace testování</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Server className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Testovací prostředí</h4>
                  <p className="text-sm text-gray-600">Konfigurace testovacího serveru a databáze</p>
                </div>
                <Button variant="outline" size="sm">
                  Nastavit
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Testovací data</h4>
                  <p className="text-sm text-gray-600">Správa testovacích dat a fixtures</p>
                </div>
                <Button variant="outline" size="sm">
                  Spravovat
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Automatizace</h4>
                  <p className="text-sm text-gray-600">Nastavení automatického spouštění testů</p>
                </div>
                <Button variant="outline" size="sm">
                  Konfigurovat
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium">Import testů</h4>
                  <p className="text-sm text-gray-600">Import testovacích souborů a sad</p>
                </div>
                <Button variant="outline" size="sm">
                  Importovat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestingToolsPage;
