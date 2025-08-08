import { useState } from 'react';
import { Home } from './components/Home';
import { QuizMode } from './components/QuizMode';
import { StudyMode } from './components/StudyMode';
import { WrongAnswers } from './components/WrongAnswers';
import { Archive } from './components/Archive';
import { ChapterSelect } from './components/ChapterSelect';
import { Navigation } from './components/Navigation';

type View = 'home' | 'quiz' | 'study' | 'wrong-answers' | 'archive' | 'chapter-select';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  const handleChapterSelect = (chapter: string) => {
    setSelectedChapter(chapter);
    setCurrentView('quiz');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={setCurrentView} />;
      case 'quiz':
        return <QuizMode onBack={() => setCurrentView('home')} chapter={selectedChapter} />;
      case 'study':
        return <StudyMode onBack={() => setCurrentView('home')} chapter={selectedChapter} />;
      case 'wrong-answers':
        return <WrongAnswers onBack={() => setCurrentView('home')} />;
      case 'archive':
        return <Archive onBack={() => setCurrentView('home')} />;
      case 'chapter-select':
        return <ChapterSelect 
          onBack={() => setCurrentView('home')} 
          onChapterSelect={handleChapterSelect}
          mode="quiz"
        />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      <main className="container mx-auto px-4 py-6">
        {renderView()}
      </main>
    </div>
  );
}