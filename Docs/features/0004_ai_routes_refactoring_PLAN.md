# Feature Plan: AI Routes Refactoring

## 1. Feature Analysis

The current `backend/src/routes/ai.ts` file has grown to over 3,000 lines of code, making it difficult to maintain, test, and extend. The file contains multiple distinct responsibilities that should be separated for better code organization and maintainability.

### Current Structure Analysis

The file currently contains:
- **12 route handlers** (chat, stats, features, 6 generators, batch, analysis, suggestions)
- **4 system prompts** (general, project, presentation, activity)
- **7 utility functions** (SSE handling, content escaping, tag derivation, structure construction)
- **1 factory function** for creating routes with MCP server
- **Multiple imports** from various services and models

### Core Problems

1. **Single Responsibility Principle Violation**: The file handles chat, statistics, generation, analysis, and utility functions
2. **Testing Complexity**: Testing individual generators requires loading the entire 3K+ line file
3. **Code Duplication**: Similar patterns repeated across generators with slight variations
4. **Poor Developer Experience**: Finding specific functionality is time-consuming
5. **Merge Conflicts Risk**: Multiple developers working on different generators create conflicts
6. **Maintainability Issues**: Changes to one generator can accidentally affect others

## 2. Technical Specification

### Affected Stack
- **Backend**: Complete restructuring of AI routes
- **File Structure**: New directory organization under `backend/src/routes/ai/`
- **Testing**: Updated test files to match new structure
- **Imports**: Updated import statements across the codebase

### New Directory Structure

```
backend/src/routes/ai/
├── index.ts                     # Main router combiner (50 lines)
├── chat.ts                      # Chat functionality (200 lines)
├── statistics.ts                # Stats and features (150 lines)
├── analysis.ts                  # Assignment analysis and suggestions (250 lines)
└── generators/
    ├── index.ts                 # Generator router combiner (100 lines)
    ├── worksheet.ts             # Worksheet generation (350 lines)
    ├── lesson-plan.ts           # Lesson plan generation (400 lines)
    ├── quiz.ts                  # Quiz generation (350 lines)
    ├── project.ts               # Project generation (350 lines)
    ├── presentation.ts          # Presentation generation (300 lines)
    ├── activity.ts              # Activity generation (300 lines)
    └── batch.ts                 # Batch generation (400 lines)

backend/src/services/ai-generation/
├── system-prompts.ts            # All system prompts (200 lines)
├── sse-utils.ts                # SSE streaming utilities (100 lines)
├── credit-handler.ts           # Credit deduction logic (150 lines)
├── structure-builders.ts       # Basic structure construction functions (400 lines)
├── validators.ts               # Content validation functions (200 lines)
├── response-parsers.ts         # AI response parsing logic (300 lines)
└── common-patterns.ts          # Shared generation patterns (250 lines)
```

### Key Files to Create

1. **`backend/src/routes/ai/index.ts`**
   - Main router that combines all sub-routers
   - Factory function for MCP server integration
   - Minimal logic, mostly routing delegation

2. **`backend/src/routes/ai/chat.ts`**
   - `/chat` endpoint
   - Real-time streaming chat functionality
   - Message saving and conversation management

3. **`backend/src/routes/ai/statistics.ts`**
   - `/stats` endpoint
   - `/features` endpoint
   - Usage statistics and feature availability

4. **`backend/src/routes/ai/analysis.ts`**
   - `/analyze-assignment` endpoint
   - `/suggest-material-types` endpoint
   - Assignment analysis and material suggestions

5. **`backend/src/routes/ai/generators/index.ts`**
   - Combines all generator routes
   - Shared generator middleware and utilities

6. **Individual Generator Files**
   - Each generator in its own file
   - Shared patterns extracted to common utilities
   - Consistent structure across all generators

7. **`backend/src/services/ai-generation/` Files**
   - Extracted utilities and shared logic
   - Reusable components across generators
   - Better separation of concerns

### API Endpoints (No Changes)

All existing API endpoints remain unchanged to maintain backward compatibility:
- `POST /api/ai/chat`
- `GET /api/ai/stats`
- `GET /api/ai/features`
- `POST /api/ai/generate-worksheet`
- `POST /api/ai/generate-lesson-plan`
- `POST /api/ai/generate-quiz`
- `POST /api/ai/generate-project`
- `POST /api/ai/generate-presentation`
- `POST /api/ai/generate-activity`
- `POST /api/ai/generate-batch`
- `POST /api/ai/analyze-assignment`
- `POST /api/ai/suggest-material-types`

### Shared Utility Functions

Extract these utility functions to `backend/src/services/ai-generation/`:

1. **`sse-utils.ts`**
   - `sendSSEMessage()`
   - `escapeSSEContent()`
   - SSE header setup utilities

2. **`credit-handler.ts`**
   - Credit checking logic
   - Credit deduction patterns
   - User balance validation

3. **`structure-builders.ts`**
   - `constructBasicProjectStructure()`
   - `constructBasicPresentationStructure()`
   - `constructBasicActivityStructure()`
   - Generic fallback structure builders

4. **`validators.ts`**
   - Content validation patterns
   - JSON parsing with error handling
   - Data structure validation

5. **`system-prompts.ts`**
   - All system prompts in organized exports
   - Prompt building utilities
   - Prompt customization functions

6. **`common-patterns.ts`**
   - Common generator patterns
   - Shared initialization logic
   - Metadata building utilities

### Database Schema
No database changes required - this is purely a code organization refactoring.

## 3. Implementation Phases

### Phase 1: Extract Shared Utilities (Data Layer)
**Estimated Time**: 1-2 days

1. **Create Services Directory Structure**
   - Create `backend/src/services/ai-generation/` directory
   - Set up index files for exports

2. **Extract System Prompts**
   - Move all system prompts to `system-prompts.ts`
   - Create organized exports with clear naming
   - Update imports where needed

3. **Extract SSE Utilities**
   - Move SSE functions to `sse-utils.ts`
   - Add proper TypeScript types
   - Create reusable SSE setup function

4. **Extract Credit Handling**
   - Move credit logic to `credit-handler.ts`
   - Create standardized credit checking functions
   - Implement consistent error responses

5. **Extract Structure Builders**
   - Move all `constructBasic*Structure` functions
   - Create generic structure building patterns
   - Add proper error handling and logging

6. **Extract Common Validation**
   - Move shared validation logic
   - Create reusable parsing utilities
   - Implement consistent error handling

### Phase 2A: Split Route Handlers (Parallel Development)
**Estimated Time**: 2-3 days

1. **Create Main Router Structure**
   - Create `backend/src/routes/ai/index.ts`
   - Implement factory function pattern
   - Set up sub-router imports

2. **Extract Chat Functionality**
   - Move `/chat` endpoint to `chat.ts`
   - Update imports to use new utilities
   - Ensure streaming functionality works

3. **Extract Statistics**
   - Move `/stats` and `/features` to `statistics.ts`
   - Simplify logic using extracted utilities
   - Maintain API compatibility

4. **Extract Analysis Endpoints**
   - Move analysis endpoints to `analysis.ts`
   - Use extracted utilities
   - Maintain response formats

### Phase 2B: Split Generator Routes (Parallel Development)
**Estimated Time**: 3-4 days

1. **Create Generator Router Structure**
   - Create `backend/src/routes/ai/generators/index.ts`
   - Set up common generator middleware
   - Create shared generator patterns

2. **Extract Individual Generators**
   - Move each generator to its own file
   - Use extracted utilities and patterns
   - Maintain identical functionality

3. **Extract Batch Generator**
   - Move batch generation logic
   - Ensure all material types work
   - Maintain progress tracking

4. **Update Generator Imports**
   - Update all imports to use new utilities
   - Ensure no circular dependencies
   - Test each generator independently

### Phase 3: Testing and Cleanup
**Estimated Time**: 1-2 days

1. **Update Test Files**
   - Update import statements in test files
   - Create specific tests for utilities
   - Ensure all existing tests pass

2. **Update Main Route Registration**
   - Update `backend/src/index.ts` imports
   - Ensure factory function works correctly
   - Test MCP server integration

3. **Remove Original File**
   - Delete `backend/src/routes/ai.ts`
   - Update any remaining imports
   - Verify no broken references

4. **Documentation Updates**
   - Update README files
   - Document new structure
   - Create migration notes

### Phase 4: Optimization and Enhancement
**Estimated Time**: 1 day

1. **Performance Optimization**
   - Optimize import statements
   - Reduce bundle size
   - Improve loading times

2. **Code Quality Improvements**
   - Add comprehensive TypeScript types
   - Improve error handling
   - Add JSDoc documentation

3. **Testing Enhancements**
   - Add unit tests for utilities
   - Create integration tests
   - Improve test coverage

## 4. Expected Benefits

### Developer Experience
- **Faster Navigation**: Find specific functionality in seconds, not minutes
- **Easier Testing**: Test individual components in isolation
- **Reduced Conflicts**: Multiple developers can work on different generators
- **Better Code Reviews**: Smaller, focused changes in individual files

### Maintainability
- **Single Responsibility**: Each file has one clear purpose
- **Code Reuse**: Shared utilities eliminate duplication
- **Easier Debugging**: Issues isolated to specific components
- **Simpler Extension**: Adding new generators follows clear patterns

### Performance
- **Faster Loading**: IDE loads smaller files more quickly
- **Better Tree Shaking**: Unused utilities can be eliminated
- **Reduced Memory**: Individual components use less memory
- **Faster Compilation**: TypeScript processes smaller files faster

### Code Quality
- **Consistent Patterns**: Shared utilities enforce consistency
- **Better Types**: More specific TypeScript types per component
- **Clearer Dependencies**: Explicit imports show relationships
- **Improved Documentation**: Focused documentation per component

## 5. Risk Mitigation

### Backward Compatibility
- All API endpoints remain unchanged
- Response formats stay identical
- No breaking changes for frontend

### Testing Strategy
- Run full test suite after each phase
- Test individual components after extraction
- Maintain integration test coverage

### Rollback Plan
- Keep original file until testing complete
- Use feature branch for development
- Gradual migration approach allows easy rollback

### Error Handling
- Maintain existing error responses
- Improve error isolation per component
- Add better logging for debugging

## 6. Success Criteria

### File Size Targets
- No individual file over 500 lines
- Most files between 150-350 lines
- Utilities under 200 lines each

### Performance Metrics
- No regression in response times
- Faster IDE performance
- Reduced memory usage during development

### Developer Productivity
- 50% reduction in time to find specific functionality
- Easier addition of new generators
- Reduced merge conflicts

### Code Quality
- 100% test coverage maintained
- No TypeScript errors
- Consistent code patterns across all generators

This refactoring will transform the monolithic ai.ts file into a well-organized, maintainable codebase that follows best practices and significantly improves developer experience while maintaining full backward compatibility.
