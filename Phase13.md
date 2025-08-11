# EduAI-Asistent - Phase 13 Implementation Context

## �� **Project Overview**
You are working on **EduAI-Asistent**, a multi-tenant SaaS platform for Czech education that provides AI-powered math assistants to help teachers streamline their workflow. This is a monorepo with React frontend and Node.js backend.

## 🏗️ **Current Architecture**
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **AI Integration**: OpenAI API with math-focused prompts
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Database**: PostgreSQL with users, schools, conversations, materials tables

## 📍 **Current Status**
- **Completed Phases**: 1-12 (Foundation through School Administration & Library)
- **Current Phase**: 13 - Enhanced Math Assistant & User Experience
- **Timeline**: Week 20-21
- **Goal**: Significantly enhance math assistant capabilities and improve user experience

## 🔧 **Key Technical Context**

### **Frontend Structure**
- Main pages: Dashboard, Chat, Materials, Profile, School Admin
- Components: ChatWindow, MessageInput, ChatSidebar, WorksheetDisplay
- Contexts: AuthContext, ThemeContext, ToastContext
- Services: apiClient, assistantService, conversationService

### **Backend Structure**
- Routes: `/api/ai/chat`, `/api/ai/generate-worksheet`, `/api/auth/*`, `/api/users/*`
- Models: User, Conversation, Message, GeneratedFile, School
- Middleware: JWT authentication, role-based access control
- AI Integration: OpenAI GPT models with Czech math-focused prompts

### **Current AI Implementation**
- System prompt in Czech for math tutoring
- Credit-based usage (1 credit per message)
- Worksheet generation with JSON output
- Basic conversation history and file management

## 🎯 **Phase 13 Objectives**

### **13.1 Math Assistant Improvements**
- [ ] Integrate KaTeX/MathJax for mathematical notation
- [ ] Enhance AI prompts for step-by-step solutions
- [ ] Implement math topic categorization system
- [ ] Add practice mode with progress tracking
- [ ] Create difficulty progression system

### **13.2 Enhanced Chat Experience**
- [ ] Add image upload for math problems (OCR)
- [ ] Implement PDF export functionality
- [ ] Add collaborative chat features
- [ ] Create chat templates for common topics

### **13.3 User Experience Enhancements**
- [ ] Advanced keyboard shortcuts
- [ ] Comprehensive help system
- [ ] User preference settings
- [ ] Accessibility features

## 🚀 **Implementation Guidelines**

### **Code Standards**
- All user-facing text in Czech (`cs-CZ`)
- Code, comments, and technical docs in English
- Follow existing component patterns and naming conventions
- Use TypeScript strictly with proper type definitions
- Implement proper error handling and loading states

### **Design System**
- Use existing Tailwind CSS classes and design tokens
- Follow the established color scheme and typography
- Maintain dark mode compatibility
- Ensure responsive design for all new features

### **Performance Considerations**
- Implement lazy loading for heavy features
- Use React.memo and useCallback where appropriate
- Optimize database queries and API responses
- Implement proper caching strategies

## 🔍 **Key Files to Understand**

### **Frontend Core**
- `frontend/src/pages/chat/ChatPage.tsx` - Main chat interface
- `frontend/src/components/chat/` - Chat-related components
- `frontend/src/services/assistantService.ts` - AI service integration
- `frontend/src/contexts/AuthContext.tsx` - User authentication state

### **Backend Core**
- `backend/src/routes/ai.ts` - AI endpoints and OpenAI integration
- `backend/src/models/` - Database models and queries
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/types/database.ts` - TypeScript type definitions

## 🎨 **UI/UX Patterns**
- Use existing Button, Card, Modal, and Input components
- Follow the established spacing system (4px base unit)
- Implement consistent loading states and error handling
- Use Lucide React icons for consistency
- Maintain the glassy gradient aesthetic from the dashboard

## 🔒 **Security & Permissions**
- All new endpoints must use authentication middleware
- Implement proper role-based access control
- Validate all user inputs and file uploads
- Ensure credit system integrity for AI features

## �� **Responsiveness & Accessibility**
- Ensure all new features work on mobile devices
- Implement proper ARIA labels and keyboard navigation
- Maintain WCAG AA contrast standards
- Test with screen readers and keyboard-only navigation

## 🚀 **Next Steps for Phase 13**
1. Start with **13.1 Math Assistant Improvements** - integrate KaTeX/MathJax
2. Enhance AI prompts for better step-by-step solutions
3. Implement math topic categorization system
4. Move to **13.2 Enhanced Chat Experience** features
5. Finally implement **13.3 User Experience Enhancements**

## 💡 **Innovation Opportunities**
- Consider implementing a math problem solver that shows work
- Add visual math tools (graphs, diagrams, geometric shapes)
- Implement adaptive difficulty based on user performance
- Create interactive math exercises with immediate feedback

---

**Remember**: You're building on a solid foundation. Focus on enhancing the existing math assistant capabilities while maintaining the high-quality user experience already established. All new features should integrate seamlessly with the current system.