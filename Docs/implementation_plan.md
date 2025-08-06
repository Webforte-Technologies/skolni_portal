📋 Project Overview

Goal: Development of a robust and scalable MVP for the EduAI-Asistent platform. The plan is divided into two main parts: first, creating a functional application foundation (the "shell"), and second, integrating the finished AI assistant.

Technology: React (Vite), Node.js (Express.js), PostgreSQL, Tailwind CSS, TypeScript

Timeline: August 2025 - October 2025

PART 1: Application Foundation (MVP Shell)

Goal of this part: To have a fully functional web application where users can register, log in, see their credits, and interact with a chat interface. The assistant's response will be static (simulated) for now.

🎯 Phase 1: Project Foundation & Documentation

Timeline: Week 1
Status: 📝 To-Do
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
Status: 📝 To-Do
Goal: Create the complete user interface, connected to the backend with the mocked AI. This includes building all necessary components, managing application state, and ensuring a seamless user experience from login to using the chat.

Tasks:

3.1: Základní Nastavení Frontendu a Routing

    [ ] 3.1.1 Instalace react-router-dom: Nastavení základního systému pro navigaci mezi stránkami.

    [ ] 3.1.2 Vytvoření Struktury Stránek: Vytvoření souborů pro hlavní pohledy aplikace: LoginPage.tsx, RegistrationPage.tsx, DashboardPage.tsx, ChatPage.tsx.

    [ ] 3.1.3 Implementace Hlavního Routeru: V App.tsx nebo podobném souboru nakonfigurovat cesty pro jednotlivé stránky.

3.2: Autentizace a Správa Uživatelů

    [ ] 3.2.1 Vytvoření Formulářových Komponent:

        Vytvořit znovupoužitelnou komponentu InputField.tsx pro textová pole.

        Vytvořit komponentu AuthForm.tsx, která bude obsahovat logiku pro formuláře registrace a přihlášení.

    [ ] 3.2.2 Vytvoření AuthContext: Implementovat React Context pro globální správu stavu přihlášení. Bude uchovávat JWT token a informace o uživateli.

    [ ] 3.2.3 Implementace PrivateRoute: Vytvořit komponentu, která obalí chráněné stránky (jako Dashboard) a automaticky přesměruje nepřihlášené uživatele na /login.

    [ ] 3.2.4 Propojení s API: Vytvořit authService.ts s funkcemi login() a register(), které budou volat backendové API, ukládat JWT token do localStorage a aktualizovat AuthContext.

3.3: Vývoj Hlavního Dashboardu

    [ ] 3.3.1 Vytvoření Komponenty Header.tsx: Vytvořit hlavičku, která se bude zobrazovat přihlášeným uživatelům. Bude obsahovat jméno uživatele a tlačítko "Odhlásit se".

    [ ] 3.3.2 Vytvoření Komponenty CreditBalance.tsx: Malá komponenta, která zobrazí aktuální počet kreditů uživatele. Data získá voláním API (přes userService.ts).

    [ ] 3.3.3 Vytvoření Komponenty AssistantCard.tsx: Vizuální prvek (karta), který bude sloužit jako odkaz pro přechod na stránku s AI asistentem (např. "Spustit Matematického asistenta").

    [ ] 3.3.4 Sestavení DashboardPage.tsx: Sestavit finální stránku dashboardu z výše uvedených komponent.

3.4: Vývoj Chatovacího Rozhraní

    [ ] 3.4.1 Vytvoření Komponenty MessageInput.tsx: Formulář ve spodní části stránky s textovým polem a tlačítkem "Odeslat".

    [ ] 3.4.2 Vytvoření Komponenty Message.tsx: Komponenta pro zobrazení jedné zprávy (chatovací bubliny). Měla by mít různé styly pro zprávy od uživatele a od bota.

    [ ] 3.4.3 Vytvoření Komponenty ChatWindow.tsx: Hlavní okno, které bude obsahovat seznam všech zpráv. Bude spravovat stav konverzace (pole zpráv) pomocí useState.

    [ ] 3.4.4 Sestavení ChatPage.tsx: Složit celou chatovací stránku z komponent ChatWindow a MessageInput.

3.5: Finální Integrace s API

    [ ] 3.5.1 Vytvoření apiClient.ts: Centrální soubor pro konfiguraci axios (nebo fetch). Nastavit, aby se ke každému autorizovanému požadavku automaticky přidal JWT token do hlavičky.

    [ ] 3.5.2 Propojení Chatu s Mock API: Po odeslání zprávy z MessageInput.tsx zavolat funkci askAssistant(prompt) z assistantService.ts, která odešle dotaz na mockovaný backendový endpoint.

    [ ] 3.5.3 Zpracování Odpovědi: Po obdržení statické odpovědi z backendu ji přidat do stavu konverzace v ChatWindow.tsx jako zprávu od bota. Implementovat "loading" stav, zatímco se čeká na odpověď.
✨ Phase 4: UI/UX Redesign & Feature Polish

Timeline: Week 10
Status: 📝 To-Do
Goal: Transform the functional MVP into a visually appealing and user-friendly application by adding key features and completely redesigning the main pages.

Tasks:

    4.1 Dashboard Redesign:

        [ ] Create a new, more modern layout (e.g., a two-column layout with main content on the left and a sidebar with info on the right).

        [ ] Make the credit display more prominent (e.g., a separate, visually distinct card).

        [ ] Add icons for each assistant and improve hover effects on the cards.

    4.2 User Account Management:

        [ ] Backend: Create a secure PUT /api/users/me endpoint to update user data (name, password).

        [ ] Frontend: In the "Account Information" section, add an "Edit" button.

        [ ] Frontend: Implement a modal window or a separate page with a form to edit the user's name and change their password.

    4.3 Chat Interface Enhancements:

        [ ] Implement conversation history saving to localStorage so the chat is not lost on page refresh.

        [ ] Add avatars (or initials) for the user and a bot icon to the chat bubbles.

        [ ] Add a button to copy the AI's response to the clipboard.

    4.4 General UX Improvements:

        [ ] Implement loading states (spinners or skeleton screens) when fetching data from the API.

        [ ] Add a notification system ("toasts") to display success messages (e.g., "Your details have been saved successfully") or errors.

        [ ] Add a confirmation modal on logout ("Are you sure you want to log out?").

🧹 Phase 5: Code Optimization & Cleanup

Timeline: Week 11
Status: 📝 To-Do
Goal: Improve the application's performance and maintainability by removing unused code and optimizing critical parts.

Tasks:

    [ ] 5.1 Dead Code Elimination: Use tools (e.g., ts-prune or IDE features) to identify and remove unused files, exports, variables, and functions.

    [ ] 5.2 NPM Package Audit: Review the package.json files and remove any dependencies that are no longer used in the project.

    [ ] 5.3 Frontend Optimization:

        [ ] Review React components and apply React.memo where appropriate to prevent unnecessary re-renders.

        [ ] Check the usage of useCallback and useMemo for performance optimization.

    [ ] 5.4 Backend Optimization:

        [ ] Review database queries and ensure that key columns (e.g., foreign keys, user emails) have indexes for faster lookups.

🚀 Phase 6: Final Testing & Launch

Timeline: Week 12
Status: 📝 To-Do
Goal: Thoroughly test the fully functional application and deploy it to a production environment.

Tasks:

    [ ] 6.1 Final End-to-End Testing (with AI): Test the complete functionality, including real responses from the AI.

    [ ] 6.2 Configure Production Environment: Set up the production database and final environment variables.

    [ ] 6.3 Deploy to Production: Deploy the final versions of the application to Vercel and Render.

    [ ] 6.4 Prepare for Pilot Users: Create welcome materials and invite the first users for testing.

    [ ] 6.5 Final Check & Launch: Perform a final smoke test on the production environment and officially begin the pilot program.