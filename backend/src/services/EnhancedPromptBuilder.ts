import { AssignmentAnalysis, MaterialType } from './AssignmentAnalyzer';

export interface MaterialSubtype {
  id: string;
  name: string;
  description: string;
  parentType: MaterialType;
  specialFields: TemplateField[];
  promptModifications: PromptModification[];
}

export interface TemplateField {
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number';
  label: string;
  options?: string[];
  required?: boolean;
  defaultValue?: any;
}

export interface PromptModification {
  type: 'prepend' | 'append' | 'replace' | 'inject';
  target?: string;
  content: string;
  condition?: string;
}

export interface PromptBuildParams {
  materialType: MaterialType;
  subtype?: MaterialSubtype;
  assignment?: AssignmentAnalysis;
  userInputs: {
    title?: string;
    subject?: string;
    grade_level?: string;
    duration?: string;
    question_count?: number;
    difficulty_progression?: boolean;
    include_answer_key?: boolean;
    time_limit?: string;
    question_types?: string[];
    class_size?: number;
    teaching_methods?: string[];
    available_resources?: string[];
    project_type?: string;
    group_size?: number;
    assessment_criteria?: string[];
    slide_count?: number;
    presentation_style?: string;
    target_audience?: string;
    activity_type?: string;
    required_materials?: string[];
  };
  qualityLevel: QualityLevel;
  customInstructions?: string;
}

export type QualityLevel = 'základní' | 'standardní' | 'vysoká' | 'expertní';

export class EnhancedPromptBuilder {
  private basePrompts: Map<MaterialType, string>;
  private qualityConstraints: Map<QualityLevel, string[]>;

  constructor() {
    this.basePrompts = new Map();
    this.qualityConstraints = new Map();
    this.initializeBasePrompts();
    this.initializeQualityConstraints();
  }

  async buildPrompt(params: PromptBuildParams): Promise<string> {
    let prompt = this.getBasePrompt(params.materialType);
    
    // Add assignment context if available
    if (params.assignment) {
      prompt = this.addAssignmentContext(prompt, params.assignment);
    }
    
    // Add subtype modifications if specified
    if (params.subtype) {
      prompt = this.addSubtypeModifications(prompt, params.subtype);
    }
    
    // Add quality constraints
    prompt = this.addQualityConstraints(prompt, params.qualityLevel);
    
    // Add user inputs
    prompt = this.addUserInputs(prompt, params.userInputs, params.materialType);
    
    // Add custom instructions
    if (params.customInstructions) {
      prompt = this.addCustomInstructions(prompt, params.customInstructions);
    }
    
    // Final formatting and validation
    prompt = this.finalizePrompt(prompt, params);
    
    return prompt;
  }

  addSubtypeModifications(prompt: string, subtype: MaterialSubtype): string {
    let modifiedPrompt = prompt;
    
    for (const modification of subtype.promptModifications) {
      switch (modification.type) {
        case 'prepend':
          modifiedPrompt = `${modification.content}\n\n${modifiedPrompt}`;
          break;
        case 'append':
          modifiedPrompt = `${modifiedPrompt}\n\n${modification.content}`;
          break;
        case 'replace':
          if (modification.target) {
            modifiedPrompt = modifiedPrompt.replace(
              new RegExp(modification.target, 'gi'),
              modification.content
            );
          }
          break;
        case 'inject':
          if (modification.target) {
            const targetIndex = modifiedPrompt.indexOf(modification.target);
            if (targetIndex !== -1) {
              modifiedPrompt = 
                modifiedPrompt.slice(0, targetIndex + modification.target.length) +
                '\n' + modification.content + '\n' +
                modifiedPrompt.slice(targetIndex + modification.target.length);
            }
          }
          break;
      }
    }
    
    return modifiedPrompt;
  }

  addAssignmentContext(prompt: string, assignment: AssignmentAnalysis): string {
    const contextSection = `
KONTEXT ZADÁNÍ:
- Předmět: ${assignment.subject}
- Ročník: ${assignment.gradeLevel}
- Obtížnost: ${assignment.difficulty}
- Odhadovaná doba: ${assignment.estimatedDuration}
- Klíčová témata: ${assignment.keyTopics.join(', ')}

CÍLE UČENÍ:
${assignment.learningObjectives.map(obj => `- ${obj}`).join('\n')}

POKYNY PRO GENEROVÁNÍ:
Zaměř se na uvedené cíle učení a přizpůsob obsah specifikované obtížnosti a ročníku.
Zajisti, že materiál pokrývá klíčová témata a je vhodný pro daný předmět.
`;
    
    return `${contextSection}\n\n${prompt}`;
  }

  addQualityConstraints(prompt: string, qualityLevel: QualityLevel): string {
    const constraints = this.qualityConstraints.get(qualityLevel) || [];
    
    if (constraints.length === 0) {
      return prompt;
    }
    
    const qualitySection = `
POŽADAVKY NA KVALITU (${qualityLevel.toUpperCase()}):
${constraints.map(constraint => `- ${constraint}`).join('\n')}
`;
    
    return `${prompt}\n\n${qualitySection}`;
  }

  private getBasePrompt(materialType: MaterialType): string {
    return this.basePrompts.get(materialType) || this.getDefaultPrompt(materialType);
  }

  private initializeBasePrompts(): void {
    this.basePrompts.set('worksheet', `
Vytvoř kvalitní pracovní list v českém jazyce podle následujících specifikací.

STRUKTURA PRACOVNÍHO LISTU:
1. Hlavička s názvem, místem pro jméno žáka, třídu a datum
2. Jasné pokyny pro žáky
3. Postupně se zvyšující obtížnost úloh
4. Různorodé typy úloh pro udržení pozornosti
5. Dostatečný prostor pro odpovědi
6. Bonusové úlohy pro rychlejší žáky

POŽADAVKY NA OBSAH:
- Všechny úlohy musí být jasně formulované
- Poskytni správné odpovědi pro všechny úlohy
- Zahrň praktické příklady a aplikace
- Používej věkově přiměřený jazyk
- Dodržuj české pravopisné normy

FORMÁT VÝSTUPU:
Vrať JSON objekt s následující strukturou:
{
  "title": "Název pracovního listu",
  "instructions": "Pokyny pro žáky",
  "questions": [
    {
      "problem": "Znění úlohy",
      "answer": "Správná odpověď",
      "type": "typ úlohy (calculation, word_problem, multiple_choice, atd.)"
    }
  ],
  "tags": ["relevantní štítky"]
}
`);

    this.basePrompts.set('lesson-plan', `
Vytvoř detailní plán hodiny v českém jazyce podle následujících specifikací.

STRUKTURA PLÁNU HODINY:
1. Základní informace (název, předmět, ročník, doba trvání)
2. Cíle hodiny (konkrétní a měřitelné)
3. Potřebné materiály a pomůcky
4. Postupné aktivity s časovým rozpisem
5. Diferenciace pro různé typy žáků
6. Domácí úkol
7. Způsob hodnocení

POŽADAVKY NA OBSAH:
- Aktivity musí logicky navazovat
- Celkový čas aktivit se musí shodovat s délkou hodiny
- Zahrň různé formy práce (individuální, skupinová, frontální)
- Respektuj principy moderní pedagogiky
- Poskytni konkrétní kroky pro každou aktivitu

FORMÁT VÝSTUPU:
Vrať JSON objekt s následující strukturou:
{
  "title": "Název hodiny",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "Doba trvání",
  "objectives": ["seznam cílů"],
  "materials": ["seznam materiálů"],
  "activities": [
    {
      "name": "Název aktivity",
      "description": "Popis aktivity",
      "steps": ["kroky aktivity"],
      "time": "čas v minutách"
    }
  ],
  "differentiation": "Způsoby diferenciace",
  "homework": "Domácí úkol",
  "assessment": "Způsob hodnocení",
  "tags": ["relevantní štítky"]
}
`);

    this.basePrompts.set('quiz', `
Vytvoř kvalitní kvíz v českém jazyce podle následujících specifikací.

STRUKTURA KVÍZU:
1. Základní informace (název, předmět, ročník, časový limit)
2. Různorodé typy otázek
3. Vyvážené pokrytí učiva
4. Postupně se zvyšující obtížnost
5. Jasné a jednoznačné formulace
6. Správné odpovědi s vysvětleními

TYPY OTÁZEK:
- Výběr z možností (multiple_choice)
- Pravda/nepravda (true_false)
- Krátká odpověď (short_answer)

POŽADAVKY NA OBSAH:
- Otázky musí být jasné a jednoznačné
- Nesprávné možnosti musí být věrohodné
- Zahrň různé kognitivní úrovně (znalosti, porozumění, aplikace)
- Používej věkově přiměřený jazyk

FORMÁT VÝSTUPU:
Vrať JSON objekt s následující strukturou:
{
  "title": "Název kvízu",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "time_limit": "Časový limit nebo 'no_limit'",
  "questions": [
    {
      "type": "multiple_choice|true_false|short_answer",
      "question": "Znění otázky",
      "options": ["možnosti pro multiple_choice"],
      "answer": "správná odpověď (pro true_false použij 'pravda' nebo 'nepravda')"
    }
  ],
  "tags": ["relevantní štítky"]
}
`);

    this.basePrompts.set('project', `
Vytvoř detailní zadání projektu v českém jazyce podle následujících specifikací.

STRUKTURA PROJEKTU:
1. Základní informace (název, předmět, ročník, doba trvání)
2. Cíle a očekávané výstupy
3. Detailní popis zadání
4. Seznam výstupů (deliverables)
5. Hodnotící rubrika s kritérii
6. Doporučené zdroje a materiály

POŽADAVKY NA OBSAH:
- Projekt musí být realizovatelný v daném časovém rámci
- Cíle musí být konkrétní a měřitelné
- Rubrika musí pokrývat všechny důležité aspekty
- Zahrň možnosti pro různé úrovně žáků
- Poskytni jasné pokyny a očekávání

FORMÁT VÝSTUPU:
Vrať JSON objekt s následující strukturou:
{
  "template": "project",
  "title": "Název projektu",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "Doba trvání",
  "objectives": ["seznam cílů"],
  "description": "Detailní popis zadání",
  "deliverables": ["seznam výstupů"],
  "rubric": [
    {
      "criteria": "Kritérium hodnocení",
      "levels": ["úrovně hodnocení"]
    }
  ],
  "tags": ["relevantní štítky"]
}
`);

    this.basePrompts.set('presentation', `
Vytvoř strukturu prezentace v českém jazyce podle následujících specifikací.

STRUKTURA PREZENTACE:
1. Úvodní slide s názvem a základními informacemi
2. Přehled obsahu
3. Hlavní slides s klíčovými body
4. Praktické příklady a aplikace
5. Shrnutí a závěr
6. Otázky k diskusi

POŽADAVKY NA OBSAH:
- Každý slide musí mít jasný nadpis
- Používej odrážky pro lepší přehlednost
- Zahrň vizuální návrhy tam, kde je to vhodné
- Obsah musí být věkově přiměřený
- Dodržuj logickou posloupnost témat

FORMÁT VÝSTUPU:
Vrať JSON objekt s následující strukturou:
{
  "template": "presentation",
  "title": "Název prezentace",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "slides": [
    {
      "heading": "Nadpis slidu",
      "bullets": ["seznam bodů na slidu"]
    }
  ],
  "tags": ["relevantní štítky"]
}
`);

    this.basePrompts.set('activity', `
Vytvoř popis vzdělávací aktivity v českém jazyce podle následujících specifikací.

STRUKTURA AKTIVITY:
1. Základní informace (název, předmět, ročník, doba trvání)
2. Cíl aktivity
3. Potřebné materiály
4. Krok za krokem pokyny
5. Varianty pro různé úrovně
6. Očekávané výsledky

POŽADAVKY NA OBSAH:
- Aktivita musí být prakticky realizovatelná
- Pokyny musí být jasné a srozumitelné
- Zahrň bezpečnostní upozornění, pokud je to relevantní
- Poskytni alternativy pro různé velikosti skupin
- Aktivita musí podporovat stanovené cíle učení

FORMÁT VÝSTUPU:
Vrať JSON objekt s následující strukturou:
{
  "title": "Název aktivity",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "Doba trvání",
  "goal": "Cíl aktivity",
  "instructions": ["seznam pokynů"],
  "materials": ["seznam materiálů"],
  "variation": "Varianty aktivity",
  "tags": ["relevantní štítky"]
}
`);
  }

  private initializeQualityConstraints(): void {
    this.qualityConstraints.set('základní', [
      'Používej jednoduchý a srozumitelný jazyk',
      'Zahrň základní příklady a vysvětlení',
      'Poskytni jasné pokyny a instrukce',
      'Minimalizuj složitost úloh'
    ]);

    this.qualityConstraints.set('standardní', [
      'Používej přiměřeně náročný jazyk',
      'Zahrň praktické příklady a aplikace',
      'Poskytni detailní vysvětlení konceptů',
      'Vyvažuj různé typy úloh a aktivit',
      'Dodržuj pedagogické principy'
    ]);

    this.qualityConstraints.set('vysoká', [
      'Používej precizní a odborný jazyk',
      'Zahrň komplexní příklady a případové studie',
      'Poskytni hluboké analýzy a vysvětlení',
      'Integruj mezipředmětové souvislosti',
      'Podporuj kritické myšlení',
      'Dodržuj nejvyšší pedagogické standardy'
    ]);

    this.qualityConstraints.set('expertní', [
      'Používej expertní terminologii a koncepty',
      'Zahrň nejnovější poznatky z oboru',
      'Poskytni originální přístupy a metodiky',
      'Integruj výzkumné poznatky',
      'Podporuj inovativní myšlení',
      'Respektuj nejnovější pedagogické trendy',
      'Zahrň možnosti pro samostatný výzkum'
    ]);
  }

  private addUserInputs(prompt: string, userInputs: PromptBuildParams['userInputs'], materialType: MaterialType): string {
    const inputSection = this.buildUserInputSection(userInputs, materialType);
    return `${prompt}\n\n${inputSection}`;
  }

  private buildUserInputSection(userInputs: PromptBuildParams['userInputs'], materialType: MaterialType): string {
    let section = 'SPECIFIKACE UŽIVATELE:\n';
    
    // Common fields for all material types
    if (userInputs.title) section += `- Název: ${userInputs.title}\n`;
    if (userInputs.subject) section += `- Předmět: ${userInputs.subject}\n`;
    if (userInputs.grade_level) section += `- Ročník: ${userInputs.grade_level}\n`;
    if (userInputs.duration) section += `- Doba trvání: ${userInputs.duration}\n`;
    
    // Material-specific fields
    switch (materialType) {
      case 'worksheet':
        if (userInputs.question_count) section += `- Počet úloh: ${userInputs.question_count}\n`;
        if (userInputs.difficulty_progression) section += `- Postupné zvyšování obtížnosti: ${userInputs.difficulty_progression}\n`;
        if (userInputs.include_answer_key) section += `- Zahrnout klíč odpovědí: ${userInputs.include_answer_key}\n`;
        break;
        
      case 'quiz':
        if (userInputs.question_count) section += `- Počet otázek: ${userInputs.question_count}\n`;
        if (userInputs.time_limit) section += `- Časový limit: ${userInputs.time_limit}\n`;
        if (userInputs.question_types) section += `- Typy otázek: ${userInputs.question_types.join(', ')}\n`;
        break;
        
      case 'lesson-plan':
        if (userInputs.class_size) section += `- Velikost třídy: ${userInputs.class_size}\n`;
        if (userInputs.teaching_methods) section += `- Metody výuky: ${userInputs.teaching_methods.join(', ')}\n`;
        if (userInputs.available_resources) section += `- Dostupné zdroje: ${userInputs.available_resources.join(', ')}\n`;
        break;
        
      case 'project':
        if (userInputs.project_type) section += `- Typ projektu: ${userInputs.project_type}\n`;
        if (userInputs.group_size) section += `- Velikost skupiny: ${userInputs.group_size}\n`;
        if (userInputs.assessment_criteria) section += `- Kritéria hodnocení: ${userInputs.assessment_criteria.join(', ')}\n`;
        break;
        
      case 'presentation':
        if (userInputs.slide_count) section += `- Počet slidů: ${userInputs.slide_count}\n`;
        if (userInputs.presentation_style) section += `- Styl prezentace: ${userInputs.presentation_style}\n`;
        if (userInputs.target_audience) section += `- Cílová skupina: ${userInputs.target_audience}\n`;
        break;
        
      case 'activity':
        if (userInputs.activity_type) section += `- Typ aktivity: ${userInputs.activity_type}\n`;
        if (userInputs.group_size) section += `- Velikost skupiny: ${userInputs.group_size}\n`;
        if (userInputs.required_materials) section += `- Potřebné materiály: ${userInputs.required_materials.join(', ')}\n`;
        break;
    }
    
    return section;
  }

  private addCustomInstructions(prompt: string, customInstructions: string): string {
    const customSection = `
DODATEČNÉ POKYNY:
${customInstructions}

Zajisti, že tyto pokyny jsou plně respektovány při generování obsahu.
`;
    
    return `${prompt}\n\n${customSection}`;
  }

  private finalizePrompt(prompt: string, params: PromptBuildParams): string {
    const finalSection = `
DŮLEŽITÉ PŘIPOMÍNKY:
- Veškerý obsah musí být v českém jazyce
- Dodržuj české pravopisné a gramatické normy
- Používej věkově přiměřený jazyk pro ${params.userInputs.grade_level || 'daný ročník'}
- Zajisti pedagogickou správnost a užitečnost materiálu
- Vrať pouze validní JSON objekt bez dalšího textu
- Všechny povinné pole musí být vyplněna

ZAČNI GENEROVÁNÍ:
`;
    
    return `${prompt}\n\n${finalSection}`;
  }

  private getDefaultPrompt(materialType: MaterialType): string {
    return `
Vytvoř kvalitní vzdělávací materiál typu "${materialType}" v českém jazyce.
Materiál musí být pedagogicky správný, věkově přiměřený a prakticky použitelný.
Vrať výsledek jako validní JSON objekt.
`;
  }
}