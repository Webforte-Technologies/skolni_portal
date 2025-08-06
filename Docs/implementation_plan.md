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

🎨 Phase 3: Frontend Development & UI

Timeline: Weeks 5-8
Status: 📝 To-Do
Goal: Create the complete user interface, connected to the backend with the mocked AI.

Tasks:

    [ ] 3.1 Build Authentication Pages: Develop components for Login and Registration.

    [ ] 3.2 Develop the Main Dashboard: Create the central hub for users, showing their credit balance.

    [ ] 3.3 Create the AI Chat Component: Build the interactive chat interface.

    [ ] 3.4 Integrate Frontend with Backend API: Connect all components to the backend, including calling the mock AI endpoint and displaying its static response.

✨ Phase 4: Foundation Testing & Polish

Timeline: Week 9
Status: 📝 To-Do
Goal: Ensure that the application foundation (registration, login, credit management, simulated chat) is stable and bug-free.

Tasks:

    [ ] 4.1 End-to-End Application Testing: Manually test all user scenarios.

    [ ] 4.2 UI/UX Review: Check and polish the visual aspects of the application according to design_guidelines.md.

PART 2: AI Integration & MVP Launch

Goal of this part: To replace the simulated assistant with a live connection to OpenAI, test the final product, and launch it for the first users.

🧠 Phase 5: AI Integration

Timeline: Weeks 10-11
Status: 📝 To-Do
Goal: Replace the temporary solution with a live connection to the finished AI assistant.

Tasks:

    [ ] 5.1 Implement Live AI Connection: Update the backend endpoint to call the actual OpenAI service instead of returning a static response.

    [ ] 5.2 Handle Dynamic Responses: Adapt the frontend and backend to handle real, variable responses from the AI.

    [ ] 5.3 Fine-tune "System Prompts": Develop and test the final instructions for the AI to ensure it behaves correctly as a "Math Assistant."

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