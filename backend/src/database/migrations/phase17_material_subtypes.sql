-- Phase 17: Material Subtypes and Enhanced Generation
-- Add material subtypes table and enhanced generation features

-- Enable required extensions for GIN indexes
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create material_subtypes table
CREATE TABLE IF NOT EXISTS material_subtypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_type VARCHAR(50) NOT NULL CHECK (parent_type IN ('worksheet', 'lesson-plan', 'quiz', 'project', 'presentation', 'activity')),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    special_fields JSONB DEFAULT '[]',
    prompt_modifications JSONB DEFAULT '[]',
    validation_rules JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add enhanced generation columns to generated_files table
ALTER TABLE generated_files 
ADD COLUMN IF NOT EXISTS assignment_description TEXT,
ADD COLUMN IF NOT EXISTS assignment_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS material_subtype_id UUID REFERENCES material_subtypes(id),
ADD COLUMN IF NOT EXISTS quality_score JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS generation_parameters JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content_structure JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS educational_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS scaffolding_elements JSONB DEFAULT '[]';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_material_subtypes_parent_type ON material_subtypes(parent_type);
CREATE INDEX IF NOT EXISTS idx_material_subtypes_name ON material_subtypes(name);
CREATE INDEX IF NOT EXISTS idx_material_subtypes_active ON material_subtypes(is_active);

CREATE INDEX IF NOT EXISTS idx_generated_files_subtype_id ON generated_files(material_subtype_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_assignment_analysis ON generated_files USING GIN(assignment_analysis);
CREATE INDEX IF NOT EXISTS idx_generated_files_quality_score ON generated_files USING GIN(quality_score);
CREATE INDEX IF NOT EXISTS idx_generated_files_educational_metadata ON generated_files USING GIN(educational_metadata);

-- Add unique constraint for subtype names within parent type
CREATE UNIQUE INDEX IF NOT EXISTS ux_material_subtypes_parent_name 
ON material_subtypes(parent_type, name) 
WHERE is_active = true;

-- Add trigger for updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_material_subtypes_updated_at'
  ) THEN
    CREATE TRIGGER update_material_subtypes_updated_at 
      BEFORE UPDATE ON material_subtypes
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default material subtypes
INSERT INTO material_subtypes (parent_type, name, description, special_fields, prompt_modifications) VALUES
-- Worksheet subtypes
('worksheet', 'Cvičné úlohy', 'Strukturované cvičení pro procvičování nových dovedností', 
 '[
   {"name": "problemTypes", "type": "multiselect", "label": "Typy úloh", "options": ["výpočty", "slovní úlohy", "aplikace"], "required": false},
   {"name": "scaffoldingLevel", "type": "select", "label": "Úroveň podpory", "options": ["minimální", "střední", "vysoké"], "required": false, "defaultValue": "střední"}
 ]',
 '[
   {"type": "prepend", "content": "Zaměř se na postupné zvyšování obtížnosti úloh."},
   {"type": "append", "content": "Poskytni jasné kroky řešení pro první úlohy a zahrň různé typy problémů pro komplexní pochopení."}
 ]'),

('worksheet', 'Domácí úkol', 'Samostatná práce pro upevnění učiva doma',
 '[
   {"name": "timeEstimate", "type": "select", "label": "Odhadovaný čas", "options": ["15 min", "30 min", "45 min", "60 min"], "required": false, "defaultValue": "30 min"},
   {"name": "parentGuidance", "type": "boolean", "label": "Zahrnout pokyny pro rodiče", "required": false, "defaultValue": false}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř úlohy vhodné pro samostatnou práci doma bez přímé pomoci učitele."},
   {"type": "append", "content": "Zahrň jasné instrukce a očekávané výsledky. Pokud je požadováno, přidej tipy pro rodiče, jak pomoci."}
 ]'),

('worksheet', 'Kontrolní práce', 'Hodnotící worksheet pro ověření znalostí',
 '[
   {"name": "pointSystem", "type": "select", "label": "Bodový systém", "options": ["1 bod za úlohu", "váhované body", "procenta"], "required": false, "defaultValue": "1 bod za úlohu"},
   {"name": "timeLimit", "type": "select", "label": "Časový limit", "options": ["20 min", "30 min", "45 min", "bez limitu"], "required": false, "defaultValue": "45 min"}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř hodnotící materiál s jasným bodovým systémem a různými úrovněmi obtížnosti."},
   {"type": "append", "content": "Zajisti spravedlivé rozložení obtížnosti a jasné hodnotící kritéria."}
 ]'),

('worksheet', 'Opakování', 'Shrnutí a opakování probraného učiva',
 '[
   {"name": "coveragePeriod", "type": "select", "label": "Období k opakování", "options": ["poslední hodina", "poslední týden", "poslední měsíc", "celé pololetí"], "required": false, "defaultValue": "poslední týden"},
   {"name": "reviewStyle", "type": "select", "label": "Styl opakování", "options": ["přehledné shrnutí", "smíšené úlohy", "postupné obtížnosti"], "required": false, "defaultValue": "smíšené úlohy"}
 ]',
 '[
   {"type": "prepend", "content": "Zaměř se na systematické opakování klíčových konceptů z určeného období."},
   {"type": "append", "content": "Kombinuj různé typy úloh a zajisti pokrytí všech důležitých témat."}
 ]'),

-- Quiz subtypes
('quiz', 'Formativní hodnocení', 'Průběžné ověření porozumění během výuky',
 '[
   {"name": "questionMix", "type": "multiselect", "label": "Typy otázek", "options": ["multiple_choice", "true_false", "short_answer"], "required": false, "defaultValue": ["multiple_choice", "true_false"]},
   {"name": "immediateResults", "type": "boolean", "label": "Okamžité výsledky", "required": false, "defaultValue": true}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř kvíz pro průběžné ověření porozumění s důrazem na rychlou zpětnou vazbu."},
   {"type": "append", "content": "Otázky by měly být jasné a umožnit rychlé vyhodnocení pochopení klíčových konceptů."}
 ]'),

('quiz', 'Sumativní test', 'Komplexní hodnocení na konci učební jednotky',
 '[
   {"name": "comprehensiveness", "type": "select", "label": "Rozsah pokrytí", "options": ["základní koncepty", "všechny koncepty", "rozšířené aplikace"], "required": false, "defaultValue": "všechny koncepty"},
   {"name": "difficultyDistribution", "type": "select", "label": "Rozložení obtížnosti", "options": ["rovnoměrné", "více základních", "více pokročilých"], "required": false, "defaultValue": "rovnoměrné"}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř komplexní test pokrývající celou učební jednotku s vyvážeým rozložením obtížnosti."},
   {"type": "append", "content": "Zahrň otázky na různých kognitivních úrovních podle Bloomovy taxonomie."}
 ]'),

('quiz', 'Diagnostický test', 'Zjištění úrovně znalostí před začátkem výuky',
 '[
   {"name": "prerequisiteLevel", "type": "select", "label": "Úroveň předpokladů", "options": ["základní", "střední", "pokročilé"], "required": false, "defaultValue": "základní"},
   {"name": "adaptiveQuestions", "type": "boolean", "label": "Přizpůsobivé otázky", "required": false, "defaultValue": false}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř diagnostický test pro zjištění vstupní úrovně znalostí žáků."},
   {"type": "append", "content": "Zaměř se na identifikaci mezer ve znalostech a silných stránek žáků."}
 ]'),

-- Lesson Plan subtypes
('lesson-plan', 'Úvodní hodina', 'Představení nového tématu nebo konceptu',
 '[
   {"name": "motivationStrategy", "type": "select", "label": "Motivační strategie", "options": ["problémová situace", "zajímavý fakt", "praktický příklad", "hra"], "required": false, "defaultValue": "praktický příklad"},
   {"name": "priorKnowledge", "type": "text", "label": "Navazující znalosti", "required": false}
 ]',
 '[
   {"type": "prepend", "content": "Zaměř se na motivaci žáků a aktivaci předchozích znalostí."},
   {"type": "append", "content": "Zajisti jasné představení nového tématu s propojením na známé koncepty."}
 ]'),

('lesson-plan', 'Procvičovací hodina', 'Upevnění a procvičení nových dovedností',
 '[
   {"name": "practiceTypes", "type": "multiselect", "label": "Typy procvičování", "options": ["řízené cvičení", "samostatná práce", "skupinová práce", "párová práce"], "required": false, "defaultValue": ["řízené cvičení", "samostatná práce"]},
   {"name": "feedbackFrequency", "type": "select", "label": "Frekvence zpětné vazby", "options": ["průběžně", "po každé úloze", "na konci"], "required": false, "defaultValue": "průběžně"}
 ]',
 '[
   {"type": "prepend", "content": "Zaměř se na systematické procvičování s postupným přechodem k samostatnosti."},
   {"type": "append", "content": "Poskytuj pravidelnou zpětnou vazbu a možnosti pro diferenciaci."}
 ]'),

('lesson-plan', 'Shrnutí a opakování', 'Systematické opakování a upevnění učiva',
 '[
   {"name": "reviewScope", "type": "select", "label": "Rozsah opakování", "options": ["poslední hodina", "celý týden", "celá kapitola", "celé pololetí"], "required": false, "defaultValue": "celá kapitola"},
   {"name": "reviewMethods", "type": "multiselect", "label": "Metody opakování", "options": ["myšlenková mapa", "kvíz", "diskuse", "praktické úlohy"], "required": false, "defaultValue": ["myšlenková mapa", "praktické úlohy"]}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř systematické opakování s využitím různých metod pro upevnění učiva."},
   {"type": "append", "content": "Zahrň aktivní zapojení žáků a možnosti pro sebehodnocení."}
 ]'),

-- Project subtypes
('project', 'Výzkumný projekt', 'Samostatný výzkum na zvolené téma',
 '[
   {"name": "researchScope", "type": "select", "label": "Rozsah výzkumu", "options": ["lokální", "národní", "mezinárodní"], "required": false, "defaultValue": "lokální"},
   {"name": "sourcesRequired", "type": "number", "label": "Minimální počet zdrojů", "required": false, "defaultValue": 5}
 ]',
 '[
   {"type": "prepend", "content": "Zaměř se na rozvoj výzkumných dovedností a kritického myšlení."},
   {"type": "append", "content": "Poskytni jasné pokyny pro vyhledávání a hodnocení zdrojů."}
 ]'),

('project', 'Kreativní projekt', 'Tvůrčí práce s důrazem na originalitu',
 '[
   {"name": "outputFormat", "type": "multiselect", "label": "Formát výstupu", "options": ["prezentace", "poster", "model", "video", "webová stránka"], "required": false, "defaultValue": ["prezentace"]},
   {"name": "collaborationLevel", "type": "select", "label": "Úroveň spolupráce", "options": ["individuální", "párová", "skupinová"], "required": false, "defaultValue": "individuální"}
 ]',
 '[
   {"type": "prepend", "content": "Podporuj kreativitu a originalitu při zachování vzdělávacích cílů."},
   {"type": "append", "content": "Poskytni flexibilní možnosti pro vyjádření a prezentaci výsledků."}
 ]'),

-- Presentation subtypes
('presentation', 'Výukové slidy', 'Prezentace pro výklad nového učiva',
 '[
   {"name": "slideCount", "type": "select", "label": "Počet slidů", "options": ["5-10", "10-15", "15-20", "20+"], "required": false, "defaultValue": "10-15"},
   {"name": "interactiveElements", "type": "multiselect", "label": "Interaktivní prvky", "options": ["otázky", "kvízy", "diskusní body", "aktivity"], "required": false, "defaultValue": ["otázky"]}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř jasně strukturovanou prezentaci s logickým postupem výkladu."},
   {"type": "append", "content": "Zahrň interaktivní prvky pro udržení pozornosti a ověření porozumění."}
 ]'),

('presentation', 'Studentská prezentace', 'Šablona pro prezentace žáků',
 '[
   {"name": "presentationTime", "type": "select", "label": "Délka prezentace", "options": ["5 min", "10 min", "15 min", "20 min"], "required": false, "defaultValue": "10 min"},
   {"name": "evaluationCriteria", "type": "multiselect", "label": "Hodnotící kritéria", "options": ["obsah", "struktura", "prezentační dovednosti", "vizuální zpracování"], "required": false, "defaultValue": ["obsah", "struktura"]}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř šablonu, která pomůže žákům strukturovat jejich prezentaci."},
   {"type": "append", "content": "Poskytni jasné pokyny a hodnotící kritéria pro úspěšnou prezentaci."}
 ]'),

-- Activity subtypes
('activity', 'Zahřívací aktivita', 'Krátká aktivita na začátek hodiny',
 '[
   {"name": "duration", "type": "select", "label": "Délka aktivity", "options": ["5 min", "10 min", "15 min"], "required": false, "defaultValue": "10 min"},
   {"name": "energyLevel", "type": "select", "label": "Úroveň energie", "options": ["klidná", "střední", "aktivní"], "required": false, "defaultValue": "střední"}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř krátkou aktivitu pro aktivaci pozornosti a motivaci žáků."},
   {"type": "append", "content": "Zaměř se na propojení s tématem hodiny a vytvoření pozitivní atmosféry."}
 ]'),

('activity', 'Skupinová práce', 'Kolaborativní aktivita pro týmovou práci',
 '[
   {"name": "groupSize", "type": "select", "label": "Velikost skupin", "options": ["2-3 žáci", "4-5 žáků", "6+ žáků"], "required": false, "defaultValue": "4-5 žáků"},
   {"name": "roleAssignment", "type": "boolean", "label": "Přidělit role", "required": false, "defaultValue": true}
 ]',
 '[
   {"type": "prepend", "content": "Navrhni aktivitu podporující spolupráci a komunikaci mezi žáky."},
   {"type": "append", "content": "Definuj jasné role a odpovědnosti pro efektivní týmovou práci."}
 ]'),

('activity', 'Experimentální aktivita', 'Praktické zkoumání a experimenty',
 '[
   {"name": "safetyLevel", "type": "select", "label": "Úroveň bezpečnosti", "options": ["základní", "střední", "vysoká"], "required": false, "defaultValue": "základní"},
   {"name": "materialsComplexity", "type": "select", "label": "Složitost materiálů", "options": ["jednoduché", "střední", "pokročilé"], "required": false, "defaultValue": "jednoduché"}
 ]',
 '[
   {"type": "prepend", "content": "Vytvoř bezpečnou experimentální aktivitu s jasným vzdělávacím cílem."},
   {"type": "append", "content": "Zahrň bezpečnostní pokyny a očekávané výsledky experimentu."}
 ]')

ON CONFLICT (parent_type, name) WHERE is_active = true DO NOTHING;