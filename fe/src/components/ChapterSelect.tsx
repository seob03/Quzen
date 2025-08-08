import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, BookOpen, Users, Clock } from 'lucide-react';

interface ChapterSelectProps {
  onBack: () => void;
  onChapterSelect: (chapter: string) => void;
  mode: 'quiz' | 'study';
}

export function ChapterSelect({ onBack, onChapterSelect, mode }: ChapterSelectProps) {
  const chapters = [
    {
      id: 'economics-basic',
      name: '경제학 개론',
      description: '기본적인 경제 이론과 원리',
      difficulty: '초급',
      questions: 120,
      avgTime: '2분',
      completed: 85
    },
    {
      id: 'accounting-basic',
      name: '회계학 기초',
      description: '회계의 기본 개념과 원리',
      difficulty: '초급',
      questions: 95,
      avgTime: '3분',
      completed: 62
    },
    {
      id: 'management',
      name: '경영학 원론',
      description: '경영학의 기본 이론과 실무',
      difficulty: '중급',
      questions: 110,
      avgTime: '2.5분',
      completed: 40
    },
    {
      id: 'finance',
      name: '재무관리',
      description: '기업 재무관리와 투자 이론',
      difficulty: '중급',
      questions: 85,
      avgTime: '4분',
      completed: 25
    },
    {
      id: 'marketing',
      name: '마케팅 원론',
      description: '마케팅 전략과 소비자 행동',
      difficulty: '중급',
      questions: 75,
      avgTime: '3분',
      completed: 15
    },
    {
      id: 'statistics',
      name: '경영통계',
      description: '통계학의 경영 분야 응용',
      difficulty: '고급',
      questions: 65,
      avgTime: '5분',
      completed: 0
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-green-100 text-green-800';
      case '중급': return 'bg-yellow-100 text-yellow-800';
      case '고급': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl">단원 선택</h2>
          <p className="text-muted-foreground">
            {mode === 'quiz' ? '퀴즈 모드' : '문제집 모드'}로 학습할 단원을 선택하세요
          </p>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {chapters.map((chapter) => (
          <Card 
            key={chapter.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onChapterSelect(chapter.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{chapter.name}</span>
                  </CardTitle>
                  <CardDescription>{chapter.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(chapter.difficulty)}>
                  {chapter.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chapter.completed > 0 && (
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">진도율</span>
                      <span className="text-sm">{chapter.completed}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${chapter.completed}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{chapter.questions}문제</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>평균 {chapter.avgTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}