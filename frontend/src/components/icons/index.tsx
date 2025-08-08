import React from 'react';
import {
  MessageSquare,
  Calculator,
  Atom,
  Beaker,
  Leaf,
  BookOpen,
  Languages,
} from 'lucide-react';

export type AssistantIconId =
  | 'math_assistant'
  | 'physics_assistant'
  | 'chemistry_assistant'
  | 'biology_assistant'
  | 'history_assistant'
  | 'language_assistant';

export const assistantIconMap: Record<AssistantIconId | string, React.ReactNode> = {
  math_assistant: <Calculator className="h-6 w-6 text-blue-600" />,
  physics_assistant: <Atom className="h-6 w-6 text-purple-600" />,
  chemistry_assistant: <Beaker className="h-6 w-6 text-green-600" />,
  biology_assistant: <Leaf className="h-6 w-6 text-emerald-600" />,
  history_assistant: <BookOpen className="h-6 w-6 text-orange-600" />,
  language_assistant: <Languages className="h-6 w-6 text-red-600" />,
};

export const getAssistantIcon = (id: string): React.ReactNode => {
  return assistantIconMap[id] ?? <MessageSquare className="h-6 w-6 text-blue-600" />;
};


