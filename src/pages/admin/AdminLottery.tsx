import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
// import { DataTable } from '../../components/ui/data-table';
import { useState } from 'react';
import { Trophy, Calendar, Users, Star, Plus, Edit, Trash2, Play, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminFetch } from '../../lib/utils';
import { formatDate } from '../../lib/utils';

interface Lottery {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  prize: string;
  maxParticipants: number;
  participants: any[];
  winner?: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };
  status: 'upcoming' | 'active' | 'completed';
  drawnAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLottery() {
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDrawDialogOpen, setIsDrawDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    prize: '',
    maxParticipants: 100,
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    prize: '',
    maxParticipants: 100,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lotteries, isLoading } = useQuery<Lottery[]>({
    queryKey: ['admin-lotteries'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/lottery');
      return res.json();
    },
  });

  const createLotteryMutation = useMutation({
    mutationFn: async (data: typeof createForm) => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/lottery', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lotteries'] });
      toast({ title: '成功', description: '已創建新抽獎' });
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        prize: '',
        maxParticipants: 100,
      });
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法創建抽獎', variant: 'destructive' });
    },
  });

  const updateLotteryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/lottery/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lotteries'] });
      toast({ title: '成功', description: '已更新抽獎' });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法更新抽獎', variant: 'destructive' });
    },
  });

  const deleteLotteryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/lottery/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lotteries'] });
      toast({ title: '成功', description: '已刪除抽獎' });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法刪除抽獎', variant: 'destructive' });
    },
  });

  const drawWinnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/lottery/${id}/draw`, {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-lotteries'] });
      toast({ 
        title: '成功', 
        description: `已選擇得獎者: ${data.winner?.name || '未確定'}` 
      });
      setIsDrawDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法選擇得獎者', variant: 'destructive' });
    },
  });

  const handleCreate = () => {
    if (!createForm.name || !createForm.description || !createForm.startDate || !createForm.endDate || !createForm.prize) {
      toast({
        title: '錯誤',
        description: '請填寫完整資訊',
        variant: 'destructive',
      });
      return;
    }
    createLotteryMutation.mutate(createForm);
  };

  const handleEdit = () => {
    if (!selectedLottery) return;
    if (!editForm.name || !editForm.description || !editForm.startDate || !editForm.endDate || !editForm.prize) {
      toast({
        title: '錯誤',
        description: '請填寫完整資訊',
        variant: 'destructive',
      });
      return;
    }
    updateLotteryMutation.mutate({ id: selectedLottery._id, data: editForm });
  };

  const handleDelete = () => {
    if (!selectedLottery) return;
    deleteLotteryMutation.mutate(selectedLottery._id);
  };

  const handleDraw = () => {
    if (!selectedLottery) return;
    drawWinnerMutation.mutate(selectedLottery._id);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { variant: 'secondary' as const, text: '即將開始', color: 'text-blue-600' },
      active: { variant: 'default' as const, text: '進行中', color: 'text-green-600' },
      completed: { variant: 'outline' as const, text: '已完成', color: 'text-gray-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入抽獎列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">抽獎管理</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">創建和管理抽獎活動</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-yellow-500 hover:bg-yellow-600">
          <Plus className="h-4 w-4 mr-2" />
          創建新抽獎
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {lotteries?.filter(l => l.status === 'upcoming').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">即將開始</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Play className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {lotteries?.filter(l => l.status === 'active').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">進行中</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {lotteries?.filter(l => l.status === 'completed').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {lotteries?.reduce((sum, l) => sum + (l.participants?.length || 0), 0) || 0}
            </div>
            <p className="text-sm text-muted-foreground">總參與人數</p>
          </CardContent>
        </Card>
      </div>

      {/* Lotteries List */}
      <div className="grid gap-4">
        {lotteries?.map((lottery) => (
          <Card key={lottery._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(lottery.status)}
                    {getStatusBadge(lottery.status)}
                    {lottery.winner && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Star className="h-3 w-3 mr-1" />
                        已有得獎者
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-foreground mb-2">
                    {lottery.name}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {lottery.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-600 mb-1">
                    {lottery.prize}
                  </div>
                  <p className="text-xs text-muted-foreground">獎品</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">參與</p>
                    <p className="font-medium">{lottery.participants?.length || 0}/{lottery.maxParticipants}</p>
                  </div>
                </div>
                
                {lottery.drawnAt && (
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">公佈</p>
                      <p className="font-medium">{formatDate(lottery.drawnAt, 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                )}
              </div>

              {lottery.winner && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-800">得獎者資訊</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">姓名:</span>
                      <span className="ml-2 font-medium text-foreground">{lottery.winner.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">電話:</span>
                      <span className="ml-2 font-medium text-foreground">{lottery.winner.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2">
                {lottery.status === 'active' && !lottery.winner && (
                  <Button
                    onClick={() => {
                      setSelectedLottery(lottery);
                      setIsDrawDialogOpen(true);
                    }}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    選擇得獎者
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setSelectedLottery(lottery);
                    setEditForm({
                      name: lottery.name,
                      description: lottery.description,
                      startDate: lottery.startDate.split('T')[0],
                      endDate: lottery.endDate.split('T')[0],
                      prize: lottery.prize,
                      maxParticipants: lottery.maxParticipants,
                    });
                    setIsEditDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  編輯
                </Button>
                <Button
                  onClick={() => {
                    setSelectedLottery(lottery);
                    setIsDeleteDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  刪除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Lottery Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>創建新抽獎</DialogTitle>
            <DialogDescription>
              填寫資訊以創建新抽獎
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">抽獎名稱</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="輸入抽獎名稱"
              />
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="輸入抽獎描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">開始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">結束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prize">獎品</Label>
                <Input
                  id="prize"
                  value={createForm.prize}
                  onChange={(e) => setCreateForm({ ...createForm, prize: e.target.value })}
                  placeholder="例: $1000"
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">最大參與人數</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={createForm.maxParticipants}
                  onChange={(e) => setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={createLotteryMutation.isPending}>
              {createLotteryMutation.isPending ? '創建中...' : '創建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lottery Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>編輯抽獎</DialogTitle>
            <DialogDescription>
              更新抽獎資訊
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">抽獎名稱</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="輸入抽獎名稱"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">描述</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="輸入抽獎描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">開始日期</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">結束日期</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-prize">獎品</Label>
                <Input
                  id="edit-prize"
                  value={editForm.prize}
                  onChange={(e) => setEditForm({ ...editForm, prize: e.target.value })}
                  placeholder="例: $1000"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxParticipants">最大參與人數</Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={editForm.maxParticipants}
                  onChange={(e) => setEditForm({ ...editForm, maxParticipants: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEdit} disabled={updateLotteryMutation.isPending}>
              {updateLotteryMutation.isPending ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              您確定要刪除抽獎 "{selectedLottery?.name}" 嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={deleteLotteryMutation.isPending}
              variant="destructive"
            >
              {deleteLotteryMutation.isPending ? '刪除中...' : '刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Draw Winner Dialog */}
      <Dialog open={isDrawDialogOpen} onOpenChange={setIsDrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>選擇得獎者</DialogTitle>
            <DialogDescription>
              您確定要為抽獎 "{selectedLottery?.name}" 選擇得獎者嗎？ 
              得獎者將從參與者名單中隨機選擇。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDrawDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDraw} 
              disabled={drawWinnerMutation.isPending}
              className="bg-green-500 hover:bg-green-600"
            >
              {drawWinnerMutation.isPending ? '選擇中...' : '選擇得獎者'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 