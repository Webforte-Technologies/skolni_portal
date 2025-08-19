import { GeneratedFileModel } from '../models/GeneratedFile';
import { UserModel } from '../models/User';
import { CreditTransactionModel } from '../models/CreditTransaction';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { createCanvas, loadImage } from 'canvas';

interface MaterialGenerationRequest {
  userId: string;
  activityId: string;
  materialTypes: ('pdf' | 'images' | 'presentation' | 'worksheet_pdf')[];
  content: any;
  options: {
    includeImages: boolean;
    generateVisuals: boolean;
    createPresentationSlides: boolean;
    exportFormats: string[];
  };
}

interface GeneratedMaterial {
  id: string;
  type: string;
  filename: string;
  path: string;
  size: number;
  metadata: any;
}

export class MaterialGenerationService {
  private openai: OpenAI;
  private uploadsDir: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  async generateMaterials(request: MaterialGenerationRequest): Promise<GeneratedMaterial[]> {
    const user = await UserModel.findById(request.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check credits (different costs for different material types)
    const creditsRequired = this.calculateCreditsRequired(request.materialTypes);
    if ((user.credits_balance ?? 0) < creditsRequired) {
      throw new Error('Insufficient credits');
    }

    const generatedMaterials: GeneratedMaterial[] = [];

    try {
      // Generate each requested material type
      for (const materialType of request.materialTypes) {
        const material = await this.generateMaterialByType(materialType, request);
        generatedMaterials.push(material);
      }

      // Deduct credits after successful generation
      await CreditTransactionModel.deductCredits(
        request.userId,
        creditsRequired,
        `Material generation: ${request.materialTypes.join(', ')}`
      );

      // Update the original generated file with material references
      await this.linkMaterialsToActivity(request.activityId, generatedMaterials);

      return generatedMaterials;
    } catch (error) {
      // Clean up any partially generated files
      await this.cleanupGeneratedFiles(generatedMaterials);
      throw error;
    }
  }

  private async generateMaterialByType(
    materialType: string, 
    request: MaterialGenerationRequest
  ): Promise<GeneratedMaterial> {
    switch (materialType) {
      case 'pdf':
        return await this.generatePDF(request);
      case 'images':
        return await this.generateImages(request);
      case 'presentation':
        return await this.generatePresentation(request);
      case 'worksheet_pdf':
        return await this.generateWorksheetPDF(request);
      default:
        throw new Error(`Unsupported material type: ${materialType}`);
    }
  }

  private async generatePDF(request: MaterialGenerationRequest): Promise<GeneratedMaterial> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Generate HTML content from the activity data
      const htmlContent = this.generateHTMLFromContent(request.content);
      
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Generate PDF
      const filename = `material_${request.activityId}_${Date.now()}.pdf`;
      const filePath = path.join(this.uploadsDir, filename);
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      const stats = await fs.stat(filePath);

      return {
        id: `pdf_${Date.now()}`,
        type: 'pdf',
        filename,
        path: filePath,
        size: stats.size,
        metadata: {
          format: 'A4',
          pages: await this.getPDFPageCount(filePath),
          generated_at: new Date().toISOString()
        }
      };
    } finally {
      await browser.close();
    }
  }

  private async generateImages(request: MaterialGenerationRequest): Promise<GeneratedMaterial> {
    const images: string[] = [];
    
    // Generate images based on content
    if (request.options.generateVisuals) {
      // Use AI to generate relevant images
      const imagePrompts = this.extractImagePromptsFromContent(request.content);
      
      for (const prompt of imagePrompts.slice(0, 3)) { // Limit to 3 images
        try {
          const response = await this.openai.images.generate({
            model: 'dall-e-3',
            prompt: `Educational illustration for Czech students: ${prompt}. Simple, clear, educational style.`,
            size: '1024x1024',
            quality: 'standard',
            n: 1,
          });

          if (response.data[0]?.url) {
            const imageUrl = response.data[0].url;
            const filename = `image_${request.activityId}_${Date.now()}_${images.length}.png`;
            const filePath = path.join(this.uploadsDir, filename);
            
            // Download and save the image
            await this.downloadImage(imageUrl, filePath);
            images.push(filename);
          }
        } catch (error) {
          console.warn('Failed to generate image:', error);
          // Continue with other images
        }
      }
    }

    // Generate simple diagrams/charts if needed
    const diagramImages = await this.generateDiagrams(request.content);
    images.push(...diagramImages);

    // Create a zip file with all images
    const zipFilename = `images_${request.activityId}_${Date.now()}.zip`;
    const zipPath = path.join(this.uploadsDir, zipFilename);
    
    await this.createImageZip(images, zipPath);
    
    const stats = await fs.stat(zipPath);

    return {
      id: `images_${Date.now()}`,
      type: 'images',
      filename: zipFilename,
      path: zipPath,
      size: stats.size,
      metadata: {
        image_count: images.length,
        formats: ['png'],
        generated_at: new Date().toISOString()
      }
    };
  }

  private async generatePresentation(request: MaterialGenerationRequest): Promise<GeneratedMaterial> {
    // Generate PowerPoint-compatible HTML presentation
    const slides = this.extractSlidesFromContent(request.content);
    const presentationHTML = this.generatePresentationHTML(slides);
    
    const filename = `presentation_${request.activityId}_${Date.now()}.html`;
    const filePath = path.join(this.uploadsDir, filename);
    
    await fs.writeFile(filePath, presentationHTML, 'utf-8');
    
    const stats = await fs.stat(filePath);

    return {
      id: `presentation_${Date.now()}`,
      type: 'presentation',
      filename,
      path: filePath,
      size: stats.size,
      metadata: {
        slide_count: slides.length,
        format: 'html',
        generated_at: new Date().toISOString()
      }
    };
  }

  private async generateWorksheetPDF(request: MaterialGenerationRequest): Promise<GeneratedMaterial> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Generate worksheet-specific HTML
      const worksheetHTML = this.generateWorksheetHTML(request.content);
      
      await page.setContent(worksheetHTML, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      const filename = `worksheet_${request.activityId}_${Date.now()}.pdf`;
      const filePath = path.join(this.uploadsDir, filename);
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      const stats = await fs.stat(filePath);

      return {
        id: `worksheet_${Date.now()}`,
        type: 'worksheet_pdf',
        filename,
        path: filePath,
        size: stats.size,
        metadata: {
          format: 'A4',
          pages: await this.getPDFPageCount(filePath),
          generated_at: new Date().toISOString()
        }
      };
    } finally {
      await browser.close();
    }
  }

  private generateHTMLFromContent(content: any): string {
    const title = content.title || 'Výukový materiál';
    const subject = content.subject || '';
    const gradeLevel = content.grade_level || '';

    let html = `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #4A90E2;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        h1 {
          color: #4A90E2;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #4A90E2;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .activity {
          background: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #4A90E2;
          margin: 15px 0;
        }
        .question {
          background: #fff;
          border: 1px solid #ddd;
          padding: 15px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .answer {
          color: #28a745;
          font-weight: bold;
          margin-top: 10px;
        }
        ul, ol {
          padding-left: 20px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="meta">
          ${subject && `<span>Předmět: ${subject}</span>`}
          ${gradeLevel && subject && ' • '}
          ${gradeLevel && `<span>Ročník: ${gradeLevel}</span>`}
        </div>
      </div>
    `;

    // Add content based on type
    if (content.objectives) {
      html += `
      <div class="section">
        <h2>Cíle hodiny</h2>
        <ul>
          ${content.objectives.map((obj: string) => `<li>${obj}</li>`).join('')}
        </ul>
      </div>
      `;
    }

    if (content.activities) {
      html += `
      <div class="section">
        <h2>Aktivity</h2>
        ${content.activities.map((activity: any) => `
          <div class="activity">
            <h3>${activity.name}</h3>
            <p><strong>Čas:</strong> ${activity.time}</p>
            ${activity.description && `<p>${activity.description}</p>`}
            ${activity.steps && `
              <h4>Kroky:</h4>
              <ol>
                ${activity.steps.map((step: string) => `<li>${step}</li>`).join('')}
              </ol>
            `}
            ${activity.outcome && `<p><strong>Očekávaný výsledek:</strong> ${activity.outcome}</p>`}
          </div>
        `).join('')}
      </div>
      `;
    }

    if (content.questions) {
      html += `
      <div class="section">
        <h2>Otázky a úkoly</h2>
        ${content.questions.map((question: any, index: number) => `
          <div class="question">
            <h4>Otázka ${index + 1}</h4>
            <p>${question.problem || question.question}</p>
            ${question.options && `
              <ul>
                ${question.options.map((option: string) => `<li>${option}</li>`).join('')}
              </ul>
            `}
            <div class="answer">Odpověď: ${question.answer}</div>
          </div>
        `).join('')}
      </div>
      `;
    }

    if (content.materials) {
      html += `
      <div class="section">
        <h2>Potřebné materiály</h2>
        <ul>
          ${content.materials.map((material: string) => `<li>${material}</li>`).join('')}
        </ul>
      </div>
      `;
    }

    html += `
      <div class="footer">
        <p>Vygenerováno pomocí EduAI-Asistent • ${new Date().toLocaleDateString('cs-CZ')}</p>
      </div>
    </body>
    </html>
    `;

    return html;
  }

  private generateWorksheetHTML(content: any): string {
    const title = content.title || 'Pracovní list';
    
    let html = `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.8;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #4A90E2;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        h1 {
          color: #4A90E2;
          margin-bottom: 10px;
          font-size: 24px;
        }
        .student-info {
          float: right;
          border: 1px solid #ddd;
          padding: 10px;
          margin-bottom: 20px;
          width: 250px;
        }
        .instructions {
          background: #f0f8ff;
          border: 1px solid #4A90E2;
          padding: 15px;
          margin-bottom: 30px;
          border-radius: 5px;
        }
        .question {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        .question-number {
          background: #4A90E2;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
        }
        .answer-space {
          border-bottom: 1px solid #ddd;
          min-height: 60px;
          margin-top: 15px;
        }
        .multiple-choice {
          margin: 10px 0;
        }
        .multiple-choice label {
          display: block;
          margin: 8px 0;
          cursor: pointer;
        }
        .multiple-choice input[type="radio"] {
          margin-right: 10px;
        }
        @media print {
          body { margin: 0; }
          .student-info { float: none; width: auto; }
        }
      </style>
    </head>
    <body>
      <div class="student-info">
        <strong>Jméno:</strong> ___________________<br>
        <strong>Třída:</strong> ___________________<br>
        <strong>Datum:</strong> __________________
      </div>
      
      <div class="header">
        <h1>${title}</h1>
      </div>
      
      ${content.instructions && `
      <div class="instructions">
        <h3>Pokyny:</h3>
        <p>${content.instructions}</p>
      </div>
      `}
      
      <div style="clear: both;"></div>
    `;

    if (content.questions) {
      content.questions.forEach((question: any, index: number) => {
        html += `
        <div class="question">
          <div style="display: flex; align-items: flex-start;">
            <div class="question-number">${index + 1}</div>
            <div style="flex: 1;">
              <p><strong>${question.problem || question.question}</strong></p>
              
              ${question.type === 'multiple_choice' && question.options ? `
                <div class="multiple-choice">
                  ${question.options.map((option: string, optIndex: number) => `
                    <label>
                      <input type="radio" name="q${index}" value="${String.fromCharCode(65 + optIndex)}">
                      ${String.fromCharCode(65 + optIndex)}) ${option}
                    </label>
                  `).join('')}
                </div>
              ` : `
                <div class="answer-space"></div>
              `}
            </div>
          </div>
        </div>
        `;
      });
    }

    html += `
    </body>
    </html>
    `;

    return html;
  }

  private generatePresentationHTML(slides: any[]): string {
    return `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prezentace</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background: #1a1a1a;
          color: white;
          overflow: hidden;
        }
        .presentation-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .slide {
          width: 90vw;
          height: 90vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          padding: 60px;
          box-sizing: border-box;
          display: none;
          flex-direction: column;
          justify-content: center;
        }
        .slide.active {
          display: flex;
        }
        .slide h1 {
          font-size: 3em;
          text-align: center;
          margin-bottom: 40px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .slide h2 {
          font-size: 2.5em;
          margin-bottom: 30px;
          color: #ffd700;
        }
        .slide ul {
          font-size: 1.8em;
          line-height: 1.6;
        }
        .slide li {
          margin-bottom: 20px;
        }
        .controls {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }
        .controls button {
          background: rgba(255,255,255,0.2);
          border: 2px solid white;
          color: white;
          padding: 10px 20px;
          margin: 0 10px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
        }
        .controls button:hover {
          background: rgba(255,255,255,0.4);
        }
        .slide-counter {
          position: fixed;
          top: 30px;
          right: 30px;
          background: rgba(0,0,0,0.5);
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 18px;
        }
      </style>
    </head>
    <body>
      <div class="presentation-container">
        ${slides.map((slide, index) => `
          <div class="slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <h2>${slide.heading}</h2>
            ${slide.bullets && slide.bullets.length > 0 ? `
              <ul>
                ${slide.bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="slide-counter">
        <span id="current-slide">1</span> / <span id="total-slides">${slides.length}</span>
      </div>
      
      <div class="controls">
        <button onclick="previousSlide()">← Předchozí</button>
        <button onclick="nextSlide()">Další →</button>
      </div>
      
      <script>
        let currentSlide = 0;
        const totalSlides = ${slides.length};
        
        function showSlide(n) {
          const slides = document.querySelectorAll('.slide');
          slides.forEach(slide => slide.classList.remove('active'));
          
          if (n >= totalSlides) currentSlide = 0;
          if (n < 0) currentSlide = totalSlides - 1;
          
          slides[currentSlide].classList.add('active');
          document.getElementById('current-slide').textContent = currentSlide + 1;
        }
        
        function nextSlide() {
          currentSlide++;
          showSlide(currentSlide);
        }
        
        function previousSlide() {
          currentSlide--;
          showSlide(currentSlide);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
          if (e.key === 'ArrowLeft') previousSlide();
        });
      </script>
    </body>
    </html>
    `;
  }

  private extractSlidesFromContent(content: any): any[] {
    if (content.slides) {
      return content.slides;
    }

    // Generate slides from other content types
    const slides = [];

    // Title slide
    slides.push({
      heading: content.title || 'Prezentace',
      bullets: [
        content.subject && `Předmět: ${content.subject}`,
        content.grade_level && `Ročník: ${content.grade_level}`,
        content.duration && `Doba trvání: ${content.duration}`
      ].filter(Boolean)
    });

    // Objectives slide
    if (content.objectives) {
      slides.push({
        heading: 'Cíle hodiny',
        bullets: content.objectives
      });
    }

    // Activities slides
    if (content.activities) {
      content.activities.forEach((activity: any) => {
        slides.push({
          heading: activity.name,
          bullets: [
            `Čas: ${activity.time}`,
            activity.description,
            ...(activity.steps || [])
          ].filter(Boolean)
        });
      });
    }

    return slides;
  }

  private extractImagePromptsFromContent(content: any): string[] {
    const prompts: string[] = [];
    
    // Extract prompts based on content
    if (content.title) {
      prompts.push(`Illustration showing ${content.title} concept`);
    }
    
    if (content.activities) {
      content.activities.forEach((activity: any) => {
        if (activity.name) {
          prompts.push(`Educational diagram for ${activity.name}`);
        }
      });
    }

    return prompts.slice(0, 3); // Limit to 3 prompts
  }

  private async generateDiagrams(content: any): Promise<string[]> {
    const diagrams: string[] = [];
    
    // Generate simple charts/diagrams using Canvas
    if (content.questions && content.questions.length > 0) {
      const chartFilename = `chart_${Date.now()}.png`;
      const chartPath = path.join(this.uploadsDir, chartFilename);
      
      await this.generateQuestionChart(content.questions, chartPath);
      diagrams.push(chartFilename);
    }

    return diagrams;
  }

  private async generateQuestionChart(questions: any[], outputPath: string): Promise<void> {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Simple bar chart showing question types
    const questionTypes = questions.reduce((acc: any, q) => {
      const type = q.type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const types = Object.keys(questionTypes);
    const counts = Object.values(questionTypes) as number[];
    const maxCount = Math.max(...counts);

    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 800, 400);

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Rozložení typů otázek', 400, 40);

    // Draw bars
    const barWidth = 600 / types.length;
    const barMaxHeight = 300;

    types.forEach((type, index) => {
      const count = questionTypes[type];
      const barHeight = (count / maxCount) * barMaxHeight;
      const x = 100 + index * barWidth;
      const y = 350 - barHeight;

      // Draw bar
      ctx.fillStyle = '#4A90E2';
      ctx.fillRect(x, y, barWidth - 20, barHeight);

      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(type, x + barWidth / 2, 370);
      
      // Draw count
      ctx.fillText(count.toString(), x + barWidth / 2, y - 10);
    });

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }

  private async downloadImage(url: string, outputPath: string): Promise<void> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
  }

  private async createImageZip(imageFilenames: string[], outputPath: string): Promise<void> {
    // Simple implementation - in production, use a proper zip library
    // For now, just create a JSON manifest
    const manifest = {
      images: imageFilenames,
      created_at: new Date().toISOString(),
      total_count: imageFilenames.length
    };
    
    await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
  }

  private async getPDFPageCount(filePath: string): Promise<number> {
    try {
      const buffer = await fs.readFile(filePath);
      const text = buffer.toString();
      const matches = text.match(/\/Type\s*\/Page[^s]/g);
      return matches ? matches.length : 1;
    } catch {
      return 1;
    }
  }

  private calculateCreditsRequired(materialTypes: string[]): number {
    const costs: { [key: string]: number } = {
      'pdf': 1,
      'images': 3, // Higher cost due to AI image generation
      'presentation': 2,
      'worksheet_pdf': 1
    };

    return materialTypes.reduce((total, type) => total + (costs[type] || 1), 0);
  }

  private async linkMaterialsToActivity(activityId: string, materials: GeneratedMaterial[]): Promise<void> {
    try {
      const materialRefs = materials.map(m => ({
        id: m.id,
        type: m.type,
        filename: m.filename,
        size: m.size,
        metadata: m.metadata
      }));

      await GeneratedFileModel.updateAIMetadata(activityId, {
        metadata: {
          generated_materials: materialRefs,
          generation_timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to link materials to activity:', error);
    }
  }

  private async cleanupGeneratedFiles(materials: GeneratedMaterial[]): Promise<void> {
    for (const material of materials) {
      try {
        await fs.unlink(material.path);
      } catch (error) {
        console.warn(`Failed to cleanup file ${material.path}:`, error);
      }
    }
  }
}

export default MaterialGenerationService;