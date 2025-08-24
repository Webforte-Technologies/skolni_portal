import { MaterialSubtype, WorksheetSubtype, QuizSubtype, LessonPlanSubtype, ProjectSubtype, PresentationSubtype, ActivitySubtype } from '../types/MaterialTypes';

// Worksheet Subtypes - optimalizované pro český školní systém
export const WORKSHEET_SUBTYPES: WorksheetSubtype[] = [
  {
    id: 'procvicovani',
    name: 'Procvičování',
    description: 'Cvičení pro upevnění nově probrané látky',
    parentType: 'worksheet',
    specialFields: [
      { 
        name: 'typUloh', 
        type: 'multiselect', 
        label: 'Typy úloh',
        required: false,
        options: ['výpočty', 'slovní úlohy', 'doplňování', 'přiřazování', 'křížovky'] 
      },
      { 
        name: 'urovenPodpory', 
        type: 'select', 
        label: 'Úroveň podpory',
        required: false,
        options: ['s nápovědami', 'částečná podpora', 'samostatná práce'] 
      },
      {
        name: 'zahrnoutReseni',
        type: 'boolean',
        label: 'Zahrnout řešení',
        required: false
      }
    ],
    promptModifications: [
      'Zaměř se na postupné zvyšování obtížnosti',
      'Poskytni jasné kroky řešení pro první úlohy',
      'Zahrň různé typy problémů pro komplexní pochopení'
    ],
    examples: [
      'Procvičování sčítání pro 2. třídu',
      'Cvičení rovnic pro 8. třídu',
      'Geometrické úlohy pro střední školu'
    ]
  },
  {
    id: 'domaci-ukol',
    name: 'Domácí úkol',
    description: 'Samostatná práce pro upevnění učiva doma',
    parentType: 'worksheet',
    specialFields: [
      {
        name: 'obtiznost',
        type: 'select',
        label: 'Obtížnost',
        required: false,
        options: ['snadné', 'střední', 'těžké']
      },
      {
        name: 'casovaNarocnost',
        type: 'select',
        label: 'Časová náročnost',
        required: false,
        options: ['5-10 min', '10-20 min', '20-30 min', '30+ min']
      },
      {
        name: 'rodicovskaPodpora',
        type: 'boolean',
        label: 'Možnost rodičovské podpory',
        required: false
      }
    ],
    promptModifications: [
      'Vytvoř úkoly vhodné pro samostatnou práci doma',
      'Zahrň jasné instrukce pro rodiče',
      'Poskytni kontrolní řešení'
    ],
    examples: [
      'Domácí úkol z matematiky pro 4. třídu',
      'Procvičování českého jazyka doma',
      'Přírodovědné úkoly pro 6. třídu'
    ]
  },
  {
    id: 'kontrolni-prace',
    name: 'Kontrolní práce',
    description: 'Hodnotící worksheet pro ověření znalostí',
    parentType: 'worksheet',
    specialFields: [
      {
        name: 'typHodnoceni',
        type: 'select',
        label: 'Typ hodnocení',
        required: false,
        options: ['formativní', 'sumativní', 'diagnostické']
      },
      {
        name: 'bodoveHodnoceni',
        type: 'boolean',
        label: 'Bodové hodnocení',
        required: false
      },
      {
        name: 'kriterialniHodnoceni',
        type: 'boolean',
        label: 'Kriteriální hodnocení',
        required: false
      }
    ],
    promptModifications: [
      'Vytvoř úlohy pro objektivní hodnocení znalostí',
      'Zahrň jasná kritéria hodnocení',
      'Poskytni bodové ohodnocení'
    ],
    examples: [
      'Kontrolní práce z matematiky - 5. třída',
      'Test z českého jazyka - 7. třída',
      'Ověření znalostí z přírodovědy'
    ]
  },
  {
    id: 'opakovani',
    name: 'Opakování',
    description: 'Shrnutí a opakování probraného učiva',
    parentType: 'worksheet',
    specialFields: [
      {
        name: 'obdobiOpakovani',
        type: 'select',
        label: 'Období k opakování',
        required: false,
        options: ['poslední hodina', 'poslední týden', 'poslední měsíc', 'celé pololetí']
      },
      {
        name: 'stylOpakovani',
        type: 'select',
        label: 'Styl opakování',
        required: false,
        options: ['přehledné shrnutí', 'smíšené úlohy', 'postupné obtížnosti']
      }
    ],
    promptModifications: [
      'Zaměř se na systematické opakování klíčových konceptů',
      'Kombinuj různé typy úloh',
      'Zajisti pokrytí všech důležitých témat'
    ],
    examples: [
      'Opakování matematiky před testem',
      'Shrnutí českého jazyka za měsíc',
      'Přehled přírodovědy za pololetí'
    ]
  }
];

// Quiz Subtypes - optimalizované pro český školní systém
export const QUIZ_SUBTYPES: QuizSubtype[] = [
  {
    id: 'formativni-hodnoceni',
    name: 'Formativní hodnocení',
    description: 'Průběžné ověření porozumění během výuky',
    parentType: 'quiz',
    specialFields: [
      {
        name: 'mixOtazek',
        type: 'multiselect',
        label: 'Typy otázek',
        required: false,
        options: ['výběr z možností', 'pravda/nepravda', 'krátká odpověď', 'doplňování']
      },
      {
        name: 'okamziteVysledky',
        type: 'boolean',
        label: 'Okamžité výsledky',
        required: false
      },
      {
        name: 'zpětnaVazba',
        type: 'select',
        label: 'Úroveň zpětné vazby',
        required: false,
        options: ['základní', 'podrobná', 's vysvětlením']
      }
    ],
    promptModifications: [
      'Vytvoř kvíz pro průběžné ověření porozumění',
      'Zaměř se na rychlou zpětnou vazbu',
      'Otázky by měly být jasné a umožnit rychlé vyhodnocení'
    ],
    examples: [
      'Rychlý kvíz na začátku hodiny',
      'Ověření porozumění nové látce',
      'Průběžné hodnocení projektu'
    ]
  },
  {
    id: 'sumativni-test',
    name: 'Sumativní test',
    description: 'Komplexní hodnocení na konci učební jednotky',
    parentType: 'quiz',
    specialFields: [
      {
        name: 'casovyLimit',
        type: 'select',
        label: 'Časový limit',
        required: false,
        options: ['15 min', '30 min', '45 min', '60 min', 'bez limitu']
      },
      {
        name: 'typOtazek',
        type: 'multiselect',
        label: 'Typy otázek',
        required: false,
        options: ['výběr z možností', 'pravda/nepravda', 'krátká odpověď', 'esej', 'přiřazování']
      },
      {
        name: 'bodoveHodnoceni',
        type: 'boolean',
        label: 'Bodové hodnocení',
        required: false
      }
    ],
    promptModifications: [
      'Vytvoř komplexní test pokrývající celou učební jednotku',
      'Zahrň různé úrovně obtížnosti',
      'Poskytni jasná kritéria hodnocení'
    ],
    examples: [
      'Test z matematiky za čtvrtletí',
      'Závěrečný kvíz z kapitoly',
      'Maturitní zkouška z češtiny'
    ]
  },
  {
    id: 'diagnosticky-test',
    name: 'Diagnostický test',
    description: 'Zjištění úrovně znalostí a dovedností',
    parentType: 'quiz',
    specialFields: [
      {
        name: 'diagnostickaOblast',
        type: 'multiselect',
        label: 'Diagnostické oblasti',
        required: false,
        options: ['znalosti', 'dovednosti', 'porozumění', 'aplikace', 'analýza']
      },
      {
        name: 'urovenObtiznosti',
        type: 'select',
        label: 'Úroveň obtížnosti',
        required: false,
        options: ['základní', 'střední', 'pokročilé', 'smíšené']
      }
    ],
    promptModifications: [
      'Vytvoř test pro zjištění úrovně znalostí',
      'Zahrň otázky různé obtížnosti',
      'Poskytni diagnostické informace'
    ],
    examples: [
      'Diagnostika matematických dovedností',
      'Zjištění úrovně čtenářské gramotnosti',
      'Hodnocení přírodovědných znalostí'
    ]
  }
];

// Lesson Plan Subtypes - optimalizované pro český školní systém
export const LESSON_PLAN_SUBTYPES: LessonPlanSubtype[] = [
  {
    id: 'uvodni-hodina',
    name: 'Úvodní hodina',
    description: 'Představení nového tématu nebo konceptu',
    parentType: 'lesson-plan',
    specialFields: [
      {
        name: 'motivacniPrvek',
        type: 'select',
        label: 'Motivační prvek',
        required: false,
        options: ['příběh', 'experiment', 'problém', 'video', 'diskuze']
      },
      {
        name: 'aktivizacePredchozichZnalosti',
        type: 'boolean',
        label: 'Aktivizace předchozích znalostí',
        required: false
      },
      {
        name: 'stanoveniCilu',
        type: 'boolean',
        label: 'Stanovení cíle hodiny',
        required: false
      }
    ],
    promptModifications: [
      'Zaměř se na motivaci a zájem žáků',
      'Aktivuj předchozí znalosti',
      'Jasně stanov cíle hodiny'
    ],
    examples: [
      'Úvod do zlomků v 5. třídě',
      'Představení fotosyntézy',
      'Úvod do dějepisu - pravěk'
    ]
  },
  {
    id: 'procvicovaci-hodina',
    name: 'Procvičovací hodina',
    description: 'Upevnění a procvičení nových dovedností',
    parentType: 'lesson-plan',
    specialFields: [
      {
        name: 'typProcvicovani',
        type: 'select',
        label: 'Typ procvičování',
        required: false,
        options: ['individuální', 'skupinové', 'frontální', 'smíšené']
      },
      {
        name: 'urovenObtiznosti',
        type: 'select',
        label: 'Úroveň obtížnosti',
        required: false,
        options: ['základní', 'střední', 'pokročilé', 'postupné']
      },
      {
        name: 'zpětnaVazba',
        type: 'boolean',
        label: 'Okamžitá zpětná vazba',
        required: false
      }
    ],
    promptModifications: [
      'Zaměř se na praktické procvičování',
      'Poskytuj okamžitou zpětnou vazbu',
      'Postupně zvyšuj obtížnost'
    ],
    examples: [
      'Procvičování sčítání zlomků',
      'Cvičení z českého jazyka',
      'Praktické úlohy z přírodovědy'
    ]
  },
  {
    id: 'opakovaci-hodina',
    name: 'Opakovací hodina',
    description: 'Shrnutí a opakování probraného učiva',
    parentType: 'lesson-plan',
    specialFields: [
      {
        name: 'obdobiOpakovani',
        type: 'select',
        label: 'Období k opakování',
        required: false,
        options: ['poslední hodina', 'poslední týden', 'poslední měsíc', 'celé téma']
      },
      {
        name: 'formaOpakovani',
        type: 'select',
        label: 'Forma opakování',
        required: false,
        options: ['přehled', 'kvíz', 'hra', 'diskuse', 'smíšené']
      }
    ],
    promptModifications: [
      'Systematicky opakuj klíčové koncepty',
      'Použij různé formy opakování',
      'Zajisti pochopení všech žáků'
    ],
    examples: [
      'Opakování matematiky před testem',
      'Shrnutí českého jazyka za měsíc',
      'Přehled přírodovědy za téma'
    ]
  },
  {
    id: 'hodnocici-hodina',
    name: 'Hodnotící hodina',
    description: 'Hodnocení a reflexe učebních výsledků',
    parentType: 'lesson-plan',
    specialFields: [
      {
        name: 'typHodnoceni',
        type: 'select',
        label: 'Typ hodnocení',
        required: false,
        options: ['sebehodnocení', 'vrstevnické', 'učitelovo', 'smíšené']
      },
      {
        name: 'formaHodnoceni',
        type: 'select',
        label: 'Forma hodnocení',
        required: false,
        options: ['ústní', 'písemné', 'projektové', 'portfoliové']
      }
    ],
    promptModifications: [
      'Zaměř se na konstruktivní hodnocení',
      'Zahrň sebehodnocení žáků',
      'Poskytuj konkrétní doporučení'
    ],
    examples: [
      'Hodnocení projektu z matematiky',
      'Reflexe čtenářských dovedností',
      'Zhodnocení přírodovědného experimentu'
    ]
  }
];

// Project Subtypes - optimalizované pro český školní systém
export const PROJECT_SUBTYPES: ProjectSubtype[] = [
  {
    id: 'vyzkumny-projekt',
    name: 'Výzkumný projekt',
    description: 'Samostatný výzkum na zvolené téma',
    parentType: 'project',
    specialFields: [
      {
        name: 'typVyzkumu',
        type: 'select',
        label: 'Typ výzkumu',
        required: false,
        options: ['literární rešerše', 'experiment', 'průzkum', 'analýza dat']
      },
      {
        name: 'delkaProjektu',
        type: 'select',
        label: 'Délka projektu',
        required: false,
        options: ['1 týden', '2 týdny', '1 měsíc', 'pololetí']
      },
      {
        name: 'formaVystupu',
        type: 'select',
        label: 'Forma výstupu',
        required: false,
        options: ['prezentace', 'plakát', 'model', 'video', 'esej']
      }
    ],
    promptModifications: [
      'Vytvoř strukturovaný výzkumný projekt',
      'Zahrň jasné kroky a metodiku',
      'Stanov konkrétní výstup'
    ],
    examples: [
      'Výzkum historie města',
      'Experiment s rostlinami',
      'Analýza spotřebitelského chování'
    ]
  },
  {
    id: 'kreativni-projekt',
    name: 'Kreativní projekt',
    description: 'Tvůrčí práce s důrazem na originalitu',
    parentType: 'project',
    specialFields: [
      {
        name: 'kreativniOblast',
        type: 'select',
        label: 'Kreativní oblast',
        required: false,
        options: ['výtvarná', 'literární', 'hudební', 'technická', 'multimediální']
      },
      {
        name: 'individuálníSkupinový',
        type: 'select',
        label: 'Forma práce',
        required: false,
        options: ['individuální', 'skupinový', 'celotřídní']
      }
    ],
    promptModifications: [
      'Podporuj kreativitu a originalitu',
      'Zahrň různé formy vyjádření',
      'Poskytuj prostor pro experimentování'
    ],
    examples: [
      'Výtvarný projekt - portrét',
      'Literární projekt - povídka',
      'Technický projekt - model'
    ]
  },
  {
    id: 'sluzebni-projekt',
    name: 'Služební projekt',
    description: 'Projekt prospěšný pro komunitu nebo školu',
    parentType: 'project',
    specialFields: [
      {
        name: 'cilovaSkupina',
        type: 'select',
        label: 'Cílová skupina',
        required: false,
        options: ['mladší žáci', 'senioři', 'komunita', 'škola', 'rodina']
      },
      {
        name: 'typSluzby',
        type: 'select',
        label: 'Typ služby',
        required: false,
        options: ['vzdělávací', 'pomocná', 'informační', 'kulturní']
      }
    ],
    promptModifications: [
      'Zaměř se na prospěch pro komunitu',
      'Zahrň praktické dovednosti',
      'Posiluj sociální odpovědnost'
    ],
    examples: [
      'Výuka počítačů pro seniory',
      'Úklid okolí školy',
      'Informační kampaň o třídění odpadu'
    ]
  }
];

// Presentation Subtypes - optimalizované pro český školní systém
export const PRESENTATION_SUBTYPES: PresentationSubtype[] = [
  {
    id: 'vyukove-slidy',
    name: 'Výukové slidy',
    description: 'Prezentace pro výklad nového učiva',
    parentType: 'presentation',
    specialFields: [
      {
        name: 'pocetSlidu',
        type: 'number',
        label: 'Počet slidů',
        required: false,
        validation: { min: 5, max: 30 }
      },
      {
        name: 'typPrezentace',
        type: 'select',
        label: 'Typ prezentace',
        required: false,
        options: ['výkladová', 'interaktivní', 'přehledová', 'motivační']
      },
      {
        name: 'vizuálníPrvky',
        type: 'multiselect',
        label: 'Vizuální prvky',
        required: false,
        options: ['obrázky', 'grafy', 'diagramy', 'videa', 'animace']
      }
    ],
    promptModifications: [
      'Vytvoř jasnou a přehlednou prezentaci',
      'Zahrň vizuální podporu',
      'Strukturovaně prezentuj informace'
    ],
    examples: [
      'Prezentace o fotosyntéze',
      'Výklad matematických konceptů',
      'Přehled historických událostí'
    ]
  },
  {
    id: 'studentska-prezentace',
    name: 'Studentská prezentace',
    description: 'Šablona pro prezentace žáků',
    parentType: 'presentation',
    specialFields: [
      {
        name: 'urovenZaku',
        type: 'select',
        label: 'Úroveň žáků',
        required: false,
        options: ['1. stupeň ZŠ', '2. stupeň ZŠ', 'SŠ']
      },
      {
        name: 'formaPrezentace',
        type: 'select',
        label: 'Forma prezentace',
        required: false,
        options: ['ústní', 'poster', 'digitální', 'multimediální']
      }
    ],
    promptModifications: [
      'Přizpůsob úrovni žáků',
      'Zahrň jasné instrukce',
      'Podporuj aktivní zapojení'
    ],
    examples: [
      'Prezentace projektu žáka 6. třídy',
      'Poster o zvířatech pro 3. třídu',
      'Digitální prezentace pro středoškoláky'
    ]
  },
  {
    id: 'prezentace-projektu',
    name: 'Prezentace projektu',
    description: 'Prezentace výsledků projektové práce',
    parentType: 'presentation',
    specialFields: [
      {
        name: 'typProjektu',
        type: 'select',
        label: 'Typ projektu',
        required: false,
        options: ['výzkumný', 'kreativní', 'služební', 'technický']
      },
      {
        name: 'cilovaAudience',
        type: 'select',
        label: 'Cílová audience',
        required: false,
        options: ['třída', 'škola', 'rodiče', 'veřejnost']
      }
    ],
    promptModifications: [
      'Zaměř se na prezentaci výsledků',
      'Zahrň metodiku a závěry',
      'Připrav na otázky a diskusi'
    ],
    examples: [
      'Prezentace výzkumného projektu',
      'Představení kreativního díla',
      'Zpráva o služebním projektu'
    ]
  }
];

// Activity Subtypes - optimalizované pro český školní systém
export const ACTIVITY_SUBTYPES: ActivitySubtype[] = [
  {
    id: 'zahrici-aktivita',
    name: 'Zahřívací aktivita',
    description: 'Krátká aktivita na začátek hodiny',
    parentType: 'activity',
    specialFields: [
      {
        name: 'energetickaUroven',
        type: 'select',
        label: 'Energetická úroveň',
        required: false,
        options: ['klidná', 'mírně aktivní', 'velmi aktivní']
      },
      {
        name: 'spojeniSHodinou',
        type: 'select',
        label: 'Spojení s hodinou',
        required: false,
        options: ['přímé', 'nepřímé', 'obecné']
      },
      {
        name: 'delkaAktivity',
        type: 'select',
        label: 'Délka aktivity',
        required: false,
        options: ['5 min', '10 min', '15 min']
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
    id: 'hlavni-aktivita',
    name: 'Hlavní aktivita',
    description: 'Ústřední aktivita hodiny',
    parentType: 'activity',
    specialFields: [
      {
        name: 'stylUceni',
        type: 'multiselect',
        label: 'Styly učení',
        required: false,
        options: ['vizuální', 'auditivní', 'kinestetický', 'čtení/psaní']
      },
      {
        name: 'slozitost',
        type: 'select',
        label: 'Úroveň složitosti',
        required: false,
        options: ['jednoduchá', 'střední', 'složitá', 'velmi složitá']
      },
      {
        name: 'formaPrace',
        type: 'select',
        label: 'Forma práce',
        required: false,
        options: ['individuální', 'skupinová', 'frontální', 'smíšená']
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
    id: 'zavěrečná-aktivita',
    name: 'Závěrečná aktivita',
    description: 'Aktivita na konec hodiny pro upevnění učiva',
    parentType: 'activity',
    specialFields: [
      {
        name: 'typReflexe',
        type: 'select',
        label: 'Typ reflexe',
        required: false,
        options: ['ústní', 'písemná', 'výtvarná', 'pohybová']
      },
      {
        name: 'formaShrnutí',
        type: 'select',
        label: 'Forma shrnutí',
        required: false,
        options: ['diskuse', 'kvíz', 'hra', 'prezentace']
      }
    ],
    promptModifications: [
      'Zaměř se na upevnění klíčových poznatků',
      'Zahrň reflexi a sebehodnocení',
      'Poskytuj zpětnou vazbu'
    ],
    examples: [
      'Shrnutí hodiny formou hry',
      'Reflexe o naučeném',
      'Závěrečný kvíz'
    ]
  },
  {
    id: 'přestávková-aktivita',
    name: 'Přestávková aktivita',
    description: 'Krátká aktivita během přestávky nebo pro uvolnění',
    parentType: 'activity',
    specialFields: [
      {
        name: 'typAktivity',
        type: 'select',
        label: 'Typ aktivity',
        required: false,
        options: ['pohybová', 'relaxační', 'hudební', 'výtvarná']
      },
      {
        name: 'místoKonání',
        type: 'select',
        label: 'Místo konání',
        required: false,
        options: ['třída', 'chodba', 'tělocvična', 'venku']
      }
    ],
    promptModifications: [
      'Vytvoř aktivitu pro uvolnění a relaxaci',
      'Zaměř se na pohyb a energii',
      'Přizpůsob prostoru a času'
    ],
    examples: [
      'Krátká pohybová hra',
      'Relaxační cvičení',
      'Hudební aktivita'
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