import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Brain, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { QuizModeView } from './QuizModeView';
import { WorkbookModeView } from './WorkbookModeView';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  chapter?: string;
  section?: string;
}

interface QuizResponse {
  success: boolean;
  quiz: QuizQuestion[];
  subject: string;
  difficulty: string;
  numQuestions: number;
  generatedAt: string;
  error?: string;
}

const DBQuizGenerator: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [mode, setMode] = useState<'quiz' | 'workbook'>('quiz');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentView, setCurrentView] = useState<'generator' | 'quiz' | 'workbook'>('generator');

  const generateQuiz = async () => {
    if (!subject) {
      setError('과목을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setQuiz([]);
    setSelectedAnswers([]);
    setShowResults(false);

    try {
      const response = await fetch('/api/quiz/generate-from-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject,
          difficulty,
          numQuestions: parseInt(numQuestions.toString()),
          isRandom: subject === '랜덤',
        }),
      });

      const data: QuizResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '퀴즈 생성에 실패했습니다.');
      }

      if (data.success && data.quiz) {
        setQuiz(data.quiz);
        setSelectedAnswers(new Array(data.quiz.length).fill(-1));
        // 모드에 따라 뷰 변경
        setCurrentView(mode);
      } else {
        throw new Error('퀴즈 데이터를 받아오지 못했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuiz([]);
    setSelectedAnswers([]);
    setShowResults(false);
    setCurrentView('generator');
  };

  const handleSaveQuiz = async (quizData: QuizQuestion[], quizMode: string) => {
    try {
      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          title: `${subject} ${getDifficultyText(difficulty)} 퀴즈`,
          subject: subject,
          difficulty,
          questions: quizData,
          mode: quizMode,
          isRandom: subject === '랜덤'
        }),
      });

      if (response.ok) {
        alert('퀴즈가 성공적으로 저장되었습니다!');
      } else if (response.status === 401) {
        alert('로그인이 필요합니다. 먼저 로그인해주세요.');
      } else {
        alert('퀴즈 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 저장 오류:', error);
      alert('퀴즈 저장 중 오류가 발생했습니다.');
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '보통';
    }
  };



  // 퀴즈 모드 뷰
  if (currentView === 'quiz' && quiz.length > 0) {
    return (
      <QuizModeView
        quiz={quiz}
        subject={subject}
        difficulty={difficulty}
        onBack={resetQuiz}
        onSave={handleSaveQuiz}
      />
    );
  }

  // 문제집 모드 뷰
  if (currentView === 'workbook' && quiz.length > 0) {
    return (
      <WorkbookModeView
        quiz={quiz}
        subject={subject}
        difficulty={difficulty}
        onBack={resetQuiz}
        onSave={handleSaveQuiz}
      />
    );
  }

  // 퀴즈 생성기 뷰
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            AI 매경 퀴즈 생성기
          </CardTitle>
          <CardDescription>
            교재 내용을 기반으로 매일경제 테스트 퀴즈를 AI가 자동으로 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">과목</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="과목을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="랜덤">🎲 랜덤 과목</SelectItem>
                  <SelectItem value="경영">📚 경영</SelectItem>
                  <SelectItem value="경제">💰 경제</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">난이도</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 쉬움</SelectItem>
                  <SelectItem value="medium">🟡 보통</SelectItem>
                  <SelectItem value="hard">🔴 어려움</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numQuestions">문제 수</Label>
              <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3문제</SelectItem>
                  <SelectItem value="5">5문제</SelectItem>
                  <SelectItem value="10">10문제</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">풀이 모드</Label>
              <Select value={mode} onValueChange={(value: 'quiz' | 'workbook') => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">📝 퀴즈 모드</SelectItem>
                  <SelectItem value="workbook">📖 문제집 모드</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateQuiz} 
            disabled={loading || !subject}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                퀴즈 생성 중...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                퀴즈 생성하기
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DBQuizGenerator;

