import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, RequestWithUser } from '../middleware/auth';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { UserModel } from '../models/User';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { GeneratedFileModel } from '../models/GeneratedFile';
import OpenAI from 'openai';
import {
  WorksheetData,
  LessonPlanData,
  QuizData,
  ProjectData,
  PresentationData,
  ActivityData,
  SSEMessage,
  validateWorksheet,
  validateLessonPlan,
  validateQuiz,
  validateProject,
  validatePresentation,
  validateActivity
} from '../types/ai-generators';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

// High-quality system prompt for Czech Math Assistant
const SYSTEM_PROMPT = `Jsi trpělivý a přátelský matematický asistent pro české středoškolské studenty. Tvým úkolem je:

1. **Vysvětlovat matematické koncepty jasně a krok za krokem** - Používej jednoduchý jazyk a logické kroky
2. **Vždy odpovídej česky** - Používej českou matematickou terminologii
3. **Buď povzbuzující a pozitivní** - Motivuj studenty k učení
4. **Poskytuj praktické příklady** - Ukaž, jak se matematika používá v reálném světě
5. **Pomáhej s různými matematickými tématy** - Od základní aritmetiky po pokročilou matematiku
6. **Odpovídej na dotazy o všech předmětech** - Nejen matematika, ale i fyzika, chemie, biologie, dějepis, český jazyk

Při odpovídání:
- Používej "ty" formu pro přátelský tón
- Vysvětluj postupně a logicky
- Uváděj praktické příklady
- Buď trpělivý a povzbuzující
- Pokud nevíš odpověď, upřímně to řekni a nabídni pomoc s něčím jiným

Pamatuj: Jsi tu, abys pomohl českým studentům a učitelům s učením!`;

// Specialized system prompt for worksheet generation
const WORKSHEET_SYSTEM_PROMPT = `Jsi zkušený český učitel na střední škole. Tvým úkolem je vytvořit kvalitní cvičení pro studenty podle zadaných kritérií.

PRAVIDLA PRO VYTVÁŘENÍ CVIČENÍ:
1. **Vždy odpovídej v čistém JSON formátu** - Používej přesně tuto strukturu:
{
  "title": "Název cvičení",
  "instructions": "Instrukce pro studenty",
  "questions": [
    {
      "problem": "Zadání úlohy",
      "answer": "Správná odpověď"
    }
  ]
}

2. **Respektuj zadaný typ cvičení** - Pokud je specifikován typ cvičení (doplňování, přiřazování, křížovka, hledání slov, výpočty, analýza), vytvoř cvičení přesně podle tohoto typu
3. **Vytvoř požadovaný počet otázek** - Každá otázka by měla být jiná a testovat různé aspekty tématu
4. **Používej českou terminologii** - Všechny texty musí být v češtině
5. **Správné obtížnosti** - Otázky by měly být přiměřené středoškolské úrovni
6. **Praktické příklady** - Používej reálné situace a praktické aplikace
7. **Krok za krokem** - U složitějších úloh uveď postup řešení

TYPY CVIČENÍ:
- **Doplňování**: Vytvoř text s mezerami k doplnění (např. "Vzorec pro obsah kruhu je ___ = π × r²")
- **Přiřazování**: Vytvoř páry k přiřazení (např. termín-definice, vzorec-výpočet)
- **Křížovka**: Vytvoř křížovku s otázkami a mřížkou pro doplnění
- **Hledání slov**: Vytvoř text s ukrytými slovy k nalezení (např. v tabulce písmen)
- **Výpočty**: Vytvoř matematické úlohy k vyřešení s konkrétními čísly
- **Analýza**: Vytvoř úlohy vyžadující analýzu a interpretaci dat nebo textu

PAMATUJ: Pokud je specifikován typ cvičení, vytvoř cvičení přesně podle tohoto typu!

PAMATUJ: Odpověď musí být platný JSON bez dodatečného textu!`;

// Specialized system prompt for lesson plan generation (used below)
const LESSON_PLAN_SYSTEM_PROMPT: string = `Jsi zkušený český učitel. Vytvoř strukturovaný plán hodiny v čistém JSON formátu, přesně dle následující struktury a pravidel.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "title": "Název hodiny",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "45 min",
  "objectives": ["cíl 1", "cíl 2"],
  "materials": ["seznam materiálů"],
  "activities": [
    {
      "name": "Název aktivity",
      "description": "Stručný popis",
      "steps": ["krok 1", "krok 2"],
      "time": "10 min",
      "outcome": "Očekávaný výsledek aktivity"
    }
  ],
  "differentiation": "Úpravy pro slabší/silnější žáky",
  "homework": "Domácí úkol",
  "assessment": "Metody hodnocení"
}

KRITICKÉ POŽADAVKY PRO AKTIVITY:
- KAŽDÁ aktivita MUSÍ obsahovat: "name" (název), "time" (ve formátu "<N> min"), "outcome" (očekávaný výsledek)
- Hodnota "time" MUSÍ být přesně ve formátu "<číslo> min" (např. "15 min", "8 min")
- Součet všech hodnot activities[*].time (v minutách) MUSÍ přesně odpovídat hodnotě "duration" (v minutách)
- Pokud duration je "45 min", pak součet všech activities[*].time musí být přesně 45 minut

DALŠÍ POŽADAVKY:
- Vždy odpovídej česky
- Dbej na jasnost, přiměřenou obtížnost a praktické aktivity
- Výstup musí být platný JSON přesně dle struktury bez komentářů a bez vysvětlujícího textu.`;

// Specialized system prompt for quiz generation (used below)
const QUIZ_SYSTEM_PROMPT: string = `Jsi zkušený český učitel. Tvým úkolem je vytvořit kvíz v čistém JSON formátu s konkrétními otázkami.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "title": "Název kvízu",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "time_limit": "20 min",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "KONKRÉTNÍ OTÁZKA NA ZADANÉ TÉMA - NE ŠABLONA!",
      "options": ["Konkrétní možnost A", "Konkrétní možnost B", "Konkrétní možnost C", "Konkrétní možnost D"],
      "answer": "Konkrétní možnost B"
    },
    {
      "type": "true_false",
      "question": "KONKRÉTNÍ TVRZENÍ O ZADANÉM TÉMATU - NE ŠABLONA!",
      "answer": true
    },
    {
      "type": "short_answer",
      "question": "KONKRÉTNÍ OTÁZKA VYŽADUJÍCÍ KRÁTKOU ODPOVĚĎ - NE ŠABLONA!",
      "answer": "Konkrétní správná odpověď"
    }
  ]
}

KRITICKÉ POŽADAVKY:
- VŽDY vytvoř konkrétní otázky na zadané téma, ne šablony!
- Každá otázka musí být jiná a testovat různé aspekty tématu
- Použij směs typů otázek (multiple_choice, true_false, short_answer)
- Pro multiple_choice vytvoř 4 konkrétní možnosti (A, B, C, D)
- Pro true_false použij konkrétní tvrzení o daném tématu
- Pro short_answer vytvoř konkrétní otázky vyžadující krátkou odpověď
- Všechny otázky musí být v češtině a souviset se zadaným tématem
- Výstup musí být platný JSON bez dalšího textu nebo vysvětlení

PŘÍKLADY SPRÁVNÝCH OTÁZEK:
- ŠPATNĚ: "Otázka na dané téma?" (šablona)
- SPRÁVNĚ: "Jaký je chemický vzorec vody?" (konkrétní otázka)

- ŠPATNĚ: "Tvrzení o daném tématu" (šablona)  
- SPRÁVNĚ: "Voda se skládá ze dvou atomů vodíku a jednoho atomu kyslíku" (konkrétní tvrzení)

PAMATUJ: Vytvoř skutečné konkrétní otázky, ne šablony! Každá otázka musí testovat skutečné znalosti o zadaném tématu!`;

// Specialized system prompt for project generation
const PROJECT_SYSTEM_PROMPT: string = `Jsi zkušený český učitel. Vytvoř projektové zadání v čistém JSON formátu dle následující struktury a pravidel.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "template": "project",
  "title": "Název projektu",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "2 týdny",
  "objectives": ["cíl 1", "cíl 2"],
  "description": "Stručné zadání projektu",
  "deliverables": ["co mají odevzdat"],
  "rubric": [
    { "criteria": "kritérium", "levels": ["výborné", "dobré", "dostačující", "nedostačující"] }
  ]
}

POŽADAVKY:
- Vždy odpovídej česky
- Zaměř se na praktické výstupy a hodnoticí kritéria
- Výstup musí být platný JSON bez dalšího textu.`;

// Specialized system prompt for presentation outline generation
const PRESENTATION_SYSTEM_PROMPT: string = `Jsi zkušený český učitel. Vytvoř osnovu prezentace v čistém JSON formátu dle následující struktury a pravidel.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "template": "presentation",
  "title": "Název prezentace",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "slides": [
    { "heading": "Nadpis snímku", "bullets": ["bod", "bod", "bod"] }
  ]
}

POŽADAVKY:
- Vždy odpovídej česky
- Použij jasné, krátké body
- Výstup musí být platný JSON bez dalšího textu.`;

// Specialized system prompt for classroom activity generation
const ACTIVITY_SYSTEM_PROMPT: string = `Jsi zkušený český učitel. Vytvoř krátkou aktivitu do hodiny v čistém JSON formátu dle následující struktury a pravidel.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "title": "Název aktivity",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "10 min",
  "goal": "Cíl aktivity",
  "instructions": ["krok 1", "krok 2"],
  "materials": ["pomůcky"],
  "variation": "Obměna pro pokročilé/začátečníky"
}

POŽADAVKY:
- Vždy odpovídej česky
- Jasné kroky a časování
- Výstup musí být platný JSON bez dalšího textu.`;

// Read constants to satisfy TS noUnusedLocals in dev if routes are temporarily disabled
void PROJECT_SYSTEM_PROMPT;
void PRESENTATION_SYSTEM_PROMPT;
void ACTIVITY_SYSTEM_PROMPT;

// Validation middleware
// Simple tag derivation from user inputs/content
function deriveTags(...parts: Array<string | undefined>): string[] {
  const text = parts.filter(Boolean).join(' ').toLowerCase();
  const candidates = new Set<string>();
  const addIf = (word: string, cond: boolean) => { if (cond) candidates.add(word); };
  
  // Subject tags
  addIf('matematika', /mat(ematika)?|algebra|rovnic|geometri|zlomk|derivac|integrál|kvadratick|lineárn|trojúheln|kruh|kružnic|úhel|pravděpodobnost|statistik/.test(text));
  addIf('fyzika', /fyzik/.test(text));
  addIf('chemie', /chem/.test(text));
  addIf('biologie', /biolog/.test(text));
  addIf('dějepis', /dějepis|histor/.test(text));
  
  // Math subtopics
  addIf('algebra', /algebra|rovnic|lineárn|kvadratick/.test(text));
  addIf('geometrie', /geometri|trojúheln|kruh|kružnic|úhel/.test(text));
  addIf('pravděpodobnost', /pravděpodobnost|statistik/.test(text));
  addIf('zlomky', /zlomek|zlomk/.test(text));
  addIf('derivace', /derivac/.test(text));
  addIf('integrály', /integrál/.test(text));
  
  // Material types
  addIf('prezentace', /prezentac/.test(text));
  addIf('projekt', /projekt/.test(text));
  addIf('cvičení', /cvičení|pracovní.*list|worksheet/.test(text));
  
  // Difficulty tags
  addIf('snadné', /snadn|easy|lehk/.test(text));
  addIf('střední', /středn|medium|průměr/.test(text));
  addIf('náročné', /náročn|hard|těžk/.test(text));
  
  // Teaching style tags
  addIf('interaktivní', /interaktivn|interactive/.test(text));
  addIf('tradiční', /tradičnín|traditional/.test(text));
  addIf('projektová', /projektov|project.*based/.test(text));
  addIf('objevná', /objevná|discovery/.test(text));
  
  return Array.from(candidates).slice(0, 8);
}

// Utility function to send SSE messages
function sendSSEMessage(res: Response, message: SSEMessage): void {
  res.write(`data: ${JSON.stringify(message)}\n\n`);
}

// Utility function to escape content for SSE
function escapeSSEContent(content: string): string {
  return content.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Common generator function for all AI endpoints
async function generateAIContent<T>(
  req: RequestWithUser,
  res: Response,
  {
    systemPrompt,
    userPrompt,
    fileType,
    creditsRequired,
    validator,
    maxTokens = 2500,
    temperature = 0.3
  }: {
    systemPrompt: string;
    userPrompt: string;
    fileType: string;
    creditsRequired: number;
    validator: (data: any) => T;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<void> {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      sendSSEMessage(res, { type: 'error', message: 'User not found' });
      res.end();
      return;
    }

    if ((user.credits_balance ?? 0) < creditsRequired) {
      sendSSEMessage(res, { type: 'error', message: 'Insufficient credits' });
      res.end();
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send start message
    sendSSEMessage(res, { type: 'start', message: `Starting ${fileType} generation...` });

    // Call OpenAI API with streaming
    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || maxTokens.toString()),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || temperature.toString()),
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        sendSSEMessage(res, { type: 'chunk', content: escapeSSEContent(content) });
      }
    }

    // Parse and validate JSON response
    let validatedData: T;
    try {
      const parsedData = JSON.parse(fullResponse);
      validatedData = validator(parsedData);
    } catch (parseError) {
      console.error(`Failed to parse ${fileType} JSON:`, parseError);
      sendSSEMessage(res, { type: 'error', message: `The AI response could not be parsed as a valid ${fileType}.` });
      res.end();
      return;
    }

    // Save the generated file to the database
    let savedFile: any;
    try {
      savedFile = await GeneratedFileModel.create({
        user_id: req.user.id,
        title: (validatedData as any).title || `Generated ${fileType}`,
        content: JSON.stringify(validatedData),
        file_type: fileType
      });

      // Update AI metadata
      const tags = Array.isArray((validatedData as any).tags) && (validatedData as any).tags.length 
        ? (validatedData as any).tags 
        : deriveTags(
            (validatedData as any).title,
            (validatedData as any).subject,
            (validatedData as any).grade_level,
            (validatedData as any).description || (validatedData as any).goal,
            req.body.difficulty,
            req.body.teaching_style
          );

      await GeneratedFileModel.updateAIMetadata(savedFile.id, {
        metadata: { raw: fullResponse, prompt: systemPrompt },
        tags
      });
    } catch (saveError) {
      console.error(`Failed to save ${fileType} to database:`, saveError);
      sendSSEMessage(res, { type: 'error', message: `Failed to save ${fileType} to database` });
      res.end();
      return;
    }

    // Deduct credits after successful generation and save
    await CreditTransactionModel.deductCredits(
      req.user.id,
      creditsRequired,
      `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} generation`
    );
    
    const updatedUser = await UserModel.findById(req.user.id);

    // Send final response with metadata
    const endMessage: any = {
      type: 'end',
      file_id: savedFile?.id || '',
      file_type: fileType,
      credits_used: creditsRequired,
      credits_balance: updatedUser?.credits_balance || 0
    };
    endMessage[fileType] = validatedData;
    
    sendSSEMessage(res, endMessage);
    res.end();

  } catch (error) {
    console.error(`${fileType} generation error:`, error);
    sendSSEMessage(res, { 
      type: 'error', 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
    res.end();
  }
}
const validateChatMessage = [
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('session_id').optional().isUUID().withMessage('Invalid session ID format')
];

// Send message to AI assistant (live OpenAI implementation)
router.post('/chat', authenticateToken, validateChatMessage, async (req: RequestWithUser, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { message, session_id, conversation_id } = req.body;
    const userId = req.user.id;

    // Check if user has enough credits (1 credit per message)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const creditsRequired = 1;
    
    // Critical fix: Ensure user has > 0 credits before proceeding
    if (user.credits_balance <= 0) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        data: {
          credits_balance: user.credits_balance,
          credits_required: creditsRequired,
          message: 'You need at least 1 credit to use the AI assistant. Please add more credits to continue.'
        }
      });
    }
    
    if (user.credits_balance < creditsRequired) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        data: {
          credits_balance: user.credits_balance,
          credits_required: creditsRequired,
          message: `You have ${user.credits_balance} credits but need ${creditsRequired} credits for this request.`
        }
      });
    }

    // Deduct credits before starting the stream
    await CreditTransactionModel.deductCredits(
      userId, 
      creditsRequired, 
      `AI chat message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`
    );

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send initial response
    res.write('data: {"type":"start","message":"Starting AI response..."}\n\n');

    // Call OpenAI API with streaming
    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2000'),
      temperature: 0.7,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        // Send each chunk to the client
        res.write(`data: {"type":"chunk","content":"${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}\n\n`);
      }
    }

    // Get updated user balance
    const updatedUser = await UserModel.findById(userId);

    // Save messages to database if conversation_id is provided
    if (conversation_id) {
      try {
        // Save user message
        await MessageModel.create({
          conversation_id,
          role: 'user',
          content: message
        });

        // Save AI response
        await MessageModel.create({
          conversation_id,
          role: 'assistant',
          content: fullResponse
        });

        // Update conversation title if it's the first message
        const messageCount = await MessageModel.countByConversationId(conversation_id);
        if (messageCount <= 2) { // User message + AI response
          const conversation = await ConversationModel.findById(conversation_id);
          if (conversation && conversation.title === 'New Conversation') {
            // Create a title from the first user message
            const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
            await ConversationModel.updateTitle(conversation_id, title);
          }
        }
      } catch (dbError) {
        console.error('Failed to save messages to database:', dbError);
        // Don't fail the request if database save fails
      }
    }

    // Send final response with metadata
    res.write(`data: {"type":"end","credits_used":${creditsRequired},"credits_balance":${updatedUser?.credits_balance || 0},"session_id":"${session_id || ''}"}\n\n`);
    res.end();
    return;

  } catch (error) {
    console.error('AI chat error:', error);
    
    // Send error through stream
    res.write(`data: {"type":"error","message":"${error instanceof Error ? error.message : 'An unexpected error occurred'}"}\n\n`);
    res.end();
    return;
  }
});

// Get AI usage statistics
router.get('/stats', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;

    // Get user's AI usage statistics
    const totalCreditsUsed = await CreditTransactionModel.getTotalCreditsUsed(userId);
    const totalCreditsPurchased = await CreditTransactionModel.getTotalCreditsPurchased(userId);
    const user = await UserModel.findById(userId);

    return res.status(200).json({
      success: true,
      data: {
        total_messages: totalCreditsUsed,
        total_credits_purchased: totalCreditsPurchased,
        current_balance: user?.credits_balance || 0,
        average_cost_per_message: 1 // Fixed cost for MVP
      },
      message: 'AI usage statistics retrieved successfully'
    });

  } catch (error) {
    console.error('AI stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI usage statistics'
    });
  }
});

// Get available AI features (for future expansion)
router.get('/features', authenticateToken, async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'math_assistant',
          name: 'Matematický Asistent',
          description: 'Pomáhá s matematickými úlohami a vysvětluje matematické koncepty',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'physics_assistant',
          name: 'Fyzikální Asistent',
          description: 'Vysvětluje fyzikální zákony a pomáhá s fyzikálními úlohami',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'chemistry_assistant',
          name: 'Chemický Asistent',
          description: 'Pomáhá s chemickými výpočty a vysvětluje chemické procesy',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'biology_assistant',
          name: 'Biologický Asistent',
          description: 'Vysvětluje biologické procesy a pomáhá s biologickými tématy',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'history_assistant',
          name: 'Historický Asistent',
          description: 'Pomáhá s historickými fakty a vysvětluje historické události',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'language_assistant',
          name: 'Jazykový Asistent',
          description: 'Pomáhá s gramatikou a jazykovými pravidly',
          credits_per_use: 1,
          available: true
        }
      ],
      message: 'AI features retrieved successfully'
    });

  } catch (error) {
    console.error('AI features error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI features'
    });
  }
});

// Generate worksheet endpoint with streaming (validated JSON + metadata)
router.post('/generate-worksheet', authenticateToken, [
  body('topic').trim().isLength({ min: 3, max: 200 }).withMessage('Topic must be between 3 and 200 characters'),
  body('question_count').optional().isInt({ min: 5, max: 100 }),
  body('difficulty').optional().isString().isLength({ max: 20 }),
  body('teaching_style').optional().isString().isLength({ max: 50 }),
  body('exercise_types').optional().isArray(),
  body('include_answers').optional().isBoolean()
], async (req: RequestWithUser, res: Response) => {

  const { topic, question_count, difficulty, teaching_style, exercise_types, include_answers } = req.body;
  
  // Build exercise type description
  let exerciseTypeDescription = '';
  if (exercise_types && exercise_types.length > 0) {
    const exerciseTypeLabels = {
      'fill_blank': 'doplňování',
      'matching': 'přiřazování',
      'crossword': 'křížovka',
      'word_search': 'hledání slov',
      'calculation': 'výpočty',
      'analysis': 'analýza'
    };
    const selectedTypes = exercise_types.map((type: string) => exerciseTypeLabels[type as keyof typeof exerciseTypeLabels] || type);
    exerciseTypeDescription = `Typ cvičení: ${selectedTypes.join(', ')}. `;
  }
  
  const userPrompt = `Vytvoř cvičení na téma: ${topic}. ${question_count ? `Vytvoř ${question_count} otázek.` : 'Vytvoř 10 otázek.'} ${difficulty ? `Úroveň obtížnosti: ${difficulty}.` : ''} ${teaching_style ? `Preferovaný styl výuky: ${teaching_style}.` : ''} ${exerciseTypeDescription}${include_answers !== undefined ? (include_answers ? 'Zahrň řešení ke cvičením.' : 'Nezahrňuj řešení ke cvičením.') : ''}`;

  await generateAIContent<WorksheetData>(req, res, {
    systemPrompt: WORKSHEET_SYSTEM_PROMPT,
    userPrompt,
    fileType: 'worksheet',
    creditsRequired: 2,
    validator: validateWorksheet,
    maxTokens: 3000
  });
});

export default router;

// Generate lesson plan (streaming) with basic JSON validation and post-success deduction
router.post('/generate-lesson-plan', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level } = req.body;
  const userPrompt = `Vytvoř plán hodiny${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}. Dodrž předepsanou JSON strukturu.`;

  await generateAIContent<LessonPlanData>(req, res, {
    systemPrompt: LESSON_PLAN_SYSTEM_PROMPT,
    userPrompt,
    fileType: 'lesson_plan',
    creditsRequired: 2,
    validator: validateLessonPlan
  });

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      return;
    }
    if (!req.user) { res.status(401).json({ success: false, error: 'Authentication required' }); return; }

    const user = await UserModel.findById(req.user.id);
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
    const creditsRequired = 2;
    if ((user.credits_balance ?? 0) < creditsRequired) {
      res.status(402).json({ success: false, error: 'Insufficient credits' });
      return;
    }
    // Deduct after success

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('data: {"type":"start","message":"Starting lesson plan generation..."}\n\n');

    const { title, subject, grade_level } = req.body;
    const prompt = `Vytvoř plán hodiny${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}. Dodrž předepsanou JSON strukturu.`;

    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: LESSON_PLAN_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2500'),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
      stream: true,
    });

    let full = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        full += content;
        res.write(`data: {"type":"chunk","content":"${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}\n\n`);
      }
    }

    let data;
    try {
      data = JSON.parse(full);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
      if (!data.title || typeof data.title !== 'string') throw new Error('Invalid lesson_plan.title');
      if (!Array.isArray(data.activities)) throw new Error('Invalid lesson_plan.activities');
      
      // Enhanced validation for activities - require name, time, and outcome
      if (Array.isArray(data.activities)) {
        data.activities.forEach((a: any, index: number) => {
          if (!a || typeof a !== 'object') {
            throw new Error(`Activity ${index + 1}: Invalid activity object`);
          }
          if (!a.name || typeof a.name !== 'string') {
            throw new Error(`Activity ${index + 1}: Missing or invalid "name" field`);
          }
          if (!a.time || typeof a.time !== 'string') {
            throw new Error(`Activity ${index + 1}: Missing or invalid "time" field`);
          }
          if (!a.outcome || typeof a.outcome !== 'string') {
            throw new Error(`Activity ${index + 1}: Missing or invalid "outcome" field`);
          }
          // Validate time format is exactly "<N> min"
          const timeMatch = /^([0-9]+)\s*min$/.exec(a.time.trim());
          if (!timeMatch) {
            throw new Error(`Activity ${index + 1}: Time "${a.time}" must be in format "<N> min" (e.g., "15 min")`);
          }
        });
      }
      
      // Validate total time matches duration with improved error messages
      const durationStr: string = data.duration || '45 min';
      const durationMatch = /([0-9]+)\s*min/.exec(durationStr);
      const targetMinutes = durationMatch && durationMatch[1] ? parseInt(durationMatch[1] as string, 10) : 45;
      
      const sumMinutes = (data.activities || []).reduce((sum: number, a: any) => {
        const m = /([0-9]+)\s*min/.exec(String(a.time || '0'));
        return sum + (m && m[1] ? parseInt(m[1] as string, 10) : 0);
      }, 0);
      
      if (sumMinutes !== targetMinutes) {
        const activityTimes = data.activities.map((a: any) => `"${a.name}": ${a.time}`).join(', ');
        throw new Error(`Duration mismatch: Activities total ${sumMinutes} min but lesson duration is ${targetMinutes} min. Activities: [${activityTimes}]. Please ensure the sum of all activity times equals the lesson duration exactly.`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to parse lesson plan JSON';
      res.write(`data: {"type":"error","message":"${errorMessage.replace(/"/g, '\\"')}"}\n\n`);
      res.end();
      return;
    }

    const savedLesson = await GeneratedFileModel.create({
      user_id: req.user.id,
      title: data.title || 'Plán hodiny',
      content: JSON.stringify(data),
      file_type: 'lesson_plan'
    });
    try {
      await GeneratedFileModel.updateAIMetadata(savedLesson.id, {
        metadata: { raw: full, prompt: 'LESSON_PLAN_SYSTEM_PROMPT' },
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
    } catch {}

    await CreditTransactionModel.deductCredits(req.user.id, creditsRequired, 'Lesson plan generation');
    const updated = await UserModel.findById(req.user.id);
    res.write(`data: {"type":"end","lesson_plan":${JSON.stringify(data)},"file_id":"${savedLesson?.id || ''}","file_type":"lesson_plan","credits_used":${creditsRequired},"credits_balance":${updated?.credits_balance || 0}}\n\n`);
    res.end();
  } catch (error) {
    console.error('Lesson plan generation error:', error);
    res.write(`data: {"type":"error","message":"${error instanceof Error ? error.message : 'Unexpected error'}"}\n\n`);
    res.end();
  }
});

// Generate quiz (streaming) with validation and post-success deduction
router.post('/generate-quiz', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
  body('question_count').optional().isInt({ min: 5, max: 100 }),
  body('time_limit').optional().isString().isLength({ min: 1, max: 50 }),
  body('prompt_hint').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level, question_count, time_limit, prompt_hint } = req.body;
  const timeLimitPart = time_limit ? ` s časovým limitem ${time_limit}` : '';
  const hintPart = prompt_hint ? ` ${prompt_hint}` : '';
  const userPrompt = `Vytvoř kvíz${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}${question_count ? ` s počtem otázek ${question_count}` : ''}${timeLimitPart}${hintPart}. 

KRITICKÉ POŽADAVKY:
1. Vytvoř skutečné konkrétní otázky na dané téma, ne šablony!
2. Každá otázka musí testovat skutečné znalosti studentů o zadaném tématu
3. Použij různé typy otázek (multiple_choice, true_false, short_answer)
4. Pro multiple_choice vytvoř 4 konkrétní možnosti
5. Pro true_false použij konkrétní tvrzení o daném tématu
6. Pro short_answer vytvoř konkrétní otázky vyžadující krátkou odpověď

PŘÍKLADY:
- ŠPATNĚ: "Otázka na téma nerosty?" (šablona)
- SPRÁVNĚ: "Který nerost má chemický vzorec NaCl?" (konkrétní otázka)

Dodrž předepsanou JSON strukturu a vytvoř ${question_count || 10} různých konkrétních otázek.`;

  await generateAIContent<QuizData>(req, res, {
    systemPrompt: QUIZ_SYSTEM_PROMPT,
    userPrompt,
    fileType: 'quiz',
    creditsRequired: 2,
    validator: validateQuiz
  });
});

// Generate project (streaming) with validation and post-success deduction
router.post('/generate-project', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level, template_style } = req.body;
  const userPrompt = `Vytvoř projekt${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}. ${template_style === 'story' ? 'Preferuj příběhové zadání s kroky.' : 'Preferuj strukturované odrážky a jasná kritéria.'} Dodrž předepsanou JSON strukturu.`;

  await generateAIContent<ProjectData>(req, res, {
    systemPrompt: PROJECT_SYSTEM_PROMPT,
    userPrompt,
    fileType: 'project',
    creditsRequired: 2,
    validator: validateProject
  });
});

// Generate presentation (streaming) with validation and post-success deduction
router.post('/generate-presentation', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level, template_style } = req.body;
  const userPrompt = `Vytvoř osnovu prezentace${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}. ${template_style === 'story' ? 'Použij narativní flow se stručnými body.' : 'Použij jasné sekce a krátké odrážky.'} Dodrž předepsanou JSON strukturu.`;

  await generateAIContent<PresentationData>(req, res, {
    systemPrompt: PRESENTATION_SYSTEM_PROMPT,
    userPrompt,
    fileType: 'presentation',
    creditsRequired: 2,
    validator: validatePresentation,
    maxTokens: 2200
  });
});

// Generate classroom activity (streaming) with validation and post-success deduction
router.post('/generate-activity', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
  body('duration').optional().isLength({ min: 2, max: 20 }),
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level, duration } = req.body;
  const userPrompt = `Vytvoř krátkou aktivitu${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}${duration ? ` na dobu ${duration}` : ''}. Dodrž předepsanou JSON strukturu.`;

  await generateAIContent<ActivityData>(req, res, {
    systemPrompt: ACTIVITY_SYSTEM_PROMPT,
    userPrompt,
    fileType: 'activity',
    creditsRequired: 2,
    validator: validateActivity,
    maxTokens: 2000
  });
});