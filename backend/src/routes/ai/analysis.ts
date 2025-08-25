import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../middleware/auth';
import { validateBody } from '../../middleware/zodValidation';
import { AssignmentAnalysisSchema, AnalysisResultSchema } from '../../schemas/ai';

import { sendSSEMessage, setupSSEHeaders } from '../../services/ai-generation/sse-utils';
import { AIService } from '../../services/AIService';

/**
 * Create analysis routes with AIService injection
 */
export default function createAnalysisRoutes(aiService: AIService): Router {
  const router = Router();

  // Analyze assignment endpoint
  router.post('/analyze-assignment',
    authenticateToken,
    validateBody(AssignmentAnalysisSchema),
    async (req: RequestWithUser, res: Response) => {
      try {
        setupSSEHeaders(res);
        
        const { description } = req.body;
        
        sendSSEMessage(res, { type: 'chunk', content: 'Analyzuji zadání...\n' });
        
        const analysisPrompt = `Analyzuj následující zadání a poskytni doporučení pro vytvoření výukových materiálů.

Zadání: ${description}

Poskytni analýzu v JSON formátu:
{
  "suggestedMaterialTypes": ["worksheet", "quiz", "lesson-plan", "project", "presentation", "activity"],
  "extractedObjectives": ["výukové cíle"],
  "detectedDifficulty": "Začátečník/Střední/Pokročilé",
  "subjectArea": "detekovaný předmět",
  "estimatedDuration": "odhadovaná délka",
  "keyTopics": ["klíčová témata"],
  "confidence": 0.85
}

Odpovídej pouze v JSON formátu bez dalšího textu.`;
        
        // Use AIService for analysis
        let analysisResponse = '';
        const analysisResult = await aiService.streamChat({
          message: analysisPrompt,
          userId: req.user!.id,
          sessionId: (req as any).sessionID,
          metadata: {
            user_role: req.user!.role
          }
        }, (chunk) => {
          if (chunk.content) {
            analysisResponse += chunk.content;
            sendSSEMessage(res, { type: 'chunk', content: chunk.content });
          }
        });
        
        if (!analysisResult.success) {
          sendSSEMessage(res, { type: 'error', message: analysisResult.error || 'Chyba při analýze zadání' });
          res.end();
          return;
        }
        
        // Parse and validate the response
        let analysisData;
        try {
          const cleanedResponse = analysisResponse.trim();
          const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse analysis JSON:', parseError);
          sendSSEMessage(res, { type: 'error', message: 'The analysis response could not be parsed.' });
          res.end();
          return;
        }
        
        sendSSEMessage(res, { 
          type: 'end', 
          data: {
            analysis: analysisData,
            suggestions: []
          },
          credits_used: 0,
          credits_balance: 0,
          metadata: analysisResult.metadata
        });
        res.end();
        
      } catch (error) {
        console.error('Assignment analysis error:', error);
        sendSSEMessage(res, { 
          type: 'error', 
          message: error instanceof Error ? error.message : 'An unexpected error occurred' 
        });
        res.end();
      }
    }
  );

  // Suggest material types endpoint
  router.post('/suggest-material-types',
    authenticateToken,
    validateBody(AnalysisResultSchema),
    async (req: RequestWithUser, res: Response) => {
      try {
        const { analysis } = req.body;
        
        const suggestionPrompt = `Na základě analýzy zadání doporuč nejvhodnější typy výukových materiálů.

Obtížnost: ${analysis.detectedDifficulty}
Klíčová témata: ${analysis.keyTopics.join(', ')}
Výukové cíle: ${analysis.extractedObjectives.join(', ')}
Předmět: ${analysis.subjectArea}

Doporuč materiály v JSON formátu:
{
  "suggestions": [
    {
      "type": "worksheet",
      "description": "proč je vhodný",
      "estimatedCredits": 5,
      "confidence": 0.8,
      "priority": 1,
      "reasoning": "podrobné vysvětlení",
      "recommendedSubtype": "practice-problems"
    }
  ]
}

Odpovídej pouze v JSON formátu bez dalšího textu.`;
        
        // Use AIService for material suggestions
        const suggestionResult = await aiService.chat({
          message: suggestionPrompt,
          userId: req.user!.id,
          sessionId: (req as any).sessionID,
          metadata: {
            user_role: req.user!.role
          }
        });
        
        if (!suggestionResult.success) {
          res.status(500).json({
            success: false,
            error: suggestionResult.error || 'Chyba při generování doporučení'
          });
          return;
        }
        
        const suggestionResponse = suggestionResult.content || '';
        
        // Parse and validate the response
        let suggestionData;
        try {
          const cleanedResponse = suggestionResponse.trim();
          const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            suggestionData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse suggestion JSON:', parseError);
          res.status(500).json({
            success: false,
            error: 'The suggestion response could not be parsed.'
          });
          return;
        }
        
        res.json({
          success: true,
          data: suggestionData.suggestions || [],
          metadata: suggestionResult.metadata
        });
        
      } catch (error) {
        console.error('Material suggestion error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    }
  );

  return router;
}
