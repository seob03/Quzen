import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, RefreshCw, Trash2, BookOpen, CheckCircle2, XCircle, Eye } from 'lucide-react';

interface WrongAnswersProps {
  onBack: () => void;
}

interface WrongAnswer {
  quizId: string;
  quizTitle: string;
  questionIndex: number;
  question: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  };
  userAnswer: number;
  correctAnswer: number;
  userAnswerText?: string;
  correctAnswerText?: string;
  questionText?: string;
  explanation?: string;
  completedAt: string;
  subject: string;
  difficulty: string;
  mode: string;
}

export function WrongAnswers({ onBack }: WrongAnswersProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [groupedWrongAnswers, setGroupedWrongAnswers] = useState<Record<string, WrongAnswer[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<WrongAnswer | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchWrongAnswers();
  }, []);

  const fetchWrongAnswers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quiz/wrong-answers', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWrongAnswers(data.wrongAnswers || []);
        setGroupedWrongAnswers(data.groupedWrongAnswers || {});
      } else {
        console.error('오답 목록 조회 실패');
      }
    } catch (error) {
      console.error('오답 목록 조회 오류:', error);
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

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleRetrySelected = () => {
    if (selectedQuestions.length > 0) {
      alert(`선택한 ${selectedQuestions.length}개 문제를 다시 풀어보겠습니다.`);
      // Here you would navigate to a quiz with only the selected questions
    }
  };

  const handleRemoveSelected = () => {
    if (selectedQuestions.length > 0) {
      alert(`선택한 ${selectedQuestions.length}개 문제를 오답노트에서 제거했습니다.`);
      setSelectedQuestions([]);
    }
  };

  const handleViewDetail = (answer: WrongAnswer) => {
    setSelectedAnswer(answer);
    setShowDetailDialog(true);
  };

  // 통계 계산
  const stats = {
    total: wrongAnswers.length,
    bySubject: wrongAnswers.reduce((acc, answer) => {
      acc[answer.subject] = (acc[answer.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDifficulty: wrongAnswers.reduce((acc, answer) => {
      acc[answer.difficulty] = (acc[answer.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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
              <h2 className="text-2xl">오답노트</h2>
              <p className="text-muted-foreground">틀린 문제들을 복습하고 다시 도전해보세요</p>
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
            <h2 className="text-2xl">오답노트</h2>
            <p className="text-muted-foreground">틀린 문제들을 복습하고 다시 도전해보세요</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">총 오답</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1">{stats.byDifficulty.hard || 0}</div>
            <div className="text-sm text-muted-foreground">어려운 문제</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-yellow-600 mb-1">{stats.byDifficulty.medium || 0}</div>
            <div className="text-sm text-muted-foreground">보통 문제</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">{stats.byDifficulty.easy || 0}</div>
            <div className="text-sm text-muted-foreground">쉬운 문제</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wrong" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wrong">미해결 문제 ({wrongAnswers.length})</TabsTrigger>
          <TabsTrigger value="reviewed">해결된 문제 (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="wrong" className="space-y-4">
          {/* Action buttons */}
          {selectedQuestions.length > 0 && (
            <div className="flex space-x-2 p-4 bg-muted rounded-lg">
              <Button onClick={handleRetrySelected} size="sm" className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>선택한 문제 다시 풀기 ({selectedQuestions.length})</span>
              </Button>
              <Button variant="outline" onClick={handleRemoveSelected} size="sm" className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>제거</span>
              </Button>
            </div>
          )}

          {wrongAnswers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">아직 틀린 문제가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {wrongAnswers.map((item) => (
                <Card key={`${item.quizId}-${item.questionIndex}`} className={`cursor-pointer transition-colors ${
                  selectedQuestions.includes(`${item.quizId}-${item.questionIndex}`) ? 'ring-2 ring-primary' : ''
                }`} onClick={() => handleQuestionSelect(`${item.quizId}-${item.questionIndex}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center space-x-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(`${item.quizId}-${item.questionIndex}`)}
                            onChange={() => handleQuestionSelect(`${item.quizId}-${item.questionIndex}`)}
                            className="w-4 h-4"
                          />
                          <BookOpen className="w-5 h-5" />
                          <span className="text-sm text-muted-foreground">{item.subject}</span>
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.mode === 'quiz' ? '퀴즈' : '문제집'}</Badge>
                        <Badge className={getDifficultyColor(item.difficulty)}>
                          {getDifficultyText(item.difficulty)}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(item);
                          }}
                          className="flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>상세보기</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{item.quizTitle}</h4>
                      <span className="text-sm text-muted-foreground">문제 {item.questionIndex + 1}</span>
                    </div>
                    
                    <p>{item.question.question}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm">내 답안 (틀림)</span>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          {String.fromCharCode(65 + item.userAnswer)}. {item.userAnswerText || item.question.options[item.userAnswer]}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm">정답</span>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          {String.fromCharCode(65 + item.correctAnswer)}. {item.correctAnswerText || item.question.options[item.correctAnswer]}
                        </div>
                      </div>
                    </div>
                    
                    {(item.explanation || item.question.explanation) && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h5 className="text-sm mb-2">해설</h5>
                        <p className="text-sm text-muted-foreground">{item.explanation || item.question.explanation}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>틀린 날짜: {new Date(item.completedAt).toLocaleDateString('ko-KR')}</span>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        alert('이 문제만 다시 풀어보겠습니다.');
                      }}>
                        다시 풀기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">아직 해결된 문제가 없습니다.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAnswer?.quizTitle} - 문제 {selectedAnswer?.questionIndex! + 1}</DialogTitle>
          </DialogHeader>
          
          {selectedAnswer && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">과목</span>
                  <p className="font-medium">{selectedAnswer.subject}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">난이도</span>
                  <Badge className={getDifficultyColor(selectedAnswer.difficulty)}>
                    {getDifficultyText(selectedAnswer.difficulty)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">모드</span>
                  <Badge variant="outline">{selectedAnswer.mode === 'quiz' ? '퀴즈' : '문제집'}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">문제</h4>
                <p>{selectedAnswer.question.question}</p>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">선택지</h5>
                  {selectedAnswer.question.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      className={`p-3 border rounded-lg ${
                        optionIndex === selectedAnswer.correctAnswer
                          ? 'bg-green-50 border-green-200'
                          : optionIndex === selectedAnswer.userAnswer
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span>{option}</span>
                        {optionIndex === selectedAnswer.correctAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                        )}
                        {optionIndex === selectedAnswer.userAnswer && optionIndex !== selectedAnswer.correctAnswer && (
                          <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">내 답안</h5>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      {String.fromCharCode(65 + selectedAnswer.userAnswer)}. {selectedAnswer.userAnswerText || selectedAnswer.question.options[selectedAnswer.userAnswer]}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">정답</h5>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      {String.fromCharCode(65 + selectedAnswer.correctAnswer)}. {selectedAnswer.correctAnswerText || selectedAnswer.question.options[selectedAnswer.correctAnswer]}
                    </div>
                  </div>
                </div>

                {(selectedAnswer.explanation || selectedAnswer.question.explanation) && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">해설</h5>
                    <p className="text-sm">{selectedAnswer.explanation || selectedAnswer.question.explanation}</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  틀린 날짜: {new Date(selectedAnswer.completedAt).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}