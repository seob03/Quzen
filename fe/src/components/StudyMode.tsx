import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

interface StudyModeProps {
  onBack: () => void;
  chapter: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function StudyMode({ onBack, chapter }: StudyModeProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: number}>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  // Mock questions data
  const questions: Question[] = [
    {
      id: '1',
      question: '경제학에서 말하는 "기회비용"의 정확한 정의는 무엇인가?',
      options: [
        '실제로 지불한 금액',
        '선택하지 않은 대안 중 가장 가치 있는 것의 가치',
        '총비용에서 고정비용을 뺀 것',
        '미래에 발생할 모든 비용의 합'
      ],
      correctAnswer: 1,
      explanation: '기회비용은 어떤 선택을 할 때 포기해야 하는 다른 대안들 중 가장 가치 있는 것을 의미합니다.',
      difficulty: 'easy'
    },
    {
      id: '2',
      question: '완전경쟁시장의 특징이 아닌 것은?',
      options: [
        '다수의 공급자와 수요자',
        '동질적인 상품',
        '시장 진입과 퇴출의 자유',
        '정보의 비대칭성'
      ],
      correctAnswer: 3,
      explanation: '완전경쟁시장에서는 모든 참가자가 완전한 정보를 가지고 있어야 하므로, 정보의 비대칭성은 완전경쟁시장의 특징이 아닙니다.',
      difficulty: 'medium'
    },
    {
      id: '3',
      question: 'GDP(국내총생산)에 포함되지 않는 것은?',
      options: [
        '기업의 설비투자',
        '정부의 공공투자',
        '중고차 판매',
        '수출에서 수입을 뺀 순수출'
      ],
      correctAnswer: 2,
      explanation: 'GDP는 일정 기간 동안 생산된 최종재의 시장가치를 측정하므로, 중고차 판매는 새로운 생산이 아니라 기존 재화의 소유권 이전일 뿐입니다.',
      difficulty: 'medium'
    },
    {
      id: '4',
      question: '수요의 가격탄력성이 1보다 클 때, 이를 무엇이라고 하는가?',
      options: [
        '완전탄력적',
        '탄력적',
        '비탄력적',
        '완전비탄력적'
      ],
      correctAnswer: 1,
      explanation: '수요의 가격탄력성이 1보다 크면 가격 변화에 대한 수요량의 변화가 상대적으로 크다는 의미로, 이를 탄력적이라고 합니다.',
      difficulty: 'medium'
    },
    {
      id: '5',
      question: '한계효용이 0일 때의 총효용은?',
      options: [
        '0이다',
        '최대가 된다',
        '최소가 된다',
        '음수가 된다'
      ],
      correctAnswer: 1,
      explanation: '한계효용이 0이 되는 지점에서 총효용은 최대가 됩니다. 그 이후 소비하면 한계효용이 음수가 되어 총효용이 감소합니다.',
      difficulty: 'hard'
    }
  ];

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (!showAnswers) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerIndex
      }));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
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

  const score = calculateScore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl">문제집 모드</h2>
            <p className="text-sm text-muted-foreground">
              총 {questions.length}문제
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {showAnswers && (
            <div className="text-sm">
              점수: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExplanations(!showExplanations)}
            className="flex items-center space-x-2"
            disabled={!showAnswers}
          >
            {showExplanations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>해설 {showExplanations ? '숨기기' : '보기'}</span>
          </Button>
          <Button
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center space-x-2"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>정답 {showAnswers ? '숨기기' : '확인'}</span>
          </Button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, questionIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>문제 {questionIndex + 1}</span>
                <div className="flex items-center space-x-2">
                  {showAnswers && (
                    <div className="flex items-center">
                      {selectedAnswers[question.id] === question.correctAnswer ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : selectedAnswers[question.id] !== undefined ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                      )}
                    </div>
                  )}
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {getDifficultyText(question.difficulty)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed">{question.question}</p>
              
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAnswers[question.id] === optionIndex
                        ? showAnswers
                          ? optionIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-primary bg-primary/5'
                        : showAnswers && optionIndex === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-border hover:border-primary/50'
                    } ${showAnswers ? 'cursor-default' : ''}`}
                    onClick={() => handleAnswerSelect(question.id, optionIndex)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                        selectedAnswers[question.id] === optionIndex
                          ? showAnswers
                            ? optionIndex === question.correctAnswer
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-red-500 bg-red-500 text-white'
                            : 'border-primary bg-primary text-primary-foreground'
                          : showAnswers && optionIndex === question.correctAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted-foreground'
                      }`}>
                        {showAnswers ? (
                          selectedAnswers[question.id] === optionIndex ? (
                            optionIndex === question.correctAnswer ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                          ) : optionIndex === question.correctAnswer ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            optionIndex + 1
                          )
                        ) : (
                          optionIndex + 1
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>

              {showAnswers && showExplanations && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>해설</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Actions */}
      {showAnswers && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg mb-2">문제집 완료!</h3>
            <p className="text-muted-foreground mb-4">
              총 {questions.length}문제 중 {score.correct}문제를 맞혔습니다. ({Math.round((score.correct / score.total) * 100)}%)
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                홈으로 돌아가기
              </Button>
              <Button onClick={() => {
                setSelectedAnswers({});
                setShowAnswers(false);
                setShowExplanations(false);
              }}>
                다시 풀기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}