import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Users, MessageSquare, ShieldAlert, ListFilter, Award } from 'lucide-react';

interface DebugCardsProps {
  stats: {
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    totalReports: number;
    totalKeywords: number;
    totalLotteries: number;
  };
}

export default function DebugCards({ stats }: DebugCardsProps) {
  const cards = [
    {
      title: '總貼文數',
      value: stats.totalPosts,
      description: '系統中的貼文總數',
      icon: <FileText className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '總用戶數',
      value: stats.totalUsers,
      description: '註冊用戶總數',
      icon: <Users className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '總評論數',
      value: stats.totalComments,
      description: '評論總數',
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '總舉報數',
      value: stats.totalReports,
      description: '舉報總數',
      icon: <ShieldAlert className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: '審核關鍵字',
      value: stats.totalKeywords,
      description: '審核關鍵字數量',
      icon: <ListFilter className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: '抽獎活動',
      value: stats.totalLotteries,
      description: '抽獎活動數量',
      icon: <Award className="h-4 w-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105 min-h-[120px] sm:min-h-[140px] border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-foreground truncate">{card.title}</CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor} flex-shrink-0`}>
                <div className={card.color}>
                  {card.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2 line-clamp-2">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 