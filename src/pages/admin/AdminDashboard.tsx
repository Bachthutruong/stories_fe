import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '../../lib/utils';
import DebugCards from '../../components/DebugCards';

interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  totalReports: number;
  totalKeywords: number;
  totalLotteries: number;
  totalLikes?: number;
  totalShares?: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/stats');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入儀表板...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">管理員儀表板</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">平台統計概覽</p>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          最後更新: {new Date().toLocaleDateString('zh-TW')}
        </div>
      </div>
      
      <div className="w-full">
        {stats && <DebugCards stats={stats} />}
      </div>
    </div>
  );
} 