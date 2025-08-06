import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DataTable } from '../../components/ui/data-table';
import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminFetch } from '../../lib/utils';
import { formatDate } from '../../lib/utils';

interface Report {
  _id: string;
  userId: {
    name: string;
    email: string;
    phoneNumber: string;
  } | null;
  contentType: 'post' | 'comment';
  contentId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/reports');
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-reports-stats'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/reports/stats');
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/reports/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-stats'] });
      toast({ title: '成功', description: '舉報狀態更新成功' });
      setIsUpdateDialogOpen(false);
      setUpdateStatus('');
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法更新舉報狀態', variant: 'destructive' });
    },
  });

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (report: Report) => {
    setSelectedReport(report);
    setUpdateStatus(report.status);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateStatusSubmit = () => {
    if (!selectedReport || !updateStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedReport._id,
      status: updateStatus,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: '待處理' },
      reviewed: { variant: 'default' as const, icon: Eye, text: '已審核' },
      resolved: { variant: 'default' as const, icon: CheckCircle, text: '已解決' },
      dismissed: { variant: 'destructive' as const, icon: XCircle, text: '已駁回' },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const getReasonLabel = (reason: string) => {
    const reasonLabels = {
      spam: '垃圾訊息',
      inappropriate: '不當內容',
      harassment: '騷擾行為',
      copyright: '版權侵犯',
      other: '其他原因',
    };
    
    return reasonLabels[reason as keyof typeof reasonLabels] || reason;
  };

  const getContentTypeLabel = (type: string) => {
    return type === 'post' ? '貼文' : '評論';
  };

  const columns = [
    {
      key: 'reporter',
      header: '舉報者',
      render: (report: Report) => (
        <div className="flex items-center space-x-2">
          <span>{report.userId?.name || '匿名用戶'}</span>
        </div>
      ),
    },
    {
      key: 'contentType',
      header: '內容類型',
      render: (report: Report) => (
        <Badge variant="outline">
          {getContentTypeLabel(report.contentType)}
        </Badge>
      ),
    },
    {
      key: 'reason',
      header: '舉報原因',
      render: (report: Report) => (
        <span className="text-sm">{getReasonLabel(report.reason)}</span>
      ),
    },
    {
      key: 'status',
      header: '狀態',
      render: (report: Report) => getStatusBadge(report.status),
    },
    {
      key: 'createdAt',
      header: '舉報時間',
      render: (report: Report) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(report.createdAt, 'dd/MM/yyyy HH:mm')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (report: Report) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewReport(report)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus(report)}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入舉報列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">舉報管理</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">處理用戶舉報和內容審核</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.pending || 0}
            </div>
            <p className="text-sm text-muted-foreground">待處理</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.reviewed || 0}
            </div>
            <p className="text-sm text-muted-foreground">已審核</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.resolved || 0}
            </div>
            <p className="text-sm text-muted-foreground">已解決</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.dismissed || 0}
            </div>
            <p className="text-sm text-muted-foreground">已駁回</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={reports || []}
      />

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>舉報詳情</DialogTitle>
            <DialogDescription>
              查看舉報的詳細資訊
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">舉報者資訊</h4>
                  <p>姓名: {selectedReport.userId?.name || '匿名用戶'}</p>
                  <p>電子郵件: {selectedReport.userId?.email || '未提供'}</p>
                  <p>電話: {selectedReport.userId?.phoneNumber || '未提供'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">舉報資訊</h4>
                  <p>內容類型: {getContentTypeLabel(selectedReport.contentType)}</p>
                  <p>舉報原因: {getReasonLabel(selectedReport.reason)}</p>
                  <p>狀態: {getStatusBadge(selectedReport.status)}</p>
                  <p>舉報時間: {formatDate(selectedReport.createdAt, 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
              {selectedReport.description && (
                <div>
                  <h4 className="font-semibold mb-2">詳細描述</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                    {selectedReport.description}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新舉報狀態</DialogTitle>
            <DialogDescription>
              選擇新的舉報處理狀態
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">狀態</label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待處理</SelectItem>
                  <SelectItem value="reviewed">已審核</SelectItem>
                  <SelectItem value="resolved">已解決</SelectItem>
                  <SelectItem value="dismissed">已駁回</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleUpdateStatusSubmit} 
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? '更新中...' : '更新狀態'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 