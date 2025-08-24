import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Lightbulb, Target, Clock, Users, FileText, BookOpen, Presentation, Sparkles } from 'lucide-react';
import Card from '../ui/Card';

interface MaterialGenerationHelpProps {
  className?: string;
}

const MaterialGenerationHelp: React.FC<MaterialGenerationHelpProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const materialTypes = [
    {
      icon: BookOpen,
      name: 'Plán hodiny',
      description: 'Kompletní struktura vyučovací hodiny',
      tips: ['Definujte jasné cíle', 'Plánujte časové rozvržení', 'Zahrňte různé aktivity']
    },
    {
      icon: FileText,
      name: 'Pracovní list',
      description: 'Cvičení a úkoly pro studenty',
      tips: ['Postupně zvyšujte obtížnost', 'Zahrňte různé typy úloh', 'Poskytněte jasné instrukce']
    },
    {
      icon: Target,
      name: 'Kvíz',
      description: 'Test pro ověření znalostí',
      tips: ['Mixujte typy otázek', 'Stanovte časový limit', 'Zahrňte zpětnou vazbu']
    },
    {
      icon: Sparkles,
      name: 'Projekt',
      description: 'Dlouhodobé projektové zadání',
      tips: ['Definujte jasné výstupy', 'Plánujte etapy', 'Zahrňte hodnocení']
    },
    {
      icon: Presentation,
      name: 'Prezentace',
      description: 'Osnova pro prezentaci tématu',
      tips: ['Strukturovaný obsah', 'Vizuální podpora', 'Interaktivní prvky']
    },
    {
      icon: Users,
      name: 'Aktivita',
      description: 'Krátká interaktivní aktivita',
      tips: ['Jasné instrukce', 'Zapojení všech žáků', 'Reflexe výsledků']
    }
  ];

  const gradeLevels = [
    { level: '1. stupeň ZŠ', focus: 'Konkrétní příklady, vizuální podpora, jednoduchý jazyk' },
    { level: '2. stupeň ZŠ', focus: 'Více abstrakce, samostatnost, kritické myšlení' },
    { level: 'SŠ', focus: 'Hloubka, analýza, příprava na další vzdělávání' }
  ];

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-blue-900 dark:text-blue-100">
            Nápověda pro generování materiálů
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Obecné tipy */}
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Obecné tipy pro lepší výsledky
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Konkrétní téma</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Místo &quot;Matematika&quot; zadejte &quot;Sčítání zlomků s různými jmenovateli&quot;
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Správný ročník</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Vyberte přesný ročník pro přiměřenou obtížnost
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Specifické podtypy</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Použijte podtypy pro lepší cílení na vaše potřeby
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-blue-800 dark:text-blue-200">Vlastní instrukce</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Přidejte specifické požadavky pro AI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typy materiálů */}
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
              Typy materiálů a jejich použití
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materialTypes.map((type, index) => {
                const IconComponent = type.icon;
                return (
                  <div key={index} className="bg-white dark:bg-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-4 h-4 text-blue-500" />
                      <h5 className="font-medium text-sm text-blue-800 dark:text-blue-200">
                        {type.name}
                      </h5>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {type.description}
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      {type.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-1">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Úrovně obtížnosti */}
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
              Úrovně obtížnosti podle ročníků
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gradeLevels.map((grade, index) => (
                <div key={index} className="bg-white dark:bg-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <h5 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                    {grade.level}
                  </h5>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {grade.focus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Příklady dobrých témat */}
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
              Příklady dobrých témat
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <h5 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                  Matematika
                </h5>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Kvadratické rovnice - řešení pomocí vzorce</li>
                  <li>• Sčítání zlomků s různými jmenovateli</li>
                  <li>• Pythagorova věta v praxi</li>
                  <li>• Procenta a jejich aplikace</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <h5 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                  Přírodní vědy
                </h5>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Fotosyntéza - proces a význam pro život</li>
                  <li>• Chemické reakce - oxidace a redukce</li>
                  <li>• Fyzikální veličiny - měření a jednotky</li>
                  <li>• Ekosystémy - potravní řetězce</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MaterialGenerationHelp;
