import { useState } from 'react';
import { Home } from './components/Home';
import { WrongAnswers } from './components/WrongAnswers';
import { Archive } from './components/Archive';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import DBQuizGenerator from './components/DBQuizGenerator';

type View = 'home' | 'wrong-answers' | 'archive' | 'login' | 'db-quiz-generator';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={setCurrentView} />;
      case 'wrong-answers':
        return <WrongAnswers onBack={() => setCurrentView('home')} />;
      case 'archive':
        return <Archive onBack={() => setCurrentView('home')} />;
      case 'login':
        return <Login />;
      case 'db-quiz-generator':
        return <DBQuizGenerator />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onNavigate={(view: View) => setCurrentView(view)} />
      <main className="container mx-auto px-4 py-6">
        {renderView()}
      </main>
    </div>
  );
}