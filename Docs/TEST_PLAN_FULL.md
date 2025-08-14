## EduAI Školní Portál – Kompletní testovací plán

### Cíl a rozsah
- **Cíl**: Systematicky prověřit celé řešení (FE/BE/DB) tak, aby bylo možné rychle odhalit chyby, zapsat je a prioritizovat opravy.
- **Rozsah**: Funkční testy, E2E scénáře, nefunkční domény (výkon, přístupnost, bezpečnost), regresní sada, smoke testy a sanity kontroly po release.

### Předpoklady a prostředí
- **Repo**: `skolni_portal` (monorepo `frontend` + `backend` + `Docs`).
- **Min. nástroje**: Node 18+, pnpm/npm, PostgreSQL 14+, Docker (volitelně), Playwright (`npx playwright install`).
- **Env**:
  - Backend: vyplnit `backend/env.example` → `.env` (DB, JWT, flagy `ENABLE_COMPRESSION`, `ENABLE_LOGGER`, rate-limit, atd.).
  - Frontend: `frontend/env.example` → `.env` (API base URL), `public/config.js` dle `API_CONFIGURATION.md`.
- **Start lokálně**:
  - Backend: `cd backend && npm i && npm run db:migrate && npm run dev`.
  - Frontend: `cd frontend && npm i && npm run dev` nebo `npm run build && npm run preview`.
- **Data/seed**:
  - `backend/src/database/init.ts` / `reset.ts` podle potřeby.
  - Volitelně demo notifikace: `npm run db:add-notifications-demo` (backend).
- **Testovací účty** (role):
  - `platform_admin`, `school_admin`, `teacher_school`, `teacher_individual`.
  - Přístupové údaje z dev seedů nebo vytvořit ručně přes API/DB.

### Navigační mapa funkcí (kontrolní checklist)
- **Auth**: registrace, login, profil, změna hesla, logout, obnova profilu na fokus okna.
- **RBAC**: přístup ke stránkám a akcím dle role (403/skrývání UI).
- **Dashboard**: načtení, přehledy, notifikace (dropdown + panel), polling.
- **Chat/AI**: odesílání zpráv, šablony, slash-commands, hlasový vstup (pokud dostupné), SSE streaming fallback, toasty chyb.
- **Materiály**: generování, seznam, detail, sdílení, složky, export PDF/DOCX, stavy chyb.
- **Upload/OCR**: validace typu/velikosti, OCR jazyk, zpracování a chybové stavy.
- **Notifikace**: list, mark-as-read, prázdné stavy, severity.
- **Nastavení**: téma, přístupnost (reduced motion), klávesové zkratky (konflikty, reset, perzistence).
- **Přístupnost**: klávesová navigace, aria, kontrast, focus management.
- **Výkon**: FCP/DCL metriky, velikost bundle, lazy-load/Code-splitting.
- **Bezpečnost**: rate-limit, validace vstupů, hlavičky, CORS, JWT expirace.
- **Observabilita**: logger, metriky, health-check.

### Testovací data a scénáře (detailní postupy)

#### 1) Autentizace a relace
1. Registrace nového uživatele (pokud je veřejná) a ověřit validace vstupů.
2. Login platnými údaji, uložený token a `user` v `localStorage` (FE), 401 pro špatné heslo.
3. Profil (`GET /api/auth/profile`): načtení po loginu a po obnovení okna (window focus).
4. Změna hesla (happy path + chybové stavy: slabé heslo, špatné staré heslo).
5. Logout: vymazání stavu, přesměrování, ochrana privátních stránek.
6. Chybové toasty: jednotná funkce `errorToMessage` a 402 → `InsufficientCreditsError`.
7. Rate-limit na auth routách: po mnoha pokusech vrací příslušnou chybu.

Očekávané výsledky:
- Po loginu jsou privátní stránky dostupné, na neprivátní 401/redirect.
- Profil se refetchuje při focusu okna a UI zobrazuje aktualizované kredity.

#### 2) RBAC a přístupy
Pro každou roli otestovat:
1. Přístup na `Dashboard`, `Chat`, `Materials`, admin stránky (Developer/School admin).
2. Skrytí tlačítek/akcí, na BE 403 pokud se klient pokusí o zakázanou akci.
3. Navigační prvky v `Header` odpovídají roli.

#### 3) Dashboard a notifikace
1. Načtení dashboardu (light/dark) bez JS chyb.
2. Notifikační zvonek: otevření dropdownu, zobrazení seznamu/empty state.
3. `Mark as read` → volání `PUT /api/notifications/:id/read`, UI aktualizace.
4. Polling (pokud aktivní) → periodické aktualizace bez blikání UI.

#### 4) Chat a AI nástroje
1. Odeslání zprávy, zobrazení bublin, stav „během generování“.
2. SSE streaming: postupný přenos; fallback pro ne-SSE prostředí.
3. Šablony/Slash-commands: vložení promptu, validace vstupů.
4. Hlasový vstup: povolení mikrofonu, fallback bez povolení.
5. Chybové stavy (síť, 402 kredity) → toast, beze crash.

#### 5) Materiály a exporty
1. Vytvoření materiálu, zobrazení v „Moje materiály“.
2. Detail materiálu: náhled, metadata, sdílení (create link/remove).
3. Složky: CRUD, přesun materiálů.
4. Export PDF: diakritika (TTF fonty registrovány), název souboru, nevalidní DOM → toast.
5. Export DOCX: stažení, obsahuje základní texty.

#### 6) Upload a OCR
1. Povolené přípony a velikost (validace klient/BE), chybové hlášky.
2. OCR: výběr jazyka (cs/en), doba zpracování, stavová hláška.
3. Bezpečnost: sanitizace názvů, odmítnutí nebezpečných typů.

#### 7) Nastavení a klávesové zkratky
1. Téma světlo/tma + perzistence v `localStorage`.
2. `prefers-reduced-motion` → bez animací a auto-rotací.
3. Klávesové zkratky: otevření modalu, změna, konflikt, reset, funkčnost (Ctrl/Cmd+L, Ctrl/Cmd+Enter, Ctrl/Cmd+/ …).

#### 8) Přístupnost (A11y)
1. Klávesová navigace (Tab/Shift+Tab), viditelný focus, focus trap v modal.
2. Role/aria-labels na ikonách (notifikace, zkratky, export).
3. Kontrast textů a interaktivních prvků.

#### 9) Výkon a stabilita
1. FCP/DCL pod limitem (Playwright perf test) s tolerancí pro lokální běh.
2. Lazy-load a code-splitting: PDF/Charts chunking dle `vite.config.ts`.
3. CSS purge a velikost bundle, žádné masivní console.log v prod.

#### 10) Bezpečnostní kontroly
1. Rate-limit parametrizace funguje (env), odpovědi bez nadbytečných detailů.
2. JWT expirace a podvržené tokeny → 401.
3. Validace vstupů (server): auth, upload, AI vstupy.
4. CORS a bezpečnostní hlavičky (Nginx/FE proxy) dle `API_CONFIGURATION.md`.

#### 11) Observabilita a provoz
1. `/api/health` vrací 200 a základní info.
2. Logger morgan dle `ENABLE_LOGGER` a formátu.
3. Metriky/administrace (pokud zapnuté) – dostupnost jen oprávněným.

### Automatizace a nástroje
- Backend: `cd backend && npm run test:smoke`.
- Frontend E2E: `cd frontend && npm run build && npm run preview` a v druhém terminálu `npm run test`.
- Vždy po instalaci: `npx playwright install`.
- Stabilita E2E: využívat `addInitScript` pro seed přihlášení, `waitForSelector`, `networkidle` kde dává smysl.

### Regresní sada (rychlé smoke scénáře)
- Otevřít `/dashboard` (light/dark) a `/chat` (light/dark) – bez chyb a dle snapshotů.
- V chatu napsat zprávu a ověřit, že export PDF spustí stažení.
- Otevřít notifikace, označit jednu jako přečtenou.
- Ověřit, že profil se po fokus okna aktualizuje (kredity).

### Reportování chyb
- Pro každý defekt uveďte:
  - **ID/Title**
  - **Prostředí/Build**
  - **Kroky k reprodukci** (číslované)
  - **Očekávané vs. skutečné chování**
  - **Logy/screenshot/trace** (Playwright trace: `npx playwright show-trace <zip>`)
  - **Závažnost/Priorita**
  - **Návrh opravy** (pokud je zřejmý)

### Prioritizace nálezů
- P1: Bezpečnost, ztráta dat, blokující pád.
- P2: Hlavní funkce (auth, chat, export) nefunkční nebo silně degradované.
- P3: UI/UX vady, které neblokují kritickou cestu.
- P4: Drobná vylepšení, texty, vizuální odchylky.

### Stop podmínky a akceptace
- Všechny P1/P2 uzavřeny, P3 má workaround, P4 odsouhlaseny k pozdějšímu řešení.
- Green běh smoke a E2E sad na CI a lokálně.

### Přílohy/Reference
- `Docs/implementation_plan.md`, `Docs/design_guidelines.md`, `Docs/workflow.md`.
- `frontend/API_CONFIGURATION.md`, `README.md` – poznámky k nasazení a zdraví.


