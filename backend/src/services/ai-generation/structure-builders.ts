/**
 * Structure builders for different material types
 * These functions provide fallback structures when AI responses are malformed
 */

/**
 * Construct basic project structure from raw AI response
 */
export function constructBasicProjectStructure(rawResponse: string): string {
  // Extract title from response
  const titleMatch = rawResponse.match(/title["\s]*:["\s]*"([^"]+)"/i) || 
                    rawResponse.match(/název["\s]*:["\s]*"([^"]+)"/i) ||
                    rawResponse.match(/projekt["\s]*:["\s]*"([^"]+)"/i);
  
  const title = titleMatch ? titleMatch[1] : 'Projekt';

  // Extract subject from response
  const subjectMatch = rawResponse.match(/subject["\s]*:["\s]*"([^"]+)"/i) ||
                      rawResponse.match(/předmět["\s]*:["\s]*"([^"]+)"/i);
  
  const subject = subjectMatch ? subjectMatch[1] : 'Obecný';

  return JSON.stringify({
    template: "project",
    title: title,
    subject: subject,
    grade_level: "9. ročník",
    duration: "2 týdny",
    project_type: "výzkumný projekt",
    group_size: 1,
    objectives: ["Cíl 1", "Cíl 2", "Cíl 3"],
    description: "Základní popis projektu",
    phases: ["Přípravná fáze", "Realizační fáze", "Prezentační fáze"],
    deliverables: ["Prezentace", "Dokumentace"],
    rubric: {
      criteria: [
        {
          name: "Obsah",
          weight: 0.4,
          levels: ["Nedostatečný", "Dostatečný", "Dobrý", "Výborný"],
          descriptors: [
            "Výborně (4): Obsah splněn na vysoké úrovni",
            "Dobře (3): Obsah splněn s drobnými nedostatky",
            "Dostatečně (2): Obsah splněn základně",
            "Nedostatečně (1): Obsah nesplněn nebo s velkými nedostatky"
          ]
        },
        {
          name: "Prezentace",
          weight: 0.3,
          levels: ["Nedostatečný", "Dostatečný", "Dobrý", "Výborný"],
          descriptors: [
            "Výborně (4): Prezentace je jasná a profesionální",
            "Dobře (3): Prezentace je srozumitelná",
            "Dostatečně (2): Prezentace je základní",
            "Nedostatečně (1): Prezentace není srozumitelná"
          ]
        },
        {
          name: "Originalita",
          weight: 0.3,
          levels: ["Nedostatečný", "Dostatečný", "Dobrý", "Výborný"],
          descriptors: [
            "Výborně (4): Vysoce originální přístup",
            "Dobře (3): Originální prvky",
            "Dostatečně (2): Základní originalita",
            "Nedostatečně (1): Chybí originalita"
          ]
        }
      ]
    },
    timeline: {
      milestones: [
        {"task": "Výběr tématu a plán", "week": 1},
        {"task": "Výzkum a sběr dat", "week": 2}
      ]
    },
    tags: [subject?.toLowerCase() || "obecný", "projekt"]
  });
}

/**
 * Construct basic presentation structure from raw AI response
 */
export function constructBasicPresentationStructure(rawResponse: string): string {
  // Extract title from response
  const titleMatch = rawResponse.match(/title["\s]*:["\s]*"([^"]+)"/i) || 
                    rawResponse.match(/název["\s]*:["\s]*"([^"]+)"/i) ||
                    rawResponse.match(/prezentace["\s]*:["\s]*"([^"]+)"/i);
  
  const title = titleMatch ? titleMatch[1] : 'Prezentace';

  // Extract subject from response
  const subjectMatch = rawResponse.match(/subject["\s]*:["\s]*"([^"]+)"/i) ||
                      rawResponse.match(/předmět["\s]*:["\s]*"([^"]+)"/i);
  
  const subject = subjectMatch ? subjectMatch[1] : 'Obecný';

  return JSON.stringify({
    template: "presentation",
    title: title,
    subject: subject,
    grade_level: "9. ročník",
    slides: [
      {
        slideNumber: 1,
        heading: "Úvod",
        bullets: ["Bod 1", "Bod 2", "Bod 3"],
        estimatedTime: "2 minuty",
        visualSuggestions: "Obrázek nebo graf",
        transitionSuggestion: "Fade in"
      },
      {
        slideNumber: 2,
        heading: "Hlavní obsah",
        bullets: ["Klíčový bod 1", "Klíčový bod 2", "Klíčový bod 3"],
        estimatedTime: "5 minut",
        visualSuggestions: "Diagram nebo tabulka",
        transitionSuggestion: "Slide transition"
      },
      {
        slideNumber: 3,
        heading: "Závěr",
        bullets: ["Shrnutí", "Závěrečné myšlenky"],
        estimatedTime: "2 minuty",
        visualSuggestions: "Závěrečný obrázek",
        transitionSuggestion: "Fade out"
      }
    ],
    speakerNotes: "Poznámky pro přednášejícího k jednotlivým slidům",
    visualSuggestions: "Celkové návrhy vizuálních prvků pro prezentaci",
    tags: [subject?.toLowerCase() || "obecný", "prezentace"]
  });
}

/**
 * Construct basic activity structure from raw AI response
 */
export function constructBasicActivityStructure(rawResponse: string): string {
  // Extract title from response
  const titleMatch = rawResponse.match(/title["\s]*:["\s]*"([^"]+)"/i) || 
                    rawResponse.match(/název["\s]*:["\s]*"([^"]+)"/i) ||
                    rawResponse.match(/aktivita["\s]*:["\s]*"([^"]+)"/i);
  
  const title = titleMatch ? titleMatch[1] : 'Aktivita';

  // Extract subject from response
  const subjectMatch = rawResponse.match(/subject["\s]*:["\s]*"([^"]+)"/i) ||
                      rawResponse.match(/předmět["\s]*:["\s]*"([^"]+)"/i);
  
  const subject = subjectMatch ? subjectMatch[1] : 'Obecný';

  return JSON.stringify({
    template: "activity",
    title: title,
    subject: subject,
    grade_level: "9. ročník",
    duration: "45 minut",
    goal: "Cíl aktivity",
    instructions: ["Krok 1", "Krok 2", "Krok 3"],
    materials: ["Materiál 1", "Materiál 2"],
    group_size: 4,
    assessment_criteria: ["Kritérium 1", "Kritérium 2"],
    variation: "Varianta pro různé úrovně obtížnosti",
    safety_notes: "Bezpečnostní poznámky pro aktivitu",
    structuredInstructions: {
      preparation: ["Příprava 1", "Příprava 2"],
      execution: ["Provedení 1", "Provedení 2"],
      conclusion: ["Závěr 1", "Závěr 2"]
    },
    tags: [subject?.toLowerCase() || "obecný", "aktivita"]
  });
}

/**
 * Generic structure builder for any material type
 */
export function constructGenericStructure(
  materialType: string, 
  rawResponse: string, 
  title: string = 'Materiál',
  subject: string = 'Obecný'
): string {
  // Extract more information from the raw response
  const extractedTitle = extractTitleFromResponse(rawResponse) || title;
  const extractedSubject = extractSubjectFromResponse(rawResponse) || subject;
  
  // For worksheets, provide a proper structure with questions
  if (materialType === 'worksheet') {
    return JSON.stringify({
      title: extractedTitle,
      subject: extractedSubject,
      grade_level: "9. ročník",
      instructions: "Vyřešte následující úlohy. Pečlivě čtěte zadání a zapisujte své odpovědi do vyhrazených míst.",
      questions: [
        {
          problem: "Vytvořte kvadratickou rovnici ve tvaru ax² + bx + c = 0, kde a ≠ 0.",
          answer: "Příklad: x² - 5x + 6 = 0",
          type: "calculation"
        },
        {
          problem: "Vyřešte kvadratickou rovnici x² - 4x + 3 = 0 pomocí rozkladu na součin.",
          answer: "x² - 4x + 3 = (x - 1)(x - 3) = 0\nx₁ = 1, x₂ = 3",
          type: "calculation"
        },
        {
          problem: "Určete diskriminant kvadratické rovnice 2x² + 3x - 1 = 0.",
          answer: "D = b² - 4ac = 3² - 4·2·(-1) = 9 + 8 = 17",
          type: "calculation"
        },
        {
          problem: "Která z následujících rovnic má dva různé reálné kořeny?\na) x² + 2x + 1 = 0\nb) x² - 4 = 0\nc) x² + 1 = 0",
          answer: "b) x² - 4 = 0 (D = 16 > 0)",
          type: "multiple_choice"
        },
        {
          problem: "Slovní úloha: Obdélníková zahrada má obvod 20 metrů. Najděte rozměry zahrady s největší možnou plochou.",
          answer: "Největší plochu má čtverec: a = b = 5m, S = 25m²",
          type: "word_problem"
        }
      ],
      tags: [extractedSubject.toLowerCase(), "kvadratické rovnice", "výpočet", "slovní úlohy", "střední škola"]
    });
  }
  
  // For other material types, provide basic structure
  const baseStructure = {
    template: materialType,
    title: extractedTitle,
    subject: extractedSubject,
    grade_level: "9. ročník",
    tags: [extractedSubject.toLowerCase(), materialType]
  };

  return JSON.stringify(baseStructure);
}

/**
 * Extract title from raw AI response
 */
export function extractTitleFromResponse(rawResponse: string): string {
  const titleMatch = rawResponse.match(/title["\s]*:["\s]*"([^"]+)"/i) || 
                    rawResponse.match(/název["\s]*:["\s]*"([^"]+)"/i) ||
                    rawResponse.match(/title["\s]*:["\s]*'([^']+)'/i) ||
                    rawResponse.match(/název["\s]*:["\s]*'([^']+)'/i);
  
  return titleMatch?.[1] || 'Materiál';
}

/**
 * Extract subject from raw AI response
 */
export function extractSubjectFromResponse(rawResponse: string): string {
  const subjectMatch = rawResponse.match(/subject["\s]*:["\s]*"([^"]+)"/i) ||
                      rawResponse.match(/předmět["\s]*:["\s]*"([^"]+)"/i) ||
                      rawResponse.match(/subject["\s]*:["\s]*'([^']+)'/i) ||
                      rawResponse.match(/předmět["\s]*:["\s]*'([^']+)'/i);
  
  return subjectMatch?.[1] || 'Obecný';
}
