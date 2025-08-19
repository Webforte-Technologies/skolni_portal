import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiClient from '../../services/apiClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { 
  Plus, FileText, Users, BookOpen, Target, 
  TrendingUp, Presentation, Lightbulb, Sparkles
} from 'lucide-react';

const MaterialsIndexPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: recentData, isLoading } = useQuery(
    ['recent-materials'],
    async () => {
      const res = await apiClient.get('/files?limit=5&offset=0');
      return res.data;
    },
    { retry: 1 }
  );
  const recentMaterials = recentData?.data?.files || [];

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'Worksheet':
        return <FileText className="w-5 h-5" />;
      case 'Lesson Plan':
        return <BookOpen className="w-5 h-5" />;
      case 'Quiz':
        return <Target className="w-5 h-5" />;
      case 'Project':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Centrum vzdělávacích materiálů
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Vytvářejte, organizujte a sdílejte kvalitní vzdělávací materiály. 
            Použijte naše AI šablony pro vytvoření zajímavého obsahu pro vaše studenty.
          </p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Materiály' }]} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/materials/create')}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Vytvořit nový materiál</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              AI generátor pro rychlé vytvoření výukových materiálů
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/materials/my-materials')}>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Moje materiály</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Spravujte a organizujte své vytvořené materiály
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/materials/shared')}>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Školní knihovna</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Prozkoumejte materiály sdílené školní komunitou
            </p>
          </Card>
        </div>

        {/* Material Types Overview */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Typy materiálů</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-sm">Pracovní listy</h4>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-sm">Lekce</h4>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-sm">Hodnocení</h4>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-medium text-sm">Projekty</h4>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Presentation className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h4 className="font-medium text-sm">Prezentace</h4>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Lightbulb className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="font-medium text-sm">Aktivity</h4>
            </div>
          </div>
        </Card>

        {/* Recent Materials */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">Poslední materiály</h2>
           {isLoading ? (
             <div className="text-neutral-600">Načítání…</div>
           ) : recentMaterials.length > 0 ? (
            <div className="space-y-4">
              {recentMaterials.map((material: any) => (
                <div key={material.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                      {getMaterialIcon(
                        material.file_type === 'lesson_plan' ? 'Lesson Plan' :
                        material.file_type === 'quiz' ? 'Quiz' :
                        material.file_type === 'project' ? 'Project' :
                        material.file_type === 'presentation' ? 'Presentation' :
                        'Worksheet'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium truncate max-w-full">{material.title}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        Vytvořeno {new Date(material.created_at).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/materials/my-materials?new=${material.id}`)}
                    className="w-full sm:w-auto"
                  >
                    Zobrazit
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Zatím nemáte žádné materiály
              </p>
               <Button onClick={() => navigate('/materials/create')}>
                Vytvořit první materiál
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MaterialsIndexPage;
