import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Search, Calendar, BookOpen, CheckCircle2, XCircle, Filter, Eye } from 'lucide-react';

interface ArchiveProps {
  onBack: () => void;
}

interface QuizResult {
  questionIndex: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  subject: string;
  difficulty: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
  results?: QuizResult[];
  completedAt?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  createdAt: string;
  mode: string;
}

export function Archive({ onBack }: ArchiveProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [groupedQuizzes, setGroupedQuizzes] = useState<Record<string, Quiz[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quiz/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
        setGroupedQuizzes(data.groupedQuizzes || {});
      } else {
        console.error('퀴즈 목록 조회 실패');
      }
    } catch (error) {
      console.error('퀴즈 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || quiz.subject === selectedSubject;
      const matchesResult = selectedResult === 'all' || 
                           (selectedResult === 'completed' && quiz.results && quiz.results.length > 0) ||
                           (selectedResult === 'incomplete' && (!quiz.results || quiz.results.length === 0));
      
      return matchesSearch && matchesSubject && matchesResult;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'subject':
          return a.subject.localeCompare(b.subject);
        case 'difficulty':
          const difficultyOrder: Record<string, number> = { 'easy': 1, 'medium': 2, 'hard': 3 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        default:
          return 0;
      }
    });

  const stats = {
    total: quizzes.length,
    completed: quizzes.filter(q => q.results && q.results.length > 0).length,
    incomplete: quizzes.filter(q => !q.results || q.results.length === 0).length,
    averageScore: quizzes.filter(q => q.score && q.results && q.results.length > 0).length > 0 
      ? Math.round(quizzes.filter(q => q.score && q.results && q.results.length > 0).reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.filter(q => q.score && q.results && q.results.length > 0).length)
      : 0
  };

  const subjects = Array.from(new Set(quizzes.map(q => q.subject)));

  const handleViewDetail = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
        <div className="text-center py-8">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

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
            <div className="text-sm text-muted-foreground">총 퀴즈</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">완료된 퀴즈</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">{stats.incomplete}</div>
            <div className="text-sm text-muted-foreground">미완료 퀴즈</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">{stats.averageScore}%</div>
            <div className="text-sm text-muted-foreground">평균 점수</div>
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
                placeholder="퀴즈 제목 또는 과목 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="과목 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 과목</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedResult} onValueChange={setSelectedResult}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="completed">완료된 퀴즈</SelectItem>
                <SelectItem value="incomplete">미완료 퀴즈</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">날짜순</SelectItem>
                <SelectItem value="subject">과목순</SelectItem>
                <SelectItem value="difficulty">난이도순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>검색 결과 ({filteredQuizzes.length}개)</h3>
        </div>

        {filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">검색 조건에 맞는 퀴즈가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">{quiz.subject}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{quiz.mode === 'quiz' ? '퀴즈' : '문제집'}</Badge>
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {getDifficultyText(quiz.difficulty)}
                      </Badge>
                      {quiz.results && quiz.results.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium">{quiz.score}%</span>
                        </div>
                      ) : quiz.completedAt ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium">완료됨</span>
                        </div>
                      ) : (
                        <Badge variant="secondary">미완료</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{quiz.title}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetail(quiz)}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>상세보기</span>
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">문제 수</span>
                      <p className="font-medium">{quiz.questions.length}문제</p>
                    </div>
                    
                    {quiz.results && (
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">정답률</span>
                                                 <div className="flex items-center space-x-2">
                           <p className="font-medium">{quiz.correctAnswers}/{quiz.totalQuestions} ({quiz.score}%)</p>
                           <div className="flex items-center space-x-1">
                             <span className="text-green-600 text-sm">✓{quiz.correctAnswers || 0}</span>
                             <span className="text-red-600 text-sm">✗{(quiz.totalQuestions || 0) - (quiz.correctAnswers || 0)}</span>
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(quiz.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                      {quiz.completedAt && (
                        <span>완료: {new Date(quiz.completedAt).toLocaleDateString('ko-KR')}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedQuiz && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">과목</span>
                  <p className="font-medium">{selectedQuiz.subject}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">난이도</span>
                  <Badge className={getDifficultyColor(selectedQuiz.difficulty)}>
                    {getDifficultyText(selectedQuiz.difficulty)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">모드</span>
                  <Badge variant="outline">{selectedQuiz.mode === 'quiz' ? '퀴즈' : '문제집'}</Badge>
                </div>
              </div>

              {selectedQuiz.results && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">퀴즈 결과</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">점수</span>
                      <p className="text-2xl font-bold">{selectedQuiz.score}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">정답</span>
                      <p className="text-2xl font-bold text-green-600">{selectedQuiz.correctAnswers}/{selectedQuiz.totalQuestions}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">완료 시간</span>
                      <p className="text-sm">{new Date(selectedQuiz.completedAt!).toLocaleString('ko-KR')}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">문제 상세</h4>
                {selectedQuiz.questions.map((question, index) => {
                  const result = selectedQuiz.results?.[index];
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">문제 {index + 1}</span>
                          {result && (
                            result.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>{question.question}</p>
                        
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-3 border rounded-lg ${
                                result ? (
                                  optionIndex === question.correctAnswer
                                    ? 'bg-green-50 border-green-200'
                                    : optionIndex === result.userAnswer && !result.isCorrect
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-gray-50 border-gray-200'
                                ) : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                <span>{option}</span>
                                {result && optionIndex === question.correctAnswer && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                                )}
                                {result && optionIndex === result.userAnswer && !result.isCorrect && (
                                  <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {result && (
                          <div className="space-y-3">
                            <div className="p-4 bg-muted rounded-lg">
                              <h5 className="text-sm font-medium mb-2">내 답안</h5>
                              <p className="text-sm">
                                {String.fromCharCode(65 + result.userAnswer)}. {question.options[result.userAnswer]}
                              </p>
                            </div>
                            
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <h5 className="text-sm font-medium mb-2 text-green-800">정답</h5>
                              <p className="text-sm text-green-800">
                                {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                              </p>
                            </div>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h5 className="text-sm font-medium mb-2">해설</h5>
                            <p className="text-sm">{question.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}