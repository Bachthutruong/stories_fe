import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trophy, Calendar, Gift, Users, Star, Award, Plus, Clock, Play, Info } from 'lucide-react';
import { formatDate } from '../lib/utils';
// import { useToast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';
import LotteryWinnersBanner from '../components/LotteryWinnersBanner';

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
  // const { toast } = useToast();
  // const queryClient = useQueryClient();

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

  const { data: allPosts, isLoading: allPostsLoading } = useQuery({
    queryKey: ['all-posts'],
    queryFn: async () => {
      const res = await fetch('https://stories-be.onrender.com/api/posts');
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }
      return res.json();
    },
  });


  // const createTestDataMutation = useMutation({
  //   mutationFn: async () => {
  //     const res = await fetch('https://stories-be.onrender.com/api/home/lottery/test-data', {
  //       method: 'POST',
  //     });
  //     if (!res.ok) {
  //       throw new Error('Failed to create test data');
  //     }
  //     return res.json();
  //   },
  //   onSuccess: (data) => {
  //     toast({
  //       title: '成功！',
  //       description: `已創建 ${data.count} 個抽獎範例`,
  //     });
  //     queryClient.invalidateQueries({ queryKey: ['lottery-winners'] });
  //     queryClient.invalidateQueries({ queryKey: ['current-lotteries'] });
  //   },
  //   onError: (_error) => {
  //     toast({
  //       title: '錯誤',
  //       description: '無法創建範例資料',
  //       variant: 'destructive',
  //     });
  //   },
  // });

  if (winnersLoading || currentLotteriesLoading || allPostsLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在載入抽獎資訊...</p>
        </div>
      </div>
    );
  }

  const totalPrizes = winners?.length || 0; // Tổng số giải thưởng từ trước đến giờ
  const totalPosts = allPosts?.length || 0; // Tổng số posts từ danh sách posts

  // const recentWinners = winners?.filter(w => 
  //   new Date(w.drawnAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  // ).length || 0;

  const activeLotteries = currentLotteries?.filter(l => l.status === 'active') || [];
  const upcomingLotteries = currentLotteries?.filter(l => l.status === 'upcoming') || [];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <LotteryWinnersBanner />
      
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
        {/* <div className="mt-6">
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
        </div> */}
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 sm:mb-12">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{totalPosts}</div>
            <p className="text-sm text-primary font-medium mb-2">累積的夢想卡</p>
            <p className="text-xs text-muted-foreground">每一張卡，都是一顆夢想的種子，慢慢在牆上發芽</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Gift className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{totalPrizes}</div>
            <p className="text-sm text-yellow-600 font-medium mb-2">被幸運點亮</p>
            <p className="text-xs text-muted-foreground">幸運只是開始，真正珍貴的是被看見的夢想</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{totalPrizes}</div>
            <p className="text-sm text-green-600 font-medium mb-2">送出的甜蜜</p>
            <p className="text-xs text-muted-foreground">從夢想發芽，到化作甜蜜，送到幸運卡友手中</p>
          </CardContent>
        </Card>
      </div>

      {/* Lottery Information Section */}
      <div className="mb-8 sm:mb-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Info className="h-8 w-8 text-blue-500 mr-2" />
              <CardTitle className="text-xl sm:text-2xl">🎯 抽獎方式</CardTitle>
            </div>
            <CardDescription className="text-base">
              在希望夢想牆，每一張夢想卡都會得到一組3位數的幸運編號，這些編號就像夢想的印記，靜靜等待被點亮的一刻！
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-base text-muted-foreground">
                每個月我們會公布 3 組幸運數字，對應到夢想卡編號，讓其中的夢想綻放光芒。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">公布時間</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium">單月 26 號：</span>依照台灣統一發票的「頭獎末三碼」公布幸運數字。
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">雙月最後一天：</span>隨機抽出三張發票，取其「末三碼」作為幸運數字。
                    </p>
                    <p className="text-muted-foreground">
                      每一次公布，都是一次「夢想被看見」的時刻。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">中獎禮物</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      當幸運降臨，對應的夢想卡會成為被點亮的那一張，那位卡友將收到一份
                      <span className="font-bold text-[#25a777]">希望綠豆湯</span>
                      精選甜點禮盒。
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

      {/* Additional Information Section */}
      <div className="mb-8 sm:mb-12">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-base text-muted-foreground leading-relaxed">
                每一份禮物，都是我們替卡友準備的甜蜜心意，<br />
                也代表夢想正在慢慢發芽、化作真實的祝福。<br />
                即使沒有被抽中，你的夢想也已經在這裡發芽，並被好好珍藏！
              </p>
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
      {/* <div className="space-y-6">
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
      </div> */}

      {/* Footer Information */}
      {/* <div className="mt-12 text-center">
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
      </div> */}
    </div>
  );
} 