import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { ArrowLeft, Search, Calendar, BookOpen, CheckCircle2, XCircle, Filter } from 'lucide-react';

interface ArchiveProps {
  onBack: () => void;
}

export function Archive({ onBack }: ArchiveProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock data for archived questions
  const archivedQuestions = [
    {
      id: '1',
      question: '경제학에서 말하는 "기회비용"의 정확한 정의는 무엇인가?',
      chapter: '경제학 개론',
      userAnswer: '선택하지 않은 대안 중 가장 가치 있는 것의 가치',
      correctAnswer: '선택하지 않은 대안 중 가장 가치 있는 것의 가치',
      isCorrect: true,
      difficulty: 'easy',
      solvedDate: '2024-01-16',
      timeSpent: '45초',
      mode: 'quiz'
    },
    {
      id: '2',
      question: '완전경쟁시장의 특징이 아닌 것은?',
      chapter: '경제학 개론',
      userAnswer: '다수의 공급자와 수요자',
      correctAnswer: '정보의 비대칭성',
      isCorrect: false,
      difficulty: 'medium',
      solvedDate: '2024-01-15',
      timeSpent: '1분 20초',
      mode: 'quiz'
    },
    {
      id: '3',
      question: 'GDP(국내총생산)에 포함되지 않는 것은?',
      chapter: '경제학 개론',
      userAnswer: '중고차 판매',
      correctAnswer: '중고차 판매',
      isCorrect: true,
      difficulty: 'medium',
      solvedDate: '2024-01-14',
      timeSpent: '2분 10초',
      mode: 'study'
    },
    {
      id: '4',
      question: '현재가치 계산에 사용되는 할인율이 높아지면?',
      chapter: '재무관리',
      userAnswer: '현재가치가 낮아진다',
      correctAnswer: '현재가치가 낮아진다',
      isCorrect: true,
      difficulty: 'medium',
      solvedDate: '2024-01-13',
      timeSpent: '1분 35초',
      mode: 'quiz'
    },
    {
      id: '5',
      question: '마케팅 믹스의 4P에 포함되지 않는 것은?',
      chapter: '마케팅 원론',
      userAnswer: 'People',
      correctAnswer: 'People',
      isCorrect: true,
      difficulty: 'easy',
      solvedDate: '2024-01-12',
      timeSpent: '30초',
      mode: 'study'
    },
    {
      id: '6',
      question: '회계등식의 기본 형태는?',
      chapter: '회계학 기초',
      userAnswer: '자산 = 부채 + 자본',
      correctAnswer: '자산 = 부채 + 자본',
      isCorrect: true,
      difficulty: 'easy',
      solvedDate: '2024-01-11',
      timeSpent: '25초',
      mode: 'quiz'
    }
  ];

  const chapters = ['경제학 개론', '재무관리', '마케팅 원론', '회계학 기초', '경영학 원론', '경영통계'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Filter and sort questions
  const filteredQuestions = archivedQuestions
    .filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.chapter.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChapter = selectedChapter === 'all' || q.chapter === selectedChapter;
      const matchesResult = selectedResult === 'all' || 
                           (selectedResult === 'correct' && q.isCorrect) ||
                           (selectedResult === 'wrong' && !q.isCorrect);
      
      return matchesSearch && matchesChapter && matchesResult;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.solvedDate).getTime() - new Date(a.solvedDate).getTime();
        case 'chapter':
          return a.chapter.localeCompare(b.chapter);
        case 'difficulty':
          const difficultyOrder: Record<string, number> = { 'easy': 1, 'medium': 2, 'hard': 3 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        default:
          return 0;
      }
    });

  const stats = {
    total: archivedQuestions.length,
    correct: archivedQuestions.filter(q => q.isCorrect).length,
    wrong: archivedQuestions.filter(q => !q.isCorrect).length,
    accuracy: Math.round((archivedQuestions.filter(q => q.isCorrect).length / archivedQuestions.length) * 100)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl">문제 아카이브</h2>
            <p className="text-muted-foreground">지금까지 풀었던 모든 문제를 확인하세요</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">총 문제</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">{stats.correct}</div>
            <div className="text-sm text-muted-foreground">정답</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1">{stats.wrong}</div>
            <div className="text-sm text-muted-foreground">오답</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">{stats.accuracy}%</div>
            <div className="text-sm text-muted-foreground">정답률</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>필터 및 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="문제 또는 단원 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger>
                <SelectValue placeholder="단원 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 단원</SelectItem>
                {chapters.map(chapter => (
                  <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedResult} onValueChange={setSelectedResult}>
              <SelectTrigger>
                <SelectValue placeholder="결과 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 결과</SelectItem>
                <SelectItem value="correct">정답만</SelectItem>
                <SelectItem value="wrong">오답만</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">날짜순</SelectItem>
                <SelectItem value="chapter">단원순</SelectItem>
                <SelectItem value="difficulty">난이도순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>검색 결과 ({filteredQuestions.length}개)</h3>
        </div>

        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">검색 조건에 맞는 문제가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">{question.chapter}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{question.mode === 'quiz' ? '퀴즈' : '문제집'}</Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {getDifficultyText(question.difficulty)}
                      </Badge>
                      {question.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{question.question}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {question.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">내 답안</span>
                      </div>
                      <div className={`p-3 border rounded-lg ${
                        question.isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        {question.userAnswer}
                      </div>
                    </div>
                    
                    {!question.isCorrect && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm">정답</span>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          {question.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{question.solvedDate}</span>
                      </div>
                      <span>소요시간: {question.timeSpent}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      alert('이 문제를 다시 풀어보겠습니다.');
                    }}>
                      다시 풀기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}