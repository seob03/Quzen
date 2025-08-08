import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, RefreshCw, Trash2, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

interface WrongAnswersProps {
  onBack: () => void;
}

export function WrongAnswers({ onBack }: WrongAnswersProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Mock data for wrong answers
  const wrongAnswers = [
    {
      id: '1',
      question: '완전경쟁시장의 특징이 아닌 것은?',
      chapter: '경제학 개론',
      userAnswer: '다수의 공급자와 수요자',
      correctAnswer: '정보의 비대칭성',
      explanation: '완전경쟁시장에서는 모든 참가자가 완전한 정보를 가지고 있어야 하므로, 정보의 비대칭성은 완전경쟁시장의 특징이 아닙니다.',
      difficulty: 'medium',
      wrongCount: 2,
      lastAttempt: '2024-01-15',
      isRetried: false
    },
    {
      id: '2',
      question: 'GDP(국내총생산)에 포함되지 않는 것은?',
      chapter: '경제학 개론',
      userAnswer: '정부의 공공투자',
      correctAnswer: '중고차 판매',
      explanation: 'GDP는 일정 기간 동안 생산된 최종재의 시장가치를 측정하므로, 중고차 판매는 새로운 생산이 아니라 기존 재화의 소유권 이전일 뿐입니다.',
      difficulty: 'medium',
      wrongCount: 1,
      lastAttempt: '2024-01-14',
      isRetried: false
    },
    {
      id: '3',
      question: '한계효용이 0일 때의 총효용은?',
      chapter: '경제학 개론',
      userAnswer: '0이다',
      correctAnswer: '최대가 된다',
      explanation: '한계효용이 0이 되는 지점에서 총효용은 최대가 됩니다. 그 이후 소비하면 한계효용이 음수가 되어 총효용이 감소합니다.',
      difficulty: 'hard',
      wrongCount: 3,
      lastAttempt: '2024-01-13',
      isRetried: true
    }
  ];

  const reviewedQuestions = [
    {
      id: '4',
      question: '수요의 가격탄력성이 1보다 클 때, 이를 무엇이라고 하는가?',
      chapter: '경제학 개론',
      originalUserAnswer: '완전탄력적',
      correctAnswer: '탄력적',
      explanation: '수요의 가격탄력성이 1보다 크면 가격 변화에 대한 수요량의 변화가 상대적으로 크다는 의미로, 이를 탄력적이라고 합니다.',
      difficulty: 'medium',
      wrongCount: 2,
      reviewedDate: '2024-01-16',
      isCorrectNow: true
    }
  ];

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

      <Tabs defaultValue="wrong" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wrong">미해결 문제 ({wrongAnswers.length})</TabsTrigger>
          <TabsTrigger value="reviewed">해결된 문제 ({reviewedQuestions.length})</TabsTrigger>
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

          <div className="space-y-4">
            {wrongAnswers.map((item) => (
              <Card key={item.id} className={`cursor-pointer transition-colors ${
                selectedQuestions.includes(item.id) ? 'ring-2 ring-primary' : ''
              }`} onClick={() => handleQuestionSelect(item.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(item.id)}
                          onChange={() => handleQuestionSelect(item.id)}
                          className="w-4 h-4"
                        />
                        <BookOpen className="w-5 h-5" />
                        <span className="text-sm text-muted-foreground">{item.chapter}</span>
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.isRetried && <Badge variant="outline">재시도됨</Badge>}
                      <Badge className={getDifficultyColor(item.difficulty)}>
                        {getDifficultyText(item.difficulty)}
                      </Badge>
                      <Badge variant="destructive">
                        {item.wrongCount}회 틀림
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{item.question}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">내 답안</span>
                      </div>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        {item.userAnswer}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">정답</span>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        {item.correctAnswer}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h5 className="text-sm mb-2">해설</h5>
                    <p className="text-sm text-muted-foreground">{item.explanation}</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>마지막 시도: {item.lastAttempt}</span>
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
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          <div className="space-y-4">
            {reviewedQuestions.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">{item.chapter}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        해결됨
                      </Badge>
                      <Badge className={getDifficultyColor(item.difficulty)}>
                        {getDifficultyText(item.difficulty)}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{item.question}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">이전 답안</span>
                      </div>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg opacity-60">
                        {item.originalUserAnswer}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">정답</span>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        {item.correctAnswer}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h5 className="text-sm mb-2">해설</h5>
                    <p className="text-sm text-muted-foreground">{item.explanation}</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>해결일: {item.reviewedDate}</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>정답으로 해결</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}