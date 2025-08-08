# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Start development server on http://localhost:3000
- `npm test` - Run test suite in interactive watch mode
- `npm run build` - Build production bundle to `build/` folder
- `npm run eject` - Eject from Create React App (one-way operation)

### Docker Commands
- `docker build -t quzen-fe .` - Build production Docker image
- `docker run -p 80:80 quzen-fe` - Run containerized app on port 80

## Application Architecture

### Core Application Structure
This is a React 19+ TypeScript quiz application called "Quzen" for Korean test preparation (매경 TEST). The app follows a single-page application pattern with view-based routing managed by local state.

### State Management Pattern
- Uses React useState for view navigation and component state
- Central App component manages view routing with `currentView` state
- View types: 'home' | 'quiz' | 'study' | 'wrong-answers' | 'archive' | 'chapter-select'
- Chapter selection flows through App component state

### Component Architecture
- **App.tsx**: Main router component managing view state and chapter selection
- **Navigation.tsx**: Sticky top navigation with responsive design
- **Home.tsx**: Dashboard with progress tracking and quick actions
- **QuizMode.tsx**: Interactive quiz with timer, scoring, and explanations
- **StudyMode.tsx**: Study/practice mode component
- **WrongAnswers.tsx**: Review incorrect answers
- **Archive.tsx**: View previously completed quizzes
- **ChapterSelect.tsx**: Chapter selection interface

### UI System
- Uses shadcn/ui component library with Tailwind CSS
- Components located in `src/components/ui/`
- Utility function `cn()` in `ui/utils.ts` combines clsx and tailwind-merge
- Icons from Lucide React library
- Responsive design with mobile-first approach

### Key Data Structures
```typescript
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### Styling Conventions
- Tailwind CSS for all styling
- Uses CSS custom properties for theming (bg-background, text-muted-foreground, etc.)
- Consistent spacing with space-y-* and gap-* utilities
- Card-based layout pattern throughout the app

### Mock Data Pattern
Components currently use mock data arrays for demonstration. When implementing backend integration, replace mock data with API calls while maintaining the same data structures.

### Timer Implementation
QuizMode includes a countdown timer system with automatic question submission when time expires. Timer state is managed with useEffect hooks and cleared properly on component unmount.