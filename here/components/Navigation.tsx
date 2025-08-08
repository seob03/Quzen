import { Button } from './ui/button';
import { Home, BookOpen, FileText, AlertCircle, Archive, Brain } from 'lucide-react';

type View = 'home' | 'quiz' | 'study' | 'wrong-answers' | 'archive' | 'chapter-select';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold text-primary">Quzen</h1>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>홈</span>
            </Button>
            <Button
              variant={currentView === 'wrong-answers' ? 'default' : 'ghost'}
              onClick={() => onNavigate('wrong-answers')}
              className="flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>오답노트</span>
            </Button>
            <Button
              variant={currentView === 'archive' ? 'default' : 'ghost'}
              onClick={() => onNavigate('archive')}
              className="flex items-center space-x-2"
            >
              <Archive className="w-4 h-4" />
              <span>아카이브</span>
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => onNavigate('home')}
              size="sm"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}