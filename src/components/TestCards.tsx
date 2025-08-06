import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Users, MessageSquare, ShieldAlert, ListFilter, Award } from 'lucide-react';

export default function TestCards() {
  const testCards = [
    {
      title: '總貼文數',
      value: 6,
      description: '系統中的貼文總數',
      icon: <FileText className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '總用戶數',
      value: 14,
      description: '註冊用戶總數',
      icon: <Users className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '總評論數',
      value: 7,
      description: '評論總數',
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '總舉報數',
      value: 12,
      description: '舉報總數',
      icon: <ShieldAlert className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: '審核關鍵字',
      value: 9,
      description: '審核關鍵字數量',
      icon: <ListFilter className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: '抽獎活動',
      value: 3,
      description: '抽獎活動數量',
      icon: <Award className="h-4 w-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-red-600">TEST - Should show 6 cards:</h2>
      <div className="admin-grid">
        {testCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105 min-h-[140px] border-2 border-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground truncate">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor} flex-shrink-0`}>
                <div className={card.color}>
                  {card.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-foreground">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 