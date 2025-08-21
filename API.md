# EduAI-Asistent API Dokumentace

## 📄 Základní informace

**Base URL:**
- **Local:** `http://localhost:3001/api`
- **Production:** Nastavte `FRONTEND_URL` a použijte váš nasazený backend origin
- **Health Check:** `GET /api/health`

**Autentifikace:**
- Všechny chráněné endpointy používají header: `Authorization: Bearer <JWT>`
- Token získáte přihlášením nebo registrací
- Tokeny expirují za 7 dní (konfigurovatelné přes `JWT_EXPIRES_IN`)

---

## 🔑 Autentifikace

### Registrace školy
```http
POST /api/auth/register-school
```
**Body:**
```json
{
  "school": {
    "name": "ZŠ Praha",
    "city": "Praha", 
    "address": "Ulice 1",
    "postal_code": "11000",
    "contact_email": "admin@skola.cz"
  },
  "admin": {
    "email": "admin@skola.cz",
    "password": "admin12345",
    "first_name": "Jan",
    "last_name": "Novák"
  }
}
```
**Response:** `201` → `{ success: true, data: { user, token } }`

### Registrace učitele
```http
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@x.cz",
  "password": "secret123",
  "first_name": "Eva",
  "last_name": "Malá"
}
```
**Response:** `201` → `{ success: true, data: { user, token } }`

### Přihlášení
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@x.cz",
  "password": "secret123"
}
```
**Response:** `200` → `{ success: true, data: { user, token } }`

### Profil uživatele
```http
GET /api/auth/profile
```
**Response:** `200` → `{ success: true, data: userWithSchool }`

### Aktualizace profilu
```http
PUT /api/auth/profile
```
**Body (částečné):**
```json
{
  "first_name": "Eva"
}
```
**Response:** `200` → `{ success: true, data: user }`

### Změna hesla
```http
PUT /api/auth/change-password
```
**Body:**
```json
{
  "current_password": "old",
  "new_password": "newStrong123"
}
```
**Response:** `200` → `{ success: true }`

### Přidání kreditů
```http
POST /api/auth/me/add-credits
```
**Response:** `200` → `{ success: true, data: { user, credits_added } }`

---

## 🏫 Školy (role: school_admin)

### Informace o škole
```http
GET /api/schools/:schoolId
PUT /api/schools/:schoolId
```

**PUT Body (částečné):**
```json
{
  "name": "Nový název",
  "address": "Nová adresa",
  "city": "Nové město",
  "postal_code": "12000",
  "contact_email": "nova@skola.cz",
  "contact_phone": "+420123456789"
}
```

### Správa učitelů
```http
GET /api/schools/:schoolId/teachers
POST /api/schools/:schoolId/teachers
DELETE /api/schools/:schoolId/teachers/:userId
```

**POST Body:**
```json
{
  "email": "ucitel@skola.cz",
  "first_name": "Petr",
  "last_name": "Svoboda",
  "password": "heslo123"
}
```

### Správa kreditů školy
```http
POST /api/schools/:schoolId/add-credits
POST /api/schools/:schoolId/allocate-credits
GET /api/schools/:schoolId/credit-allocation
GET /api/schools/:schoolId/credit-stats
```

**POST /add-credits Body:**
```json
{
  "amount": 1000,
  "description": "Měsíční balíček"
}
```

**POST /allocate-credits Body:**
```json
{
  "teacherId": "uuid",
  "amount": 100,
  "description": "Bonus za aktivitu"
}
```

---

## 💬 Konverzace

### Seznam konverzací
```http
GET /api/conversations?limit=50&offset=0
```

### Získání konverzace
```http
GET /api/conversations/:id
```

### Vytvoření konverzace
```http
POST /api/conversations
```
**Body:**
```json
{
  "title": "Nová konverzace",
  "assistant_type": "math_assistant"
}
```

### Aktualizace konverzace
```http
PUT /api/conversations/:id
```
**Body:**
```json
{
  "title": "Nový název"
}
```

### Smazání konverzace
```http
DELETE /api/conversations/:id
```

### Přidání zprávy
```http
POST /api/conversations/:id/messages
```
**Body:**
```json
{
  "role": "user",
  "content": "Obsah zprávy"
}
```

**Poznámka:** Live chat používá streaming AI endpoint níže a ukládá zprávy, když je poskytnut `conversation_id`.

---

## 🤖 AI Generátory

### AI Chat (Server-Sent Events stream)
```http
POST /api/ai/chat
```
**Headers:** `Accept: text/event-stream`
**Body:**
```json
{
  "message": "string",
  "session_id": "string?",
  "conversation_id": "string?"
}
```

**Stream události (jedna na řádek s prefixem `data: `):**
```json
{ "type": "start", "message": "..." }
{ "type": "chunk", "content": "částečný text" }
{ "type": "end", "credits_used": 1, "credits_balance": 999, "session_id": "..." }
{ "type": "error", "message": "..." }
```

### AI Funkce
```http
GET /api/ai/features
```
**Response:** Dostupné asistenti

### AI Statistiky
```http
GET /api/ai/stats
```
**Response:** Statistiky použití pro aktuálního uživatele

### Generování pracovního listu (SSE stream)
```http
POST /api/ai/generate-worksheet
```
**Body:**
```json
{
  "topic": "Pythagorova věta"
}
```
**Stream končí:** `{ "type": "end", "worksheet": {...}, "credits_used": 2, "credits_balance": ... }`

### Generování plánu hodiny
```http
POST /api/ai/generate-lesson-plan
```
**Body:**
```json
{
  "title": "Název hodiny",
  "subject": "Matematika",
  "grade_level": "6. třída"
}
```

### Generování kvízu
```http
POST /api/ai/generate-quiz
```
**Body:**
```json
{
  "topic": "Téma kvízu",
  "question_count": 10,
  "time_limit": "20 min"
}
```

### Generování projektu
```http
POST /api/ai/generate-project
```
**Body:**
```json
{
  "title": "Název projektu",
  "subject": "Fyzika",
  "duration": "2 týdny"
}
```

### Generování prezentace
```http
POST /api/ai/generate-presentation
```
**Body:**
```json
{
  "title": "Název prezentace",
  "subject": "Dějepis",
  "slide_count": 10
}
```

### Generování aktivity
```http
POST /api/ai/generate-activity
```
**Body:**
```json
{
  "title": "Název aktivity",
  "subject": "Biologie",
  "duration": "45 min"
}
```

### Dávkové generování
```http
POST /api/ai/generate-batch
```
**Body:**
```json
{
  "materials": [
    { "type": "worksheet", "topic": "Téma 1" },
    { "type": "lesson_plan", "title": "Plán 1" }
  ]
}
```

### Analýza zadání
```http
POST /api/ai/analyze-assignment
```
**Body:**
```json
{
  "content": "Obsah zadání pro analýzu"
}
```

### Návrh typů materiálů
```http
POST /api/ai/suggest-material-types
```
**Body:**
```json
{
  "topic": "Téma pro návrh"
}
```

---

## 📁 Soubory (Vygenerované)

### Seznam souborů
```http
GET /api/files?limit=50&offset=0&file_type=worksheet
```

### Statistiky souborů
```http
GET /api/files/stats
```

### Získání souboru
```http
GET /api/files/:id
```

### Smazání souboru
```http
DELETE /api/files/:id
```

### AI vyhledávání
```http
GET /api/files/search/ai?q=vyhledávaný text
```

### Doporučení
```http
GET /api/files/recommendations
```

### Analýza obsahu
```http
GET /api/files/analytics/content
```

### Kategorizované soubory
```http
GET /api/files/categorized
```

### Aktualizace AI metadat
```http
PUT /api/files/:id/ai-metadata
```
**Body:**
```json
{
  "category": "matematika",
  "difficulty": "střední",
  "tags": ["geometrie", "pythagorova věta"]
}
```

---

## 📂 Složky

### Seznam složek
```http
GET /api/folders
```

### Hierarchie složek
```http
GET /api/folders/hierarchy
```

### Sdílené složky školy
```http
GET /api/folders/shared/:schoolId
```

### Vytvoření složky
```http
POST /api/folders
```
**Body:**
```json
{
  "name": "Název složky",
  "parent_id": "uuid?",
  "description": "Popis složky"
}
```

### Aktualizace složky
```http
PUT /api/folders/:folderId
```
**Body:**
```json
{
  "name": "Nový název",
  "description": "Nový popis"
}
```

### Smazání složky
```http
DELETE /api/folders/:folderId
```

### Materiály ve složce
```http
GET /api/folders/:folderId/materials
```

### Přesun materiálů
```http
POST /api/folders/:folderId/move-materials
```
**Body:**
```json
{
  "material_ids": ["uuid1", "uuid2"]
}
```

---

## 🔄 Sdílené materiály

### Sdílení materiálu
```http
POST /api/shared-materials/share
```
**Body:**
```json
{
  "material_id": "uuid",
  "school_id": "uuid",
  "visibility": "school_only"
}
```

### Procházení sdílených materiálů
```http
GET /api/shared-materials/browse
```

### Materiály mé školy
```http
GET /api/shared-materials/my-school
```

### Materiály konkrétní školy
```http
GET /api/shared-materials/school/:schoolId
```

### Debug informace
```http
GET /api/shared-materials/debug/all
```

### Mé sdílené materiály
```http
GET /api/shared-materials/my-shared
```

### Zrušení sdílení
```http
DELETE /api/shared-materials/unshare/:materialId
```

### Nastavení sdílení
```http
PUT /api/shared-materials/:materialId/settings
```
**Body:**
```json
{
  "visibility": "public",
  "allow_download": true,
  "allow_comments": false
}
```

### Vyhledávání
```http
GET /api/shared-materials/search/:schoolId?q=text
```

### Statistiky školy
```http
GET /api/shared-materials/stats/:schoolId
```

### Statistiky komunity
```http
GET /api/shared-materials/community-stats
```

### Nejlepší přispěvatelé
```http
GET /api/shared-materials/top-contributors
```

### Lajkování
```http
POST /api/shared-materials/:id/like
```

### Stažení
```http
POST /api/shared-materials/:id/download
```

### Sdílení
```http
POST /api/shared-materials/:id/share
```

### Zobrazení
```http
POST /api/shared-materials/:id/view
```

---

## 📤 Upload

### Nahrání obrázku
```http
POST /api/upload/image
```
**Body:** `multipart/form-data` s polem `image`

### OCR zpracování
```http
POST /api/upload/ocr/process
```
**Body:**
```json
{
  "image_url": "url obrázku",
  "language": "ces"
}
```

---

## 📬 Notifikace

### Seznam notifikací
```http
GET /api/notifications
```

### Označení jako přečtené
```http
PUT /api/notifications/:id/read
```

---

## 👥 Uživatelé

### Informace o přihlášeném uživateli
```http
GET /api/users/me
```
**Response:** `{ success: true, data: { id, name, email, credits, createdAt } }`

---

## 👨‍💼 Admin (role: platform_admin)

**Base:** `/api/admin` (všechny vyžadují `Authorization: Bearer` a `platform_admin` roli)

### Uživatelé
```http
GET /api/admin/users?limit=&offset=&role=&school_id=&q=
```
**Response:** `200` → `{ success: true, data: { data: User[], total, limit, offset } }`

```http
PUT /api/admin/users/:id
```
**Body:** `{ role?, is_active? }`
**Response:** `200` → `{ success: true, data: User }`

```http
POST /api/admin/users/:id/credits
```
**Body:** `{ type: 'add'|'deduct', amount: number, description?: string }`
**Response:** `200` → `{ success: true, data: CreditTransaction }`

### Školy
```http
GET /api/admin/schools?limit=&offset=&q=
```
**Response:** `200` → `{ success: true, data: { data: School[], total, limit, offset } }`

### Systém
```http
GET /api/admin/system/health
```
**Response:** `{ success: true, data: { status, process:{uptime_s,memory,node}, db:{roundtrip_ms, ok} } }`

```http
GET /api/admin/system/metrics
```
**Response:** `{ success: true, data: { total_requests, avg_response_ms, error_count_by_status, started_at } }`

### Audit
```http
GET /api/admin/audit-logs?from=&to=&user_id=&path=&limit=&offset=
```
**Response:** `200` → `{ success: true, data: { data: AuditLog[], total, limit, offset } }`

### Moderování
```http
GET /api/admin/moderation/queue?status=pending&limit=&offset=
```

```http
POST /api/admin/moderation/:id/decision
```
**Body:** `{ status: 'approved'|'rejected', notes?: string, quality_score?: number }`

### Kvalita
```http
GET /api/admin/quality/metrics
```
**Response:** `{ success: true, data: { counts, avg_overall, by_type, trends:{d7,d30} } }`

### Analýza kreditů
```http
GET /api/admin/credits/analytics
```
**Response:** `{ success: true, data: { totals: { balance, purchased, used }, monthly: { purchases[], usage[] }, top_users[], top_schools[] } }`

### Předplatná
```http
GET /api/admin/subscriptions?user_id=
POST /api/admin/subscriptions
PUT /api/admin/subscriptions/:id
DELETE /api/admin/subscriptions/:id
```

**POST/PUT Body:**
```json
{
  "user_id": "uuid",
  "plan_type": "basic",
  "credits_per_month": 100,
  "price_per_month": 9.99,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "auto_renew": true
}
```

### Feature Flagy
```http
GET /api/admin/feature-flags
PUT /api/admin/feature-flags/:key
```
**PUT Body:** `{ value: boolean, description?: string }`

### Dev nástroje
```http
GET /api/admin/docs
```
**Response:** Souhrn endpointů

```http
GET /api/admin/ping
```
**Response:** `{ success: true, data: { pong: true } }`

---

## 🔒 Autentifikace a CORS

- **Bearer JWT** v `Authorization` headeru
- **CORS** je otevřený v produkci, omezený v developmentu na `FRONTEND_URL` a lokální porty

---

## ❌ Chyby

**Formát chyb:**
```json
{
  "success": false,
  "error": "Popis chyby",
  "details": "volitelné detaily"
}
```

---

## 🚦 Rate limiting

- **100 požadavků / 15 minut** na IP adresu (výchozí)
- Konfigurovatelné přes environment proměnné:
  - `RATE_LIMIT_WINDOW_MS=900000`
  - `RATE_LIMIT_MAX_REQUESTS=100`

---

## 💰 Kreditní systém

- **Výchozí kredity:** 100 (konfigurovatelné přes `DEFAULT_CREDITS`)
- **Cena za požadavek:** 1 kredit (konfigurovatelné přes `CREDIT_COST_PER_REQUEST`)
- **Různé ceny pro různé typy materiálů:**
  - Pracovní list: 1 kredit
  - Obrázky: 3 kredity
  - Prezentace: 2 kredity
  - Plán hodiny: 1 kredit

---

## 📊 Environment proměnné

**Povinné:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `OPENAI_API_KEY`

**Volitelné:**
- `NODE_ENV=production`
- `PORT=3001`
- `FRONTEND_URL=https://your-domain.com`
- `BCRYPT_ROUNDS=12`
- `LOG_LEVEL=info`

---

## 📊 Celkový přehled

**Celkem API endpointů: 89**

- **Autentifikace:** 7
- **AI Generátory:** 12
- **Školy:** 12
- **Soubory:** 12
- **Složky:** 8
- **Konverzace:** 6
- **Sdílené materiály:** 16
- **Upload:** 2
- **Notifikace:** 2
- **Uživatelé:** 1
- **Admin:** 21
- **Systémové:** 2

Všechny endpointy jsou chráněny autentifikací (kromě health check) a podporují standardní HTTP metody (GET, POST, PUT, DELETE).


