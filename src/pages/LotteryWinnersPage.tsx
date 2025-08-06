import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trophy, Calendar, Gift, Users, Star, Award, RefreshCw, Plus, Clock, Play, Info } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';

interface LotteryWinner {
  _id: string;
  name: string;
  description: string;
  prize: string;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participants: any[];
  winner: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };
  drawnAt: string;
  createdAt: string;
  updatedAt: string;
}

interface CurrentLottery {
  _id: string;
  name: string;
  description: string;
  prize: string;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participants: any[];
  createdAt: string;
  updatedAt: string;
}

export default function LotteryWinnersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: winners, isLoading: winnersLoading } = useQuery<LotteryWinner[]>({
    queryKey: ['lottery-winners'],
    queryFn: async () => {
      const res = await fetch('https://stories-be.onrender.com/api/home/lottery/winners');
      if (!res.ok) {
        throw new Error('Failed to fetch winners');
      }
      return res.json();
    },
  });

  const { data: currentLotteries, isLoading: currentLotteriesLoading } = useQuery<CurrentLottery[]>({
    queryKey: ['current-lotteries'],
    queryFn: async () => {
      const res = await fetch('https://stories-be.onrender.com/api/home/lottery/current');
      if (!res.ok) {
        throw new Error('Failed to fetch current lotteries');
      }
      return res.json();
    },
  });

  const createTestDataMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('https://stories-be.onrender.com/api/home/lottery/test-data', {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to create test data');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: '成功！',
        description: `已創建 ${data.count} 個抽獎範例`,
      });
      queryClient.invalidateQueries({ queryKey: ['lottery-winners'] });
      queryClient.invalidateQueries({ queryKey: ['current-lotteries'] });
    },
    onError: (_error) => {
      toast({
        title: '錯誤',
        description: '無法創建範例資料',
        variant: 'destructive',
      });
    },
  });

  if (winnersLoading || currentLotteriesLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在載入抽獎資訊...</p>
        </div>
      </div>
    );
  }

  const totalWinners = winners?.length || 0;
  const totalPrizes = winners?.reduce((sum, winner) => {
    const prizeValue = parseInt(winner.prize.replace(/[^0-9]/g, '')) || 0;
    return sum + prizeValue;
  }, 0) || 0;

  // const recentWinners = winners?.filter(w => 
  //   new Date(w.drawnAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  // ).length || 0;

  const activeLotteries = currentLotteries?.filter(l => l.status === 'active') || [];
  const upcomingLotteries = currentLotteries?.filter(l => l.status === 'upcoming') || [];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="h-12 w-12 text-yellow-500 mr-3" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">🎉 抽獎系統</h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          參與精彩抽獎活動並查看幸運得獎者名單！
        </p>
        
        {/* Test Data Button */}
        <div className="mt-6">
          <Button 
            onClick={() => createTestDataMutation.mutate()}
            disabled={createTestDataMutation.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {createTestDataMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                正在創建資料...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                創建範例資料
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 sm:mb-12">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{totalWinners}</div>
            <p className="text-sm text-muted-foreground">總得獎人數</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Gift className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">${totalPrizes.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">總獎金價值</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Play className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{activeLotteries.length}</div>
            <p className="text-sm text-muted-foreground">進行中的抽獎</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{upcomingLotteries.length}</div>
            <p className="text-sm text-muted-foreground">即將開始的抽獎</p>
          </CardContent>
        </Card>
      </div>

      {/* How to Participate Section */}
      <div className="mb-8 sm:mb-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Info className="h-8 w-8 text-blue-500 mr-2" />
              <CardTitle className="text-xl sm:text-2xl">📝 如何參與抽獎</CardTitle>
            </div>
            <CardDescription className="text-base">
              要參與抽獎活動，您需要完成以下步驟：
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">註冊帳戶</h4>
                    <p className="text-sm text-muted-foreground">
                      在系統上創建帳戶以便參與抽獎活動
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">分享夢想貼文</h4>
                    <p className="text-sm text-muted-foreground">
                      通過在系統上發布貼文來分享您的夢想
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">與社群互動</h4>
                    <p className="text-sm text-muted-foreground">
                      點讚、分享和評論貼文以增加參與機會
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">自動參與</h4>
                    <p className="text-sm text-muted-foreground">
                      當有新抽獎時，您將自動被加入參與者名單
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">等待結果</h4>
                    <p className="text-sm text-muted-foreground">
                      得獎者將被隨機選擇並在此頁面公佈
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">領取獎品</h4>
                    <p className="text-sm text-muted-foreground">
                      如果中獎，您將被聯繫以領取獎品
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/create-post">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  開始分享夢想
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Active Lotteries */}
      {activeLotteries.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">🎯 正在進行的抽獎</h2>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {activeLotteries.map((lottery) => (
              <Card key={lottery._id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Play className="h-3 w-3 mr-1" />
                          進行中
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <Users className="h-3 w-3 mr-1" />
                          {lottery.participants?.length || 0}/{lottery.maxParticipants} 人參與
                        </Badge>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl text-foreground mb-2">
                        {lottery.name}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {lottery.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {lottery.prize}
                      </div>
                      <p className="text-xs text-muted-foreground">獎品</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">開始</p>
                        <p className="font-medium">{formatDate(lottery.startDate, 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">結束</p>
                        <p className="font-medium">{formatDate(lottery.endDate, 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">剩餘</p>
                        <p className="font-medium">
                          {Math.max(0, Math.ceil((new Date(lottery.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} 天
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Lotteries */}
      {upcomingLotteries.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">⏰ 即將開始的抽獎</h2>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {upcomingLotteries.map((lottery) => (
              <Card key={lottery._id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Clock className="h-3 w-3 mr-1" />
                          即將開始
                        </Badge>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl text-foreground mb-2">
                        {lottery.name}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {lottery.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {lottery.prize}
                      </div>
                      <p className="text-xs text-muted-foreground">獎品</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">開始</p>
                        <p className="font-medium">{formatDate(lottery.startDate, 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">結束</p>
                        <p className="font-medium">{formatDate(lottery.endDate, 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Winners List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-center">🏆 得獎者名單</h2>
        
        {!winners || winners.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mb-4">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">尚無得獎者</h3>
              <p className="text-muted-foreground mb-4">
                目前還沒有完成任何抽獎。請稍後再來查看得獎者名單！
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>定期更新</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {winners.map((winner, index) => (
              <Card key={winner._id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {index + 1}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Trophy className="h-3 w-3 mr-1" />
                          得獎者
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {winner.status === 'completed' ? '已完成' : winner.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl text-foreground mb-2">
                        {winner.name}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {winner.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {winner.prize}
                      </div>
                      <p className="text-xs text-muted-foreground">獎品</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Winner Information */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-green-800">得獎者資訊</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">姓名:</span>
                        <span className="ml-2 font-medium text-foreground">{winner.winner?.name || '未確定'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">電話:</span>
                        <span className="ml-2 font-medium text-foreground">{winner.winner?.phoneNumber || '未確定'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lottery Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">開始日期</p>
                        <p className="font-medium">{formatDate(winner.startDate, 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">結束日期</p>
                        <p className="font-medium">{formatDate(winner.endDate, 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">參與人數</p>
                        <p className="font-medium">{winner.participants?.length || 0}/{winner.maxParticipants}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">公佈日期</p>
                        <p className="font-medium">{formatDate(winner.drawnAt, 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer Information */}
      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">📋 更多資訊</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• 所有抽獎均公平透明進行</p>
              <p>• 得獎者從有效參與者名單中隨機選擇</p>
              <p>• 獎品將在7個工作日內發放</p>
              <p>• 如對結果有疑問，請聯繫我們</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 