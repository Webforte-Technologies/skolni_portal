📋 Project Overview

Goal: Development of a robust and scalable MVP for the EduAI-Asistent platform. The plan is divided into two main parts: first, creating a functional application foundation (the "shell"), and second, integrating the finished AI assistant.

Technology: React (Vite), Node.js (Express.js), PostgreSQL, Tailwind CSS, TypeScript

Timeline: August 2025 - October 2025

PART 1: Application Foundation (MVP Shell)

Goal of this part: To have a fully functional web application where users can register, log in, see their credits, and interact with a chat interface. The assistant's response will be static (simulated) for now.

🎯 Phase 1: Project Foundation & Documentation

Timeline: Week 1
Status: ✅ Completed
Goal: Establish a solid project foundation, set up repositories, and define standards.

Tasks:
Jasně, pojďme tu první fázi rozebrat do naprosto konkrétních a proveditelných kroků. Upravil jsem plán tak, aby odrážel vaši volbu monorepa a zahrnoval vytvoření všech potřebných souborů a základní nastavení projektu.

Zde je nová, detailní verze Fáze 1.

🚀 Revised Implementation Plan – EduAI-Asistent MVP

(... zbytek dokumentu zůstává stejný ...)

🎯 Phase 1: Project Foundation & Environment Setup

Timeline: Week 1
Status: ✅ Completed
Goal: Establish a solid project foundation by setting up a monorepo, generating all necessary documentation, and bootstrapping the initial frontend and backend applications.

Tasks:

1.1: Repository & Project Structure

    [x] 1.1.1 Initialize Git Monorepo:

        Create a new, single repository on GitHub named EduAI-Asistent.

        Clone the repository to your local machine.

    [x] 1.1.2 Create Core Directories:

        Inside the root folder, create the main directories: frontend/, backend/, and docs/.

    [x] 1.1.3 Create Root README:

        Create a README.md file in the root directory explaining the monorepo structure and providing basic instructions on how to run the project.

1.2: Documentation Generation

    [x] 1.2.1 Create PRD:

        Inside the /docs folder, create PRD.md.

        Populate it with the project's purpose, target audience, MVP features, and milestones.

    [x] 1.2.2 Create Design Guidelines:

        Create /docs/design_guidelines.md.

        Define the visual style: Light Mode, primary color (#4A90E2), background (#F8F9FA), and typography (Inter font).

    [x] 1.2.3 Create Project Structure Document:

        Create /docs/project_structure.md.

        Formally describe the monorepo structure and the purpose of key files and folders within frontend/ and backend/.

    [x] 1.2.4 Create AI Context & Workflow Files:

        Create /docs/context.aisc and /docs/workflow.md to guide AI-assisted development in Cursor.

1.3: Backend Initial Setup (Node.js/Express)

    [x] 1.3.1 Initialize Node.js Project:

        Navigate into the backend/ directory.

        Run npm init -y to create a package.json file.

    [x] 1.3.2 Install Core Dependencies:

        Run npm install express dotenv cors.

    [x] 1.3.3 Install Dev Dependencies:

        Run npm install -D typescript ts-node nodemon @types/node @types/express @types/cors.

    [x] 1.3.4 Configure TypeScript:

        Run npx tsc --init to create a tsconfig.json file and configure it for a modern Node.js project.

    [x] 1.3.5 Create Initial Server:

        Create a src/ folder with an index.ts file.

        Inside index.ts, write a minimal Express server that listens on a port defined in .env and has a single health-check route (e.g., GET /api/health) that returns a 200 OK status.

    [x] 1.3.6 Add dev script:

        In backend/package.json, add a script: "dev": "nodemon src/index.ts".

1.4: Frontend Initial Setup (React/Vite)

    [x] 1.4.1 Initialize React Project:

        Navigate into the frontend/ directory.

        Run npm create vite@latest . -- --template react-ts to bootstrap a React + TypeScript project in the current folder.

    [x] 1.4.2 Install Tailwind CSS:

        Follow the official Vite guide to install and configure Tailwind CSS (tailwindcss, postcss, autoprefixer).

    [x] 1.4.3 Clean Up Boilerplate:

        Remove the default Vite CSS, logos, and content from App.tsx.

    [x] 1.4.4 Create Initial Component:

        In App.tsx, add a simple <h1>EduAI-Asistent</h1> to confirm that the setup and styling are working.

1.5: Development Environment & Tooling

    [x] 1.5.1 Configure Gitignore:

        Create a .gitignore file in the root directory to ignore node_modules, .env files, and build folders (dist, .vercel) across the entire project.

    [x] 1.5.2 Create Environment Variable Templates:

        In both frontend/ and backend/, create a .env.example file listing all required environment variables (e.g., PORT, DATABASE_URL for backend, VITE_API_URL for frontend).

    [x] 1.5.3 (Optional but Recommended) Setup Concurrent Script:

        In the root directory, run npm init -y.

        Install concurrently: npm install concurrently.

        In the root package.json, add a script to run both frontend and backend at the same time: "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"". This will allow you to start the entire development environment with a single npm run dev command from the root.

⚙️ Phase 2: Backend & Database (without AI)

Timeline: Weeks 2-4
Status: ✅ Completed
Goal: Build the server-side logic, database structure, and the APIs required to run the application.

Tasks:

    [x] 2.1 Database Schema Design & Implementation: Create PostgreSQL tables for users, schools, subscriptions, and credits.

    [x] 2.2 Implement User Authentication: Develop API endpoints for registration, login (using JWT), and password management.

    [x] 2.3 Develop Credit System Logic: Implement backend logic for assigning and deducting credits.

    [x] 2.4 Create Mock AI API Endpoint:

        Build the API endpoint for the "Math Assistant."

        Important: Instead of calling OpenAI, this endpoint will return a predefined, static response (e.g., { "response": "This is a simulated response. Here is a sample problem: 2 + 2 = ?" }).

        This endpoint will still deduct credits to allow for testing the full user flow.

Jasně, pojďme si Fázi 3 rozepsat do mnohem detailnějších a konkrétních kroků. Tímto způsobem bude mít kdokoliv, kdo na tom bude pracovat, naprosto jasný a proveditelný plán.

Zde je nová, rozšířená verze Fáze 3.

🎨 Phase 3: Frontend Development & UI (Detailed Breakdown)

Timeline: Weeks 5-8
Status: ✅ Completed
Goal: Create the complete user interface, connected to the backend with the mocked AI. This includes building all necessary components, managing application state, and ensuring a seamless user experience from login to using the chat.

Tasks:

3.1: Základní Nastavení Frontendu a Routing

    [x] 3.1.1 Instalace react-router-dom: Nastavení základního systému pro navigaci mezi stránkami.

    [x] 3.1.2 Vytvoření Struktury Stránek: Vytvoření souborů pro hlavní pohledy aplikace: LoginPage.tsx, RegistrationPage.tsx, DashboardPage.tsx, ChatPage.tsx.

    [x] 3.1.3 Implementace Hlavního Routeru: V App.tsx nebo podobném souboru nakonfigurovat cesty pro jednotlivé stránky.

3.2: Autentizace a Správa Uživatelů

    [x] 3.2.1 Vytvoření Formulářových Komponent:

        Vytvořit znovupoužitelnou komponentu InputField.tsx pro textová pole.

        Vytvořit komponentu AuthForm.tsx, která bude obsahovat logiku pro formuláře registrace a přihlášení.

    [x] 3.2.2 Vytvoření AuthContext: Implementovat React Context pro globální správu stavu přihlášení. Bude uchovávat JWT token a informace o uživateli.

    [x] 3.2.3 Implementace PrivateRoute: Vytvořit komponentu, která obalí chráněné stránky (jako Dashboard) a automaticky přesměruje nepřihlášené uživatele na /login.

    [x] 3.2.4 Propojení s API: Vytvořit authService.ts s funkcemi login() a register(), které budou volat backendové API, ukládat JWT token do localStorage a aktualizovat AuthContext.

3.3: Vývoj Hlavního Dashboardu

    [x] 3.3.1 Vytvoření Komponenty Header.tsx: Vytvořit hlavičku, která se bude zobrazovat přihlášeným uživatelům. Bude obsahovat jméno uživatele a tlačítko "Odhlásit se".

    [x] 3.3.2 Vytvoření Komponenty CreditBalance.tsx: Malá komponenta, která zobrazí aktuální počet kreditů uživatele. Data získá voláním API (přes userService.ts).

    [x] 3.3.3 Vytvoření Komponenty AssistantCard.tsx: Vizuální prvek (karta), který bude sloužit jako odkaz pro přechod na stránku s AI asistentem (např. "Spustit Matematického asistenta").

    [x] 3.3.4 Sestavení DashboardPage.tsx: Sestavit finální stránku dashboardu z výše uvedených komponent.

3.4: Vývoj Chatovacího Rozhraní

    [x] 3.4.1 Vytvoření Komponenty MessageInput.tsx: Formulář ve spodní části stránky s textovým polem a tlačítkem "Odeslat".

    [x] 3.4.2 Vytvoření Komponenty Message.tsx: Komponenta pro zobrazení jedné zprávy (chatovací bubliny). Měla by mít různé styly pro zprávy od uživatele a od bota.

    [x] 3.4.3 Vytvoření Komponenty ChatWindow.tsx: Hlavní okno, které bude obsahovat seznam všech zpráv. Bude spravovat stav konverzace (pole zpráv) pomocí useState.

    [x] 3.4.4 Sestavení ChatPage.tsx: Složit celou chatovací stránku z komponent ChatWindow a MessageInput.

3.5: Finální Integrace s API

    [x] 3.5.1 Vytvoření apiClient.ts: Centrální soubor pro konfiguraci axios (nebo fetch). Nastavit, aby se ke každému autorizovanému požadavku automaticky přidal JWT token do hlavičky.

    [x] 3.5.2 Propojení Chatu s Mock API: Po odeslání zprávy z MessageInput.tsx zavolat funkci askAssistant(prompt) z assistantService.ts, která odešle dotaz na mockovaný backendový endpoint.

    [x] 3.5.3 Zpracování Odpovědi: Po obdržení statické odpovědi z backendu ji přidat do stavu konverzace v ChatWindow.tsx jako zprávu od bota. Implementovat "loading" stav, zatímco se čeká na odpověď.
✨ Phase 4: UI/UX Redesign & Feature Polish

Timeline: Week 10
Status: ✅ Completed
Goal: Transform the functional MVP into a visually appealing and user-friendly application by adding key features and completely redesigning the main pages.

Tasks:

    4.1 Dashboard Redesign:

        [x] Create a new, more modern layout (e.g., a two-column layout with main content on the left and a sidebar with info on the right).

        [x] Make the credit display more prominent (e.g., a separate, visually distinct card).

        [x] Add icons for each assistant and improve hover effects on the cards.

    4.2 User Account Management:

        [x] Backend: Create a secure PUT /api/users/me endpoint to update user data (name, password).

        [x] Frontend: In the "Account Information" section, add an "Edit" button.

        [x] Frontend: Implement a modal window or a separate page with a form to edit the user's name and change their password.

    4.3 Chat Interface Enhancements:

        [x] Implement conversation history saving to localStorage so the chat is not lost on page refresh.

        [x] Add avatars (or initials) for the user and a bot icon to the chat bubbles.

        [x] Add a button to copy the AI's response to the clipboard.

    4.4 General UX Improvements:

        [x] Implement loading states (spinners or skeleton screens) when fetching data from the API.

        [x] Add a notification system ("toasts") to display success messages (e.g., "Your details have been saved successfully") or errors.

        [x] Add a confirmation modal on logout ("Are you sure you want to log out?").

🧹 Phase 5: Code Optimization & Cleanup

Timeline: Week 11
Status: ✅ Completed
Goal: Improve the application's performance and maintainability by removing unused code and optimizing critical parts.

Tasks:

    [x] 5.1 Dead Code Elimination: Use tools (e.g., ts-prune or IDE features) to identify and remove unused files, exports, variables, and functions.

    [x] 5.2 NPM Package Audit: Review the package.json files and remove any dependencies that are no longer used in the project.

    [x] 5.3 Frontend Optimization:

        [x] Review React components and apply React.memo where appropriate to prevent unnecessary re-renders.

        [x] Check the usage of useCallback and useMemo for performance optimization.

    [x] 5.4 Backend Optimization:

        [x] Review database queries and ensure that key columns (e.g., foreign keys, user emails) have indexes for faster lookups.

🧠 Phase 6: Live AI Integration (Math Bot)

Timeline: Week 12
Status: ✅ Completed
Goal: Replace the mock AI endpoint with a live connection to the OpenAI API to power a functional "Math Assistant".

Tasks:

    6.1 Backend Preparation:

        [x] Install the official OpenAI client library: npm install openai in the backend/ directory.

        [x] Add OPENAI_API_KEY to the .env.example and .env files in the backend/ directory.

    6.2 Update the AI Assistant API Endpoint:

        [x] Locate the mock API endpoint (e.g., POST /api/assistant/ask).

        [x] Remove the static, predefined response logic.

    6.3 Implement OpenAI API Call:

        [x] Initialize the OpenAI client in your service file using the API key from the environment variables.

        [x] Create a specific "system prompt" to define the bot's behavior. For example: "You are a helpful and patient math tutor for Czech high school students. Explain concepts clearly, step-by-step. Always provide a practical example. Your language must be encouraging and you must always respond in Czech."

        [x] Use the openai.chat.completions.create method to send the user's query (the "user" message) along with the system prompt to a GPT model (e.g., gpt-4o or gpt-3.5-turbo).

    6.4 Process and Return the Live Response:

        [x] Take the response content from the OpenAI API's choice object.

        [x] Return this live response to the frontend.

        [x] Ensure the credit deduction logic remains in place and is executed only upon a successful API call.

        ✨ Phase 7: Advanced Features & System Polish

Timeline: Week 14
Status: ✅ Completed
Goal: Enhance the application with key user features, including file generation and multi-chat support, while also fixing the critical credit system logic.

Tasks:

    7.1 Critical Fix: Credit System Logic:

        [x] Backend: Locate the live AI assistant endpoint (POST /api/assistant/ask).

        [x] Backend: Implement a check at the beginning of the endpoint to ensure the user has > 0 credits. If not, return a "402 Payment Required" error.

        [x] Backend: After receiving a successful response from the OpenAI API, decrement the user's credit count in the PostgreSQL database.

    7.2 "Add Credits" Demo Feature:

        [x] Frontend: On the DashboardPage.tsx, add a new button styled as a secondary action, e.g., "+ Add 100 Demo Credits".

        [x] Backend: Create a new secure endpoint, POST /api/users/me/add-credits.

        [x] Backend: This endpoint will find the logged-in user and increment their credit count by 100.

        [x] Frontend: Wire the button to call this new endpoint and then refresh the displayed credit balance upon success.

    7.3 Multi-Chat Session Support (Foundation):

        [x] Frontend: In the ChatPage.tsx UI (e.g., in the header or a new sidebar placeholder), add a "＋ New Chat" button.

        [x] Frontend: When this button is clicked, the current conversation state (messages array) should be cleared to start a fresh conversation.

        [x] Frontend (Optional but Recommended): Modify the chat route to include a session ID (e.g., /chat/math/:sessionId). Clicking "New Chat" would navigate to a new UUID, laying the groundwork for saving conversations later.

    7.4 File Generation Feature (Math Worksheets):

        [x] Frontend: In the ChatPage.tsx UI, add a "Generate Worksheet" button near the message input field.

        [x] Backend: Create a new endpoint, POST /api/assistant/generate-worksheet. This endpoint will also deduct credits.

        [x] Backend: This endpoint will construct a highly-specific prompt for the AI, for example: "You are a high school math teacher. Generate a 10-question math worksheet on the topic of 'Quadratic Equations'. Format the output as a clean JSON object with a 'title', 'instructions', and an array of 'questions', where each question has a 'problem' string and an 'answer' string."

        [x] Frontend: When the "Generate Worksheet" button is clicked, it could trigger a modal to ask for the topic. This topic is then sent to the new backend endpoint.

        [x] Frontend: Upon receiving the structured JSON response, create a new component (WorksheetDisplay.tsx) that renders the content in a clean, printable format.


You are absolutely right, my apologies. I will ensure my responses stay in English. Thank you for the reminder.

Here is the fully English version of the new Phase 8 for your implementation plan, along with the corresponding prompt for Cursor.

🚀 Updated Implementation Plan – EduAI-Asistent

(Previous phases remain the same)

... Phases 1 through 7 are now prerequisites ...

✨ Phase 8: Conversation History & Advanced File Generation

Timeline: Week 15
Status: ✅ CompleteGoal: Significantly improve the user experience by implementing persistent history for chats and generated materials, and adding the ability to download materials directly as a PDF.

Tasks:

    8.1 Database Schema for History:

        [x] Backend: Design and implement new tables in PostgreSQL.

    8.2 Implement Chat History & Sidebar:

        [x] Backend: Create endpoints and modify chat logic to save conversations.

        [x] Frontend: Create and implement the ChatSidebar.tsx and update ChatPage.tsx.

    8.3 History of Generated Materials:

        [x] Backend: Modify the worksheet generation endpoint (POST /api/assistant/generate-worksheet) to save the successfully generated JSON content to the new generated_files table.

        [x] Backend: Create a new GET /api/files endpoint that returns a list of all generated materials for the given user.

        [x] Frontend: Create a new page or a tab on the dashboard titled "My Materials," which will display a list of the generated worksheets.

    8.4 Download Materials as PDF:

        [x] Frontend: In the component for displaying a generated worksheet (WorksheetDisplay.tsx), add a "Download as PDF" button.

        [x] Frontend: Implement the logic for this button using client-side libraries (e.g., jspdf and html2canvas).

🎨 Phase 9: Finalize Features & Full UI/UX Overhaul

Timeline: Week 16
Status: 🚧 In ProgressGoal: To finalize all history-related features and to implement a comprehensive, modern, and visually stunning redesign across the entire application using a professional component library.

Tasks:

    9.1 Complete Worksheet History & PDF Download (Finishing Phase 8):

        [x] Backend: Implement the logic in the generate-worksheet endpoint to save the file's JSON content to the generated_files table.

        [x] Backend: Create and implement the GET /api/files endpoint to fetch the list of saved files for a user.

        [x] Frontend: Build the "My Materials" page/tab, fetch the data from the new endpoint, and display it as a list.

        [x] Frontend: Implement the "Download as PDF" button and its functionality on the worksheet display page.

    9.2 Establish a New, Modern Design System:

        [x] Decision & Setup: Integrate a professional, modern component library like Shadcn/ui to serve as the new design foundation. This involves setting up the CLI, and configuring tailwind.config.js and globals.css according to its documentation.

        [x] Create Core Components: Re-style or replace basic components (Buttons, Inputs, Cards, Modals, Toasts) using the new design system to ensure consistency.

     9.3 Redesign Core Application Views:

         [x] Authentication: Overhaul the Login and Registration pages with the new, modern components.

         [x] Dashboard: Completely redesign the DashboardPage.tsx, applying the new component styles, a more dynamic layout, and improved visual hierarchy.

         [x] Chat Interface: Redesign the entire chat experience, including the new ChatSidebar, chat bubbles, and the message input area to feel premium and modern.

         9.3.1 Chat Layout & Scrolling
           [x] Convert the chat area to a strict vertical layout with a pinned composer:
               - Container: `h-[calc(100vh-64px)]` with `grid grid-cols-[auto_1fr]` (sidebar + main).
               - Main chat card: `flex flex-col min-h-0`.
               - Messages viewport: `flex-1 min-h-0 overflow-y-auto`.
               - Composer: sticky footer inside the card (`sticky bottom-0` or kept as a flex child with border-top).
           [x] Add an anchored auto-scroll system with a floating "Scroll to latest" button. Keep auto-scroll only when the user is near the bottom.
           [x] Insert day separators (Today, Yesterday, date) and a "New messages" divider when the assistant responds after user scrolled up. (day separators done)
           [x] Virtualize long conversations using `react-virtuoso` to keep memory and FPS stable.

         9.3.2 Message Rendering & Actions
           [x] Replace any emoji glyphs with consistent icons from `lucide-react` (e.g., `CornerDownLeft` for Enter hint, not ⏎).
           [x] Render Markdown with code blocks, lists, and math using `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`.
           [x] Add a compact message action toolbar (Copy, Regenerate, Delete) on hover; keyboard accessible.
           [x] Group consecutive messages by author to reduce visual noise; show avatar only on group edges.
           [x] Add timestamp on hover and a read-friendly monospace style for code blocks.

         9.3.3 Composer (MessageInput) Enhancements
           [x] Make the textarea auto-grow up to 7 lines; beyond that, keep internal scroll.
           [x] Add a toolbar with buttons: `Upload` (future), `Templates` (slash commands), `Generate worksheet`, and `Send` (toolbar added; Upload/Templates pending functionality).
           [x] Keyboard shortcuts: `Ctrl/Cmd + K` to open command palette and focus composer.
           [ ] Inline token/credit hint with icon and a disabled state tooltip when balance is 0.

         9.3.4 Sidebar Enhancements
           [x] Add search and filters (basic search + star/pin) with icons; persisted starred state.
           [x] Support renaming inline, delete with confirm, and star/pin conversations; persist state.
           [x] Mobile: slide-over drawer with backdrop.

     9.4 Add UI Polish & Microinteractions:

         [x] Animations: Introduce subtle animations and page transitions using a library like framer-motion to make the app feel more fluid.

         [x] Microinteractions: Enhance user feedback with polished hover effects, button-press animations,

     9.5 Theming, Icons, and Design Tokens
         [x] Add Dark Mode using Tailwind's `class` strategy and a simple Theme context with a toggle in `Header.tsx`.
         [x] Create a single source of truth for design tokens in CSS variables (`--bg`, `--card`, `--muted`, `--border`, `--text`) and expose them in Tailwind as `surface.{bg,card,muted,border,text}`.
         [x] Establish an icon system: central `components/icons/index.tsx` with `assistantIconMap` and `getAssistantIcon()`; updated consumers (e.g., `AssistantCard`).
         [x] Update focus styles and outlines for WCAG AA contrast; add `:focus-visible` rings for core components (buttons, modals, inputs).

     9.6 Global Component Polish
         [x] Buttons: add icon size and full-width support; unified paddings and focus rings.
         [x] Cards/Modals: backdrop blur applied to header; dark-mode surfaces finalized.
         [x] Inputs: leading/trailing icon support and help text; dark-mode fields.
         [x] Toasts: success/error/warning/info icons.

     9.7 Dashboard Enhancements
         [x] New hero header with gradient background, big credit badge, and CTA buttons (Chat, Materials).
         [x] Rework `AssistantCard` to use glassy gradients, richer icons, and subtle 3D hover (`translate`, `shadow-brand`).
         [x] Quick stats: add mini-sparklines for activity using a lightweight sparkline library or SVG.

      9.8 Accessibility & Quality
         [x] Ensure ARIA roles/labels in chat (added timestamps, hint text; message actions keyboard clickable; palette shortcut).
         [x] Provide keyboard navigation for composer and toolbar (buttons are focusable; Ctrl/Cmd+K supported).
         [x] Reduce layout shift (CLS) by virtualizing list and reserving typing indicator space.

      9.9 Performance & Reliability
         [x] Defer heavy libs (pdf generation) using dynamic imports.
         [x] Add route-based code splitting with Suspense fallback.
         [x] Add error boundaries around app routes with a reload affordance.

      9.10 Visual Language Quick Wins (can be shipped first)
         [x] New gradient hero and glassy cards for dashboard.
         [x] Rounded radii upgrade and soft borders integrated across components.
         [x] Custom scrollbar (light/dark) implemented.
         [x] Replaced emoji symbols with icons (composer hint and controls).

✨ Phase 10: Delight Features & Finishing Touches

Timeline: Week 17
Status: Planned
Goal: Ship delightful touches that make the product feel premium and unique while keeping performance solid.

Tasks:

  10.1 Command Menu & Shortcuts
    [x] Global command palette (`Ctrl/Cmd + K`) with quick actions: New chat, Go to materials, Add credits, Focus composer.
    [x] Slash commands v editoru (česky; kvadratické rovnice, derivace, procenta). Plovoucí menu nad vstupem.
    [x] Základní nápověda příkazů v Command Palette.
    [x] Sekce „Všechny příkazy a zkratky” přímo v Command Palette.

  10.2 Rich Replies
    [x] Collapsible sections in long AI answers (Show more/less) with smooth height animation.
    [x] Inline citations/footnotes area at the end of each AI message (for future RAG).
    [x] Quick-format mini-toolbar v editoru (tučný, seznam, LaTeX vzorec) – vkládá šablony do textu.

  10.3 Worksheet UX
    [x] Beautiful printable theme with proper typographic scale; guaranteed A4 page breaks in PDF.
    [x] Add cover/header with school name and date; on-screen fields for student/teacher with print-friendly underlines.

  10.4 Quality Gates
    [x] Visual regression snapshots for key pages (Dashboard, Chat light/dark) using Playwright.
    [x] Baseline performance budget: FCP/DCL < 3s check in Playwright (proxy for LCP).

📦 Phase 11: Schools, Roles & Profiles

Timeline: Week 18
Status: Planned
Goal: Add multi-tenant school accounts with role-based access, dual registration flows, and dedicated profile pages for users and schools.

Note: Already present in codebase and excluded from this phase — JWT auth, baseline secure endpoints, and private routes.

Tasks:

11.1 Data Model & Auth (RBAC)
  [x] Add `role` to `users` (e.g., `SCHOOL_ADMIN`, `TEACHER_SCHOOL`, `TEACHER_INDIVIDUAL`).
  [x] Ensure `users.school_id` is required for school-bound roles and null for individual teachers.
  [x] Update JWT payload to include `role` and `school_id`; update `UserWithSchool` type accordingly.
  [x] DB constraints: unique (school_id, email) for school teachers; indexes for role/school_id.

11.2 Registration Flows
  [x] School registration (new page): creates School + Admin user.
      - Backend: `POST /auth/register-school` → create `school` + admin `user` (role `SCHOOL_ADMIN`).
      - Optional: email verification scaffold.
  [x] Teacher (individual) registration (separate page/form): role `TEACHER_INDIVIDUAL`.
      - Backend: reuse existing `POST /auth/register` with role handling.

11.3 School Admin: Teacher Management
  [x] School Profile page (admin only): view/edit school info.
  [x] Manage teachers: list, invite/add (email), deactivate/remove. (Option B implemented: direct creation with temporary password)
      - Backend: `GET /schools/:id/teachers`, `POST /schools/:id/teachers` (invite/add), `DELETE /schools/:id/teachers/:userId`.
      - Option A: invite tokens; Option B: direct creation with temporary password.
  [x] Role guard on endpoints (server) and pages (client).

11.4 User & School Profile Pages (Frontend)
  [x] User Profile page: edit name, password; show role, credits; dark mode.
  [x] School Profile page (admin): edit school name/logo, overview of teachers; dark mode.
  [x] Navigation: add links from Header or Dashboard to these pages.

11.5 Security & Routing Audit
  [x] Backend: audit protected routes; add role checks on school endpoints.
  [x] Frontend: add role-based route guards (e.g., `RequireRole(['SCHOOL_ADMIN'])`).

11.6 QA & E2E
  [ ] Playwright: flows for register school → login admin → add teacher.
  [ ] Playwright: register individual teacher → login → access chat.
  [ ] Visual snapshots for new profile pages (light/dark).


  🎨 Phase 12: School Administration & Advanced Library

Timeline: Week 19+
Status: 📝 To-Do
Goal: To implement advanced features for school administrators and transform the "My Materials" section into a full-fledged, organized library with sharing capabilities.

Tasks:

12.1 Chat UI Theming:

    [x] Frontend: Apply the dark mode color scheme and styles to all components within the ChatPage.tsx, including the sidebar, message bubbles, and composer, to ensure visual consistency with the rest of the application.

12.2 School Administration Overhaul:

    [x] Frontend: Add a prominent "Back to Dashboard" navigation link/button on the SchoolAdminPage.tsx.

    [x] Backend & Frontend: Implement a "Credit Management" section for admins, showing the school's total credits, monthly usage, and a table with credit usage per teacher.

    [x] Frontend: Add a "Subscription Info" panel that displays the school's current plan and its renewal date.

    [x] Frontend: Enhance the teacher list with a search input field.

12.3 "My Materials" to Library Transformation:

    [x] Backend: Update the database schema to support folders (folders table) and sharing (shared_materials table).

    [x] Backend & Frontend: Implement full CRUD (Create, Read, Update, Delete) functionality for folders. Allow materials to be moved into folders.

    [x] Backend & Frontend: Implement a robust search and filtering system for the materials page.

    [x] Backend & Frontend: Implement the "Share within school" functionality. Create a new "School Library" page where teachers can view materials shared by their colleagues.

 Phase 13: Enhanced Math Assistant & User Experience

Timeline: Week 20-21
Status:  Planned
Goal: Significantly enhance the math assistant capabilities and improve overall user experience with advanced features and better interaction patterns.

Tasks:

13.1 Math Assistant Improvements:
    [x] Backend & Frontend: Integrate KaTeX or MathJax for beautiful mathematical notation display in chat responses.
    [x] Backend: Enhance AI prompts to generate step-by-step problem solutions with clear explanations.
    [x] Frontend: Implement math topic categorization system (algebra, geometry, calculus, statistics) with visual topic tags.
    [x] Frontend: Add practice mode with immediate feedback and progress tracking for students.
    [x] Backend & Frontend: Create a math difficulty progression system (basic, intermediate, advanced) with adaptive content.

13.2 Enhanced Chat Experience:
    [x] Frontend: Add image upload capability for math problems (OCR integration for handwritten equations).
    [x] Frontend: Implement PDF export functionality for conversations and generated worksheets.
    [x] Frontend: Add advanced search and filtering for conversation history.
    [x] Frontend: Add voice input and text-to-speech for accessibility.
    [ ] Frontend: Add collaborative chat features allowing teachers to share sessions with students. - maybe
    [x] Frontend: Create chat templates with pre-built conversation starters for common math topics.

13.3 User Experience Enhancements:
    [x] Frontend: Implement advanced keyboard shortcuts and customizable hotkeys.
    [x] Frontend: Add a comprehensive help system with interactive tutorials and tooltips.
    [x] Frontend: Implement user preference settings (language, theme, notification preferences).
    [x] Frontend: Add accessibility features (screen reader support, high contrast mode, keyboard navigation).

🎨 Phase 14: Landing Page & Marketing

Timeline: Week 22-23
Status: 📝 Planned
Goal: Create a compelling public-facing landing page and implement marketing features to attract new users and schools.

Tasks:

14.1 Public Landing Page:
    [ ] Frontend: Design and implement a modern, responsive landing page with compelling hero section.
    [ ] Frontend: Create feature showcase with interactive demos of AI capabilities.
    [ ] Frontend: Add testimonials section with success stories from Czech schools.
    [ ] Frontend: Implement clear pricing plans and subscription tiers.
    [ ] Frontend: Add streamlined school registration flow with clear CTAs.

14.2 Marketing Features:
    [ ] Frontend: Implement SEO optimization with Czech language keywords and meta tags.
    [ ] Backend: Create analytics endpoints for tracking visitor behavior and conversions.
    [ ] Frontend: Add A/B testing framework for landing page variations.
    [ ] Frontend: Implement lead capture forms (newsletter signup, demo requests).
    [ ] Frontend: Add social proof elements and integration with Czech education platforms.


🔧 Phase 15: Developer Admin Dashboard

Timeline: Week 24-25
Status: 📝 Planned
Goal: Build a comprehensive developer/admin dashboard for system management, monitoring, and business intelligence.

Tasks:

15.1 System Administration:
    [ ] Backend: Create admin-only endpoints for system-wide user management.
    [ ] Frontend: Build admin dashboard with user overview, school management, and system status.
    [ ] Backend: Implement system health monitoring (API performance, database health, error rates).
    [ ] Backend: Add comprehensive audit logging for all system activities.
    [ ] Frontend: Create system health dashboard with real-time metrics and alerts.

15.2 Credit & Business Management:
    [ ] Backend: Implement system-wide credit management and distribution controls.
    [ ] Frontend: Create credit analytics dashboard showing usage patterns and trends.
    [ ] Backend: Add subscription management endpoints for different plan tiers.
    [ ] Frontend: Build business intelligence dashboard with revenue tracking and user growth metrics.

15.3 Content Moderation & Quality:
    [ ] Backend: Implement content moderation system for AI-generated materials.
    [ ] Frontend: Create moderation interface for reviewing and approving content.
    [ ] Backend: Add quality scoring system for AI responses and generated materials.
    [ ] Frontend: Build quality metrics dashboard with performance indicators.

15.4 Developer Tools:
    [ ] Backend: Create API documentation and testing endpoints.
    [ ] Frontend: Build API testing interface for developers.
    [ ] Backend: Implement feature flags and configuration management.
    [ ] Frontend: Create system configuration panel for feature toggles and settings.

 Phase 16: Advanced Library & Content Management

Timeline: Week 26-27
Status: 📝 Planned
Goal: Transform the materials system into a comprehensive, intelligent library with advanced organization, collaboration, and discovery features.

Tasks:

16.1 Content Organization & Discovery:
    [ ] Backend: Implement AI-powered content categorization and tagging system.
    [ ] Frontend: Create intelligent search with filters, sorting, and relevance scoring.
    [ ] Backend: Add content recommendation engine based on user preferences and usage patterns.
    [ ] Frontend: Implement advanced filtering system (subject, grade level, difficulty, tags).
    [ ] Backend: Create content versioning system with change tracking and rollback capabilities.

16.2 Collaboration & Sharing:
    [ ] Frontend: Build teacher networks and communities within and across schools.
    [ ] Backend: Implement content rating and review system with moderation.
    [ ] Frontend: Create discussion forums for subject-specific teacher communities.
    [ ] Backend: Add collaborative content creation with real-time editing capabilities.
    [ ] Frontend: Implement resource sharing workflows with approval processes.

16.3 Content Templates & Standards:
    [ ] Backend: Create template system for worksheets, lessons, and assessments.
    [ ] Frontend: Build template library with customizable educational content structures.
    [ ] Backend: Implement curriculum alignment system with Czech educational standards.
    [ ] Frontend: Add curriculum mapping interface for content organization.
    [ ] Backend: Create assessment tools with standardized testing and evaluation features.

16.4 Advanced Library Features:
    [ ] Frontend: Implement content collections and curated learning paths.
    [ ] Backend: Add content analytics (usage statistics, popularity, effectiveness).
    [ ] Frontend: Create personalized learning recommendations for students.
    [ ] Backend: Implement content export/import system for backup and migration.
    [ ] Frontend: Add offline content access with synchronization capabilities.