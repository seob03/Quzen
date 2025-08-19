import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff, Save } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  chapter?: string;
  section?: string;
}

interface WorkbookModeViewProps {
  quiz: QuizQuestion[];
  subject: string;
  difficulty: string;
  onBack: () => void;
  onSave?: (quiz: QuizQuestion[], mode: string) => void;
}

export const WorkbookModeView: React.FC<WorkbookModeViewProps> = ({ 
  quiz, 
  subject, 
  difficulty, 
  onBack,
  onSave 
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (!showAnswers) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: answerIndex
      }));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: quiz.length };
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

  const handleSaveQuiz = async () => {
    // 퀴즈 결과를 DB에 저장
    try {
      const results = Object.keys(selectedAnswers).map(questionIndexStr => {
        const questionIndex = parseInt(questionIndexStr);
        const userAnswer = selectedAnswers[questionIndex];
        
        if (userAnswer === undefined) return null; // 답안을 선택하지 않은 문제
        
        const question = quiz[questionIndex];
        return {
          questionIndex: questionIndex,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer === question.correctAnswer
        };
      }).filter(result => result !== null); // null 값 제거

      console.log('=== 워크북 결과 저장 디버깅 ===');
      console.log('전체 문제 수:', quiz.length);
      console.log('답안 객체:', selectedAnswers);
      console.log('결과 배열:', results);

      const requestBody = {
        quizData: {
          title: `${subject} ${getDifficultyText(difficulty)} 문제집`,
          subject: subject,
          difficulty: difficulty,
          questions: quiz.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          })),
          mode: 'workbook'
        },
        results: results
      };

      console.log('전송할 데이터:', requestBody);

      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('워크북 결과 저장 성공:', data);
        alert('문제집 결과가 저장되었습니다!');
      } else {
        const errorData = await response.json();
        console.error('워크북 결과 저장 실패:', errorData);
        alert('문제집 결과 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('워크북 결과 저장 오류:', error);
      alert('문제집 결과 저장 중 오류가 발생했습니다.');
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
              {subject} - {getDifficultyText(difficulty)} | 총 {quiz.length}문제
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
        {quiz.map((question, questionIndex) => (
          <Card key={questionIndex}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>문제 {questionIndex + 1}</span>
                <div className="flex items-center space-x-2">
                  {showAnswers && (
                    <div className="flex items-center">
                      {selectedAnswers[questionIndex] === question.correctAnswer ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : selectedAnswers[questionIndex] !== undefined ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                      )}
                    </div>
                  )}
                  <Badge className={getDifficultyColor(difficulty)}>
                    {getDifficultyText(difficulty)}
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
                      selectedAnswers[questionIndex] === optionIndex
                        ? showAnswers
                          ? optionIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-primary bg-primary/5'
                        : showAnswers && optionIndex === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-border hover:border-primary/50'
                    } ${showAnswers ? 'cursor-default' : ''}`}
                    onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                        selectedAnswers[questionIndex] === optionIndex
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
                          selectedAnswers[questionIndex] === optionIndex ? (
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
              총 {quiz.length}문제 중 {score.correct}문제를 맞혔습니다. ({Math.round((score.correct / score.total) * 100)}%)
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                홈으로 돌아가기
              </Button>
              <Button onClick={handleSaveQuiz}>
                결과 저장
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
};
