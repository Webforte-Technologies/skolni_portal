import { MaterialSubtype, WorksheetSubtype, QuizSubtype, LessonPlanSubtype, ProjectSubtype, PresentationSubtype, ActivitySubtype } from '../types/MaterialTypes';

// Worksheet Subtypes
export const WORKSHEET_SUBTYPES: WorksheetSubtype[] = [
  {
    id: 'practice-problems',
    name: 'Cvičné úlohy',
    description: 'Strukturované cvičení pro procvičování nových dovedností',
    parentType: 'worksheet',
    specialFields: [
      { 
        name: 'problemTypes', 
        type: 'multiselect', 
        label: 'Typy úloh',
        required: false,
        options: ['výpočty', 'slovní úlohy', 'aplikace', 'analýza', 'syntéza'] 
      },
      { 
        name: 'scaffoldingLevel', 
        type: 'select', 
        label: 'Úroveň podpory',
        required: false,
        options: ['minimální', 'střední', 'vysoká'] 
      },
      {
        name: 'includeHints',
        type: 'boolean',
        label: 'Zahrnout nápovědy',
        required: false
      }
    ],
    promptModifications: [
      'Zaměř se na postupné zvyšování obtížnosti',
      'Poskytni jasné kroky řešení pro první úlohy',
      'Zahrň různé typy problémů pro komplexní pochopení'
    ],
    examples: [
      'Cvičení sčítání pro 2. třídu',
      'Procvičování rovnic pro 8. třídu',
      'Geometrické úlohy pro střední školu'
    ]
  },
  {
    id: 'homework-assignment',
    name: 'Domácí úkol',
    description: 'Samostatná práce pro upevnění učiva',
    parentType: 'worksheet',
    specialFields: [
      { 
        name: 'timeEstimate', 
        type: 'select', 
        label: 'Odhadovaný čas',
        required: false,
        options: ['15 min', '30 min', '45 min', '60 min'] 
      },
      { 
        name: 'parentGuidance', 
        type: 'boolean', 
        label: 'Zahrnout pokyny pro rodiče',
        required: false
      },
      {
        name: 'selfCheck',
        type: 'boolean',
        label: 'Přidat možnost sebekontroly',
        required: false
      }
    ],
    promptModifications: [
      'Vytvoř úlohy vhodné pro samostatnou práci doma',
      'Zahrň jasné instrukce a očekávané výsledky',
      'Přidej tipy pro rodiče, jak pomoci'
    ],
    examples: [
      'Domácí úkol z matematiky na víkend',
      'Procvičování slovní zásoby',
      'Příprava na test z dějepisu'
    ]
  },
  {
    id: 'assessment-worksheet',
    name: 'Hodnotící list',
    description: 'Pracovní list pro hodnocení znalostí',
    parentType: 'worksheet',
    specialFields: [
      {
        name: 'pointSystem',
        type: 'boolean',
        label: 'Zahrnout bodové hodnocení',
        required: false
      },
      {
        name: 'rubric',
        type: 'boolean',
        label: 'Přidat hodnotící kritéria',
        required: false
      }
    ],
    promptModifications: [
      'Vytvoř úlohy vhodné pro hodnocení znalostí',
      'Zahrň jasná hodnotící kritéria',
      'Zajisti spravedlivé rozložení obtížnosti'
    ],
    examples: [
      'Test z gramatiky',
      'Hodnocení matematických dovedností',
      'Ověření znalostí z přírodovědy'
    ]
  }
];

// Quiz Subtypes
export const QUIZ_SUBTYPES: QuizSubtype[] = [
  {
    id: 'formative-assessment',
    name: 'Formativní hodnocení',
    description: 'Kvíz pro průběžné ověření porozumění',
    parentType: 'quiz',
    specialFields: [
      {
        name: 'feedbackLevel',
        type: 'select',
        label: 'Úroveň zpětné vazby',
        required: false,
        options: ['základní', 'podrobná', 's vysvětlením']
      },
      {
        name: 'allowRetakes',
        type: 'boolean',
        label: 'Povolit opakování',
        required: false
      }
    ],
    promptModifications: [
      'Zaměř se na ověření porozumění klíčových konceptů',
      'Poskytni konstruktivní zpětnou vazbu',
      'Vytvoř otázky podporující učení'
    ],
    examples: [
      'Rychlý kvíz na začátku hodiny',
      'Ověření porozumění nové látce',
      'Průběžné hodnocení projektu'
    ]
  },
  {
    id: 'summative-test',
    name: 'Sumativní test',
    description: 'Komplexní test pro finální hodnocení',
    parentType: 'quiz',
    specialFields: [
      {
        name: 'coverageScope',
        type: 'select',
        label: 'Rozsah pokrytí',
        required: false,
        options: ['jedna lekce', 'kapitola', 'celé období', 'ročník']
      },
      {
        name: 'difficultyDistribution',
        type: 'select',
        label: 'Rozložení obtížnosti',
        required: false,
        options: ['rovnoměrné', 'pyramida (lehké→těžké)', 'diamant (střední převaha)']
      }
    ],
    promptModifications: [
      'Vytvoř komplexní test pokrývající všechny klíčové oblasti',
      'Zajisti vyvážené rozložení obtížnosti',
      'Zahrň různé typy otázek pro spravedlivé hodnocení'
    ],
    examples: [
      'Pololetní test z matematiky',
      'Závěrečný kvíz z kapitoly',
      'Maturitní zkouška z češtiny'
    ]
  },
  {
    id: 'diagnostic-assessment',
    name: 'Diagnostické hodnocení',
    description: 'Kvíz pro zjištění úrovně znalostí',
    parentType: 'quiz',
    specialFields: [
      {
        name: 'skillMapping',
        type: 'boolean',
        label: 'Mapování dovedností',
        required: false
      },
      {
        name: 'adaptiveQuestions',
        type: 'boolean',
        label: 'Adaptivní otázky',
        required: false
      }
    ],
    promptModifications: [
      'Vytvoř otázky pro zjištění současné úrovně znalostí',
      'Zaměř se na identifikaci mezer ve znalostech',
      'Poskytni doporučení pro další učení'
    ],
    examples: [
      'Vstupní test na začátku roku',
      'Diagnostika před novým tématem',
      'Zjištění úrovně cizího jazyka'
    ]
  }
];

// Lesson Plan Subtypes
export const LESSON_PLAN_SUBTYPES: LessonPlanSubtype[] = [
  {
    id: 'introduction-lesson',
    name: 'Úvodní hodina',
    description: 'Představení nového tématu nebo konceptu',
    parentType: 'lesson-plan',
    specialFields: [
      {
        name: 'priorKnowledge',
        type: 'textarea',
        label: 'Předchozí znalosti',
        placeholder: 'Co by studenti měli už znát?',
        required: false
      },
      {
        name: 'hookActivity',
        type: 'textarea',
        label: 'Úvodní aktivita',
        placeholder: 'Jak zaujmout pozornost studentů?',
        required: false
      }
    ],
    promptModifications: [
      'Zaměř se na motivaci a zaujmutí studentů',
      'Navažuj na předchozí znalosti',
      'Vytvoř jasný přehled toho, co se studenti naučí'
    ],
    examples: [
      'Úvod do zlomků',
      'První hodina o fotosyntéze',
      'Představení nové historické epochy'
    ]
  },
  {
    id: 'practice-lesson',
    name: 'Procvičovací hodina',
    description: 'Upevnění a procvičení naučeného',
    parentType: 'lesson-plan',
    specialFields: [
      {
        name: 'practiceTypes',
        type: 'multiselect',
        label: 'Typy procvičování',
        required: false,
        options: ['individuální práce', 'párová práce', 'skupinová práce', 'celotřídní diskuse']
      },
      {
        name: 'differentiationLevel',
        type: 'select',
        label: 'Úroveň diferenciace',
        required: false,
        options: ['žádná', 'základní', 'pokročilá']
      }
    ],
    promptModifications: [
      'Vytvoř různorodé aktivity pro procvičení',
      'Zahrň možnosti pro různé úrovně studentů',
      'Poskytni dostatek příležitostí k aplikaci znalostí'
    ],
    examples: [
      'Procvičování rovnic',
      'Aplikace gramatických pravidel',
      'Řešení slovních úloh'
    ]
  },
  {
    id: 'review-lesson',
    name: 'Opakovací hodina',
    description: 'Shrnutí a opakování před testem',
    parentType: 'lesson-plan',
    specialFields: [
      {
        name: 'reviewScope',
        type: 'select',
        label: 'Rozsah opakování',
        required: false,
        options: ['poslední hodina', 'týden', 'kapitola', 'celé období']
      },
      {
        name: 'reviewMethods',
        type: 'multiselect',
        label: 'Metody opakování',
        required: false,
        options: ['kvíz', 'diskuse', 'myšlenková mapa', 'prezentace', 'hry']
      }
    ],
    promptModifications: [
      'Zaměř se na klíčové koncepty a dovednosti',
      'Vytvoř interaktivní aktivity pro opakování',
      'Identifikuj a vyřeš časté chyby studentů'
    ],
    examples: [
      'Opakování před testem z dějepisu',
      'Shrnutí kapitoly o ekosystémech',
      'Příprava na maturitu z matematiky'
    ]
  }
];

// Project Subtypes
export const PROJECT_SUBTYPES: ProjectSubtype[] = [
  {
    id: 'research-project',
    name: 'Výzkumný projekt',
    description: 'Projekt zaměřený na výzkum a analýzu',
    parentType: 'project',
    specialFields: [
      {
        name: 'researchMethods',
        type: 'multiselect',
        label: 'Výzkumné metody',
        required: false,
        options: ['literatura', 'dotazník', 'rozhovor', 'pozorování', 'experiment']
      },
      {
        name: 'sourcesRequired',
        type: 'number',
        label: 'Minimální počet zdrojů',
        required: false,
        validation: { min: 1, max: 50 }
      }
    ],
    promptModifications: [
      'Zaměř se na vědecký přístup k výzkumu',
      'Zahrň metodologii a analýzu dat',
      'Poskytni pokyny pro citování zdrojů'
    ],
    examples: [
      'Výzkum místní historie',
      'Analýza kvality vody v okolí',
      'Průzkum názorů na ekologii'
    ]
  },
  {
    id: 'creative-project',
    name: 'Kreativní projekt',
    description: 'Projekt podporující kreativitu a originalitu',
    parentType: 'project',
    specialFields: [
      {
        name: 'mediumTypes',
        type: 'multiselect',
        label: 'Typy médií',
        required: false,
        options: ['text', 'obrázky', 'video', 'audio', 'interaktivní', 'fyzický model']
      },
      {
        name: 'originalityLevel',
        type: 'select',
        label: 'Požadavek na originalitu',
        required: false,
        options: ['adaptace', 'modifikace', 'originální tvorba']
      }
    ],
    promptModifications: [
      'Podporuj kreativní myšlení a originalitu',
      'Poskytni prostor pro osobní vyjádření',
      'Zahrň různé možnosti prezentace'
    ],
    examples: [
      'Vytvoření komiksu o historické události',
      'Složení písně o přírodě',
      'Návrh plakátu pro kampaň'
    ]
  },
  {
    id: 'group-project',
    name: 'Skupinový projekt',
    description: 'Projekt pro týmovou spolupráci',
    parentType: 'project',
    specialFields: [
      {
        name: 'groupSize',
        type: 'select',
        label: 'Velikost skupiny',
        required: false,
        options: ['2-3 studenti', '4-5 studentů', '6-8 studentů', 'celá třída']
      },
      {
        name: 'roleAssignment',
        type: 'boolean',
        label: 'Definovat role ve skupině',
        required: false
      }
    ],
    promptModifications: [
      'Zaměř se na spolupráci a komunikaci',
      'Definuj jasné role a odpovědnosti',
      'Zahrň mechanismy pro řešení konfliktů'
    ],
    examples: [
      'Skupinová prezentace o zemi',
      'Společné řešení environmentálního problému',
      'Týmový projekt na vytvoření aplikace'
    ]
  }
];

// Presentation Subtypes
export const PRESENTATION_SUBTYPES: PresentationSubtype[] = [
  {
    id: 'lecture-slides',
    name: 'Přednáškové slidy',
    description: 'Slidy pro výuku učitelem',
    parentType: 'presentation',
    specialFields: [
      {
        name: 'interactionLevel',
        type: 'select',
        label: 'Úroveň interakce',
        required: false,
        options: ['pasivní sledování', 'občasné otázky', 'aktivní zapojení']
      },
      {
        name: 'visualDensity',
        type: 'select',
        label: 'Hustota obsahu',
        required: false,
        options: ['minimalistické', 'vyvážené', 'detailní']
      }
    ],
    promptModifications: [
      'Vytvoř jasné a přehledné slidy pro výuku',
      'Zahrň klíčové body a vizuální podporu',
      'Poskytni poznámky pro učitele'
    ],
    examples: [
      'Přednáška o fotosyntéze',
      'Výklad matematických funkcí',
      'Představení literárního díla'
    ]
  },
  {
    id: 'student-presentation',
    name: 'Studentská prezentace',
    description: 'Šablona pro prezentace studentů',
    parentType: 'presentation',
    specialFields: [
      {
        name: 'guidanceLevel',
        type: 'select',
        label: 'Úroveň vedení',
        required: false,
        options: ['detailní pokyny', 'základní struktura', 'volná forma']
      },
      {
        name: 'presentationSkills',
        type: 'boolean',
        label: 'Zahrnout tipy pro prezentování',
        required: false
      }
    ],
    promptModifications: [
      'Vytvoř šablonu vhodnou pro studenty',
      'Zahrň pokyny pro efektivní prezentování',
      'Poskytni jasnou strukturu a časový plán'
    ],
    examples: [
      'Šablona pro referát o zemi',
      'Prezentace výsledků projektu',
      'Obhajoba seminární práce'
    ]
  },
  {
    id: 'interactive-presentation',
    name: 'Interaktivní prezentace',
    description: 'Prezentace s aktivním zapojením publika',
    parentType: 'presentation',
    specialFields: [
      {
        name: 'interactionTypes',
        type: 'multiselect',
        label: 'Typy interakce',
        required: false,
        options: ['otázky', 'hlasování', 'diskuse', 'aktivity', 'kvízy']
      },
      {
        name: 'technologyLevel',
        type: 'select',
        label: 'Úroveň technologií',
        required: false,
        options: ['bez technologií', 'základní nástroje', 'pokročilé nástroje']
      }
    ],
    promptModifications: [
      'Zahrň interaktivní prvky pro zapojení publika',
      'Vytvoř příležitosti pro diskusi a otázky',
      'Navrhni aktivity podporující učení'
    ],
    examples: [
      'Interaktivní hodina o klimatu',
      'Zapojující prezentace o historii',
      'Aktivní výuka cizího jazyka'
    ]
  }
];

// Activity Subtypes
export const ACTIVITY_SUBTYPES: ActivitySubtype[] = [
  {
    id: 'warmup-activity',
    name: 'Zahřívací aktivita',
    description: 'Krátká aktivita na začátek hodiny',
    parentType: 'activity',
    specialFields: [
      {
        name: 'energyLevel',
        type: 'select',
        label: 'Úroveň energie',
        required: false,
        options: ['klidná', 'mírně aktivní', 'velmi aktivní']
      },
      {
        name: 'connectionToLesson',
        type: 'select',
        label: 'Spojení s hodinou',
        required: false,
        options: ['přímé', 'nepřímé', 'obecné']
      }
    ],
    promptModifications: [
      'Vytvoř krátkou a poutavou aktivitu',
      'Zaměř se na motivaci a přípravu na učení',
      'Navažuj na téma hodiny'
    ],
    examples: [
      'Rychlá hra se slovy',
      'Matematická hádanka',
      'Diskuse o aktuálním tématu'
    ]
  },
  {
    id: 'main-activity',
    name: 'Hlavní aktivita',
    description: 'Ústřední aktivita hodiny',
    parentType: 'activity',
    specialFields: [
      {
        name: 'learningStyle',
        type: 'multiselect',
        label: 'Styly učení',
        required: false,
        options: ['vizuální', 'auditivní', 'kinestetický', 'čtení/psaní']
      },
      {
        name: 'complexityLevel',
        type: 'select',
        label: 'Úroveň složitosti',
        required: false,
        options: ['jednoduchá', 'střední', 'složitá', 'velmi složitá']
      }
    ],
    promptModifications: [
      'Vytvoř aktivitu podporující hlavní cíle hodiny',
      'Zahrň různé styly učení',
      'Poskytni jasné instrukce a očekávané výsledky'
    ],
    examples: [
      'Laboratorní experiment',
      'Skupinové řešení problému',
      'Kreativní psaní'
    ]
  },
  {
    id: 'closing-activity',
    name: 'Závěrečná aktivita',
    description: 'Aktivita pro ukončení hodiny',
    parentType: 'activity',
    specialFields: [
      {
        name: 'reflectionLevel',
        type: 'select',
        label: 'Úroveň reflexe',
        required: false,
        options: ['žádná', 'základní', 'hluboká']
      },
      {
        name: 'summaryType',
        type: 'select',
        label: 'Typ shrnutí',
        required: false,
        options: ['učitel shrne', 'studenti shrnou', 'společné shrnutí']
      }
    ],
    promptModifications: [
      'Vytvoř aktivitu pro shrnutí a reflexi',
      'Zaměř se na upevnění klíčových poznatků',
      'Poskytni prostor pro otázky a zpětnou vazbu'
    ],
    examples: [
      'Rychlé shrnutí v kruhu',
      'Exit ticket s otázkami',
      'Reflexe o naučeném'
    ]
  }
];

// Export all subtypes grouped by material type
export const MATERIAL_SUBTYPES = {
  worksheet: WORKSHEET_SUBTYPES,
  quiz: QUIZ_SUBTYPES,
  'lesson-plan': LESSON_PLAN_SUBTYPES,
  project: PROJECT_SUBTYPES,
  presentation: PRESENTATION_SUBTYPES,
  activity: ACTIVITY_SUBTYPES
} as const;

// Export function to get subtypes for a specific material type
export function getSubtypesForMaterial(materialType: string): MaterialSubtype[] {
  return MATERIAL_SUBTYPES[materialType as keyof typeof MATERIAL_SUBTYPES] || [];
}