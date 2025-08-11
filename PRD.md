# PRD – EduAI-Asistent (MVP)

## 🧩 Project Name

**EduAI-Asistent**

## 🎯 Project Purpose

The purpose of this project is to develop a Minimum Viable Product (MVP) for a new SaaS platform aimed at the Czech education sector. The platform will address the widespread problem of teacher burnout and administrative overload by providing a suite of specialized AI-powered assistants designed to automate and simplify time-consuming tasks like lesson preparation, exercise creation, and material generation.

The primary goal of the MVP is to **validate the core value proposition**: that teachers are willing to use and pay for a tool that saves them significant time. The key feature for this validation will be a functional **"Math Assistant"**.

## 🔑 Target Audience (MVP)

1.  **High School & Elementary School Teachers (Czech Republic):** Tech-savvy or time-pressed educators who are actively looking for ways to improve their workflow, personalize their teaching, and reduce the time spent on repetitive prep work.
2.  **School Management (Principals, IT Admins):** Forward-thinking school leaders interested in piloting modern digital tools to increase the overall efficiency and quality of education in their institution.

## 📄 Application Content & Structure (MVP)

The MVP is a web application, not a single landing page. It will consist of the following key views:

1.  **Authentication Pages**
    -   A clean and simple registration form for individual teachers.
    -   A login page.
2.  **Main Dashboard**
    -   The central hub for the user after logging in.
    -   Displays the user's name, current credit balance, and provides clear entry points to the available tools.
3.  **AI Assistant View**
    -   The core interactive workspace.
    -   A chat-like interface where the teacher can interact with the "Math Assistant".
    -   Includes a prompt input field and a display area for the conversation history.
4.  **User Profile Page**
    -   A simple page where users can view their account details and subscription status.

## 🎨 Design

Refer to the separate `DESIGN_GUIDELINES.md` document for detailed specifications.

-   **Style**: Clean, professional, minimalist, and trustworthy (Light Mode).
-   **Primary Accent Color**: `#4A90E2` (professional blue).

## ⚙️ Technology (MVP Stack)

-   **Frontend Framework**: React (with Vite)
-   **Programming Language**: TypeScript
-   **Backend Framework**: Node.js (with Express.js)
-   **Database**: PostgreSQL
-   **Styling**: Tailwind CSS
-   **AI Integration**: Backend integration with a major LLM provider (e.g., OpenAI API).
-   **Hosting**: Vercel (Frontend), Render/GCP (Backend).

## 🛠️ Features and Components (MVP)

-   [x] Secure user registration and token-based login system.
-   [x] Functional "Math Assistant" capable of generating practice problems and explaining concepts.
-   [x] Working credit system where using the assistant deducts from a user's balance.
-   [x] A responsive design that works flawlessly on desktop and tablet devices.
-   [x] A clean and intuitive user dashboard showing the most critical information.
-   [x] All user-facing text must be in Czech.

## ✅ The finished MVP will deliver:

-   A deployed and publicly accessible web application.
-   A working end-to-end user flow: a user can register, log in, use the AI tool, and see their credits decrease.
-   The ability to successfully onboard the first pilot users to gather feedback.
-   A solid technical foundation for future development and scaling.

---

## 📅 Milestones (MVP)

| Milestone | Description | Timeline |
| :--- | :--- | :--- |
| **Phase 1** | Foundation & Docs: Project setup, documentation generation. | Week 1 |
| **Phase 2** | Backend & DB: Building the core server-side logic and database. | Weeks 2-5 |
| **Phase 3** | Frontend: Building the user interface and components in React. | Weeks 5-9 |
| **Phase 4** | Integration & Polish: Connecting FE/BE, end-to-end testing, bug fixing. | Weeks 10-11 |
| **MVP Launch**| Deployment to production and onboarding of first pilot users. | Week 12 |

---

## 📎 Notes

-   The absolute focus of the MVP is to test the core loop: **Login -> Use AI Tool -> See Value (time saved) -> Credits Spent.**
-   All secondary features, such as complex school administration panels or multiple AI assistants, are intentionally excluded from the MVP scope.
-   The application must feel professional and reliable from day one to build trust with educators.