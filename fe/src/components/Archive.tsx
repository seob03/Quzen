import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ArchiveProps {
  onBack: () => void;
}

interface ArchivedQuiz {
  id: string;
  title: string;
  chapter: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpent: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function Archive({ onBack }: ArchiveProps) {
  // Mock archived quizzes data
  const archivedQuizzes: ArchivedQuiz[] = [
    {
      id: '1',
      title: '경제학 개론 퀴즈',
      chapter: '경제학 개론',
      date: '2024-01-15',
      score: 8,
      totalQuestions: 10,
      timeSpent: '15분 30초',
      difficulty: 'medium'
    },
    {
      id: '2',
      title: '회계학 기초 퀴즈',
      chapter: '회계학 기초',
      date: '2024-01-12',
      score: 6,
      totalQuestions: 8,
      timeSpent: '12분 45초',
      difficulty: 'easy'
    },
    {
      id: '3',
      title: '경영학 원론 퀴즈',
      chapter: '경영학 원론',
      date: '2024-01-10',
      score: 7,
      totalQuestions: 12,
      timeSpent: '20분 15초',
      difficulty: 'hard'
    }
  ];

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl">아카이브</h2>
          <p className="text-muted-foreground">
            이전에 풀었던 퀴즈 결과를 확인하세요
          </p>
        </div>
      </div>

      {/* Archived Quizzes */}
      <div className="space-y-4">
        {archivedQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{quiz.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeSpent}</span>
                    </span>
                  </CardDescription>
                </div>
                <Badge className={getDifficultyBadge(quiz.difficulty)}>
                  {quiz.difficulty === 'easy' ? '쉬움' :
                   quiz.difficulty === 'medium' ? '보통' : '어려움'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600">{quiz.score}개 정답</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600">{quiz.totalQuestions - quiz.score}개 틀림</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getScoreColor(quiz.score, quiz.totalQuestions)}`}>
                    {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quiz.score}/{quiz.totalQuestions}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  상세 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {archivedQuizzes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">아직 완료한 퀴즈가 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}