import React, { useState } from 'react';
import { Check, Info, Star, ArrowRight } from 'lucide-react';
import { MaterialSubtype, MaterialType } from '../../types/MaterialTypes';
import { getSubtypesForMaterial } from '../../data/materialSubtypes';
import Button from '../ui/Button';

interface SubtypeSelectionProps {
  materialType: MaterialType;
  selectedSubtype?: MaterialSubtype;
  onSubtypeSelect: (subtype: MaterialSubtype) => void;
  recommendedSubtypeId?: string;
  className?: string;
}

const SubtypeSelection: React.FC<SubtypeSelectionProps> = ({
  materialType,
  selectedSubtype,
  onSubtypeSelect,
  recommendedSubtypeId,
  className = ''
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const subtypes = getSubtypesForMaterial(materialType);

  if (subtypes.length === 0) {
    return null;
  }

  const materialTypeNames = {
    worksheet: 'pracovní list',
    quiz: 'kvíz',
    'lesson-plan': 'plán hodiny',
    project: 'projekt',
    presentation: 'prezentace',
    activity: 'aktivita'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Vyberte typ {materialTypeNames[materialType]}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Každý typ má specifické vlastnosti a použití
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComparison(!showComparison)}
        >
          {showComparison ? 'Skrýt porovnání' : 'Porovnat typy'}
        </Button>
      </div>

      {/* Subtype Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subtypes.map((subtype) => {
          const isSelected = selectedSubtype?.id === subtype.id;
          const isRecommended = recommendedSubtypeId === subtype.id;

          return (
            <div
              key={subtype.id}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
              onClick={() => onSubtypeSelect(subtype)}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Doporučeno
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {subtype.name}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {subtype.description}
                  </p>
                </div>

                {/* Special Fields Preview */}
                {subtype.specialFields.length > 0 && (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1 mb-1">
                      <Info className="w-3 h-3" />
                      <span>Speciální možnosti:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 ml-4">
                      {subtype.specialFields.slice(0, 2).map((field) => (
                        <li key={field.name}>{field.label}</li>
                      ))}
                      {subtype.specialFields.length > 2 && (
                        <li>a další...</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Examples */}
                {subtype.examples && subtype.examples.length > 0 && (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    <strong>Příklad:</strong> {subtype.examples[0]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Typ
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Popis
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Nejlepší pro
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Speciální funkce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {subtypes.map((subtype) => (
                <tr
                  key={subtype.id}
                  className={`hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                    selectedSubtype?.id === subtype.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {subtype.name}
                      </span>
                      {recommendedSubtypeId === subtype.id && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {subtype.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {subtype.examples?.[0] || 'Obecné použití'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {subtype.specialFields.length > 0 ? (
                      <span>{subtype.specialFields.length} speciálních možností</span>
                    ) : (
                      'Standardní možnosti'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selection Summary */}
      {selectedSubtype && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Vybrán typ: {selectedSubtype.name}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {selectedSubtype.description}
              </p>
              {selectedSubtype.promptModifications.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Toto ovlivní generování:
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc list-inside space-y-0.5">
                    {selectedSubtype.promptModifications.slice(0, 2).map((modification, index) => (
                      <li key={index}>{modification}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <ArrowRight className="w-5 h-5 text-blue-500 mt-1" />
          </div>
        </div>
      )}

      {/* Help Text */}
      {!selectedSubtype && (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Vyberte typ {materialTypeNames[materialType]} pro pokračování
          </p>
        </div>
      )}
    </div>
  );
};

export default SubtypeSelection;