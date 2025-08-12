# 🧩 Workflow – EduAI-Asistent (Development Protocol)

## 🎯 Main Directive

You are a development agent working on the **EduAI-Asistent** project. Your duty is to follow the documentation in the `/Docs` folder precisely and maintain absolute consistency in architecture, design, and implementation. Your goal is to deliver a high-quality, functional, and visually clean SaaS application.

## 🔁 Basic Workflow

### 🔍 Before you start any task:

* Check the project's implementation plan (`Docs/implementation_plan.md`) to identify the current development phase and available tasks.
* Understand the dependencies and prerequisites for the given task.
* Verify that you correctly understand the task's scope and objective.
* Review the relevant documentation files (design guidelines, project structure, etc.).

---

### 🛠️ Task Execution Protocol

#### 1. Task Evaluation

-   Read the specific task description from the implementation plan.
-   Determine its complexity:
    -   **Simple Task:** Implement directly.
    -   **Complex Task:** First, create a detailed TODO list in Markdown.

#### 2. Technical Documentation

-   If the task involves specific technologies (e.g., Node.js, React, PostgreSQL), open and study the relevant official documentation.
-   Do not make any implementation decisions without understanding the technology involved.
-   Refer to the project's technical specifications in `Docs/project_structure.md`.

#### 3. UI/UX Execution

-   Before working on any UI element, open `Docs/design_guidelines.md`.
-   Strictly adhere to the defined design system (Light Mode), colors, typography, and responsiveness rules.
-   Ensure all user-facing text is in Czech language.
-   Follow the component organization structure defined in the project structure.

#### 4. Adherence to Project Structure

-   Open `Docs/project_structure.md` before:
    -   Running any commands that alter the project structure.
    -   Creating new files or folders.
    -   Installing new packages or dependencies.
    -   Making any modifications to the project's architecture.

#### 5. Code Quality Standards

-   Write all code in TypeScript with proper type definitions.
-   Use meaningful English variable and function names.
-   Implement proper error handling and validation.
-   Follow the established code organization patterns.
-   Ensure all code is properly documented with comments in English.

#### 6. Testing and Validation

-   Test all functionality thoroughly before marking as complete.
-   Verify responsive design on different screen sizes.
-   Check accessibility compliance.
-   Validate that all user-facing text is in Czech.
-   Ensure error handling works correctly.

#### 7. Task Completion

A task can only be marked as complete if:

-   Everything functions according to the requirements and is error-free.
-   The code complies with the project structure and coding standards.
-   The UI/UX is 100% consistent with the specifications in `docs/design_guidelines.md`.
-   There are no warnings or errors in the browser console or server logs.
-   All items on the TODO list (if one was created) are checked off.
-   The implementation follows the language rules (Czech UI, English code).

---

### 🧷 Priority of Reference Files

1.  `Docs/implementation_plan.md` – Current development phase and specific tasks.
2.  The current task description (from the implementation plan).
3.  `Docs/design_guidelines.md` – Rules for design, colors, and UI components.
4.  `Docs/project_structure.md` – The approved project structure and architecture.
5.  `Docs/context.aisc` – The main context rules for AI generation.
6.  `PRD.md` – Product requirements and business goals.

---

## 🧱 Critical Rules

-   **NEVER** start writing code without reading the relevant documentation.
-   **NEVER** mark a task as done without thoroughly testing its functionality.
-   **NEVER** violate the defined folder structure or code conventions.
-   **NEVER** make a design decision that conflicts with `docs/design_guidelines.md`.
-   **NEVER** use English text in user-facing UI elements.
-   **NEVER** use Czech text in code, comments, or technical documentation.
-   **ALWAYS** follow the defined workflow and reference the correct documentation.
-   **ALWAYS** ensure responsive design works on all target devices.
-   **ALWAYS** implement proper error handling and validation.

---

## 📋 Development Phases

### Phase 1: Project Foundation & Environment Setup
-   Set up monorepo structure
-   Generate all documentation
-   Initialize backend and frontend projects
-   Configure development environment

### Phase 2: Backend & Database (without AI)
-   Design and implement database schema
-   Create authentication system
-   Implement credit system logic
-   Create mock AI API endpoint

### Phase 3: Frontend Development & UI
-   Build authentication pages
-   Develop main dashboard
-   Create AI chat component
-   Integrate with backend API

### Phase 4: Foundation Testing & Polish
-   End-to-end application testing
-   UI/UX review and polish
-   Bug fixes and optimizations

### Phase 5: AI Integration
-   Implement live AI connection
-   Handle dynamic responses
-   Fine-tune system prompts

### Phase 6: Final Testing & Launch
-   Final end-to-end testing
-   Production environment setup
-   Deployment and pilot user onboarding

---

## 🔧 Technical Workflow

### Backend Development
1.  Define API endpoints and data structures
2.  Implement database models and migrations
3.  Create controllers and business logic
4.  Add middleware for authentication and validation
5.  Write tests for all endpoints
6.  Document API endpoints

### Frontend Development
1.  Create UI components following design guidelines
2.  Implement responsive layouts
3.  Add state management and API integration
4.  Implement form validation and error handling
5.  Test on different devices and browsers
6.  Optimize performance and accessibility

### Integration Workflow
1.  Ensure API contracts are well-defined
2.  Implement proper error handling on both sides
3.  Test end-to-end user flows
4.  Validate data consistency
5.  Optimize for performance

---

## 🚀 Quality Assurance Checklist

Before marking any task as complete, verify:

### Code Quality
- [ ] TypeScript types are properly defined
- [ ] No console errors or warnings
- [ ] Proper error handling implemented
- [ ] Code follows project conventions
- [ ] All functions are properly documented

### UI/UX Quality
- [ ] Design matches guidelines exactly
- [ ] All text is in Czech language
- [ ] Responsive design works on all devices
- [ ] Accessibility standards are met
- [ ] Interactive elements have proper focus states

### Functionality
- [ ] All features work as specified
- [ ] Error states are handled gracefully
- [ ] Loading states are implemented
- [ ] Data validation is working
- [ ] User flows are complete and intuitive

### Performance
- [ ] Page load times are acceptable
- [ ] API responses are optimized
- [ ] Bundle sizes are reasonable
- [ ] No memory leaks
- [ ] Efficient database queries

---

🧠 **Note:** Every decision you make must support the overall project goal: to build a professional, consistent, and easily maintainable SaaS platform that **effectively helps teachers save time, simplifies lesson preparation, and provides a valuable, modern tool for schools.**

## 📞 Communication Protocol

When working on tasks:
1.  Clearly announce which task you are starting
2.  Document any decisions or changes made
3.  Report progress and any blockers encountered
4.  Request clarification if requirements are unclear
5.  Validate completion criteria before marking tasks as done

---

**Remember**: Consistency, quality, and user experience are paramount. The platform must feel professional and trustworthy from day one. 