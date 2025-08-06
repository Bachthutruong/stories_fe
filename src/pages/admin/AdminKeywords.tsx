import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DataTable } from '../../components/ui/data-table';
import { useState } from 'react';
import { Edit, Trash2, Plus, Shield } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminFetch } from '../../lib/utils';

interface Keyword {
  _id: string;
  word: string;
  action: string;
  severity: string;
  createdAt: string;
}

export default function AdminKeywords() {
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    word: '',
    action: '',
    severity: ''
  });
  const [createForm, setCreateForm] = useState({
    word: '',
    action: '',
    severity: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: keywords, isLoading } = useQuery<Keyword[]>({
    queryKey: ['admin-keywords'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/keywords');
      return res.json();
    },
  });

  const createKeywordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/keywords', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-keywords'] });
      toast({ title: '成功', description: '關鍵字創建成功' });
      setIsCreateDialogOpen(false);
      setCreateForm({ word: '', action: '', severity: '' });
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法創建關鍵字', variant: 'destructive' });
    },
  });

  const updateKeywordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/keywords/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-keywords'] });
      toast({ title: '成功', description: '關鍵字更新成功' });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法更新關鍵字', variant: 'destructive' });
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/keywords/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-keywords'] });
      toast({ title: '成功', description: '關鍵字刪除成功' });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法刪除關鍵字', variant: 'destructive' });
    },
  });

  const handleEdit = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
    setEditForm({
      word: keyword.word,
      action: keyword.action,
      severity: keyword.severity
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateKeyword = () => {
    createKeywordMutation.mutate(createForm);
  };

  const handleUpdateKeyword = () => {
    if (!selectedKeyword) return;
    updateKeywordMutation.mutate({
      id: selectedKeyword._id,
      data: editForm
    });
  };

  const handleDeleteKeyword = () => {
    if (!selectedKeyword) return;
    deleteKeywordMutation.mutate(selectedKeyword._id);
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      highlight: { variant: 'default' as const, text: '標記', color: 'text-blue-600' },
      block: { variant: 'destructive' as const, text: '阻擋', color: 'text-red-600' },
      warn: { variant: 'outline' as const, text: '警告', color: 'text-yellow-600' },
    };
    
    const config = actionConfig[action as keyof typeof actionConfig] || actionConfig.highlight;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { variant: 'secondary' as const, text: '低', color: 'text-green-600' },
      medium: { variant: 'outline' as const, text: '中', color: 'text-yellow-600' },
      high: { variant: 'destructive' as const, text: '高', color: 'text-red-600' },
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const columns = [
    {
      key: 'word',
      header: '關鍵字',
      render: (keyword: Keyword) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{keyword.word}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: '處理方式',
      render: (keyword: Keyword) => getActionBadge(keyword.action),
    },
    {
      key: 'severity',
      header: '嚴重程度',
      render: (keyword: Keyword) => getSeverityBadge(keyword.severity),
    },
    {
      key: 'createdAt',
      header: '建立時間',
      render: (keyword: Keyword) => (
        <span className="text-sm text-muted-foreground">
          {new Date(keyword.createdAt).toLocaleDateString('zh-TW')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (keyword: Keyword) => renderActions(keyword),
    },
  ];

  const renderActions = (keyword: Keyword) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(keyword)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(keyword)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入關鍵字列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">關鍵字管理</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">管理敏感詞過濾系統</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          新增關鍵字
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={keywords || []}
      />

      {/* Create Keyword Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增關鍵字</DialogTitle>
            <DialogDescription>
              新增敏感詞過濾規則
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">關鍵字</label>
              <input
                type="text"
                value={createForm.word}
                onChange={(e) => setCreateForm({ ...createForm, word: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="輸入關鍵字"
              />
            </div>
            <div>
              <label className="text-sm font-medium">處理方式</label>
              <Select value={createForm.action} onValueChange={(value) => setCreateForm({ ...createForm, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇處理方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highlight">標記</SelectItem>
                  <SelectItem value="warn">警告</SelectItem>
                  <SelectItem value="block">阻擋</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">嚴重程度</label>
              <Select value={createForm.severity} onValueChange={(value) => setCreateForm({ ...createForm, severity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇嚴重程度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateKeyword} disabled={createKeywordMutation.isPending}>
              {createKeywordMutation.isPending ? '創建中...' : '創建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Keyword Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>編輯關鍵字</DialogTitle>
            <DialogDescription>
              更新關鍵字過濾規則
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">關鍵字</label>
              <input
                type="text"
                value={editForm.word}
                onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="輸入關鍵字"
              />
            </div>
            <div>
              <label className="text-sm font-medium">處理方式</label>
              <Select value={editForm.action} onValueChange={(value) => setEditForm({ ...editForm, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇處理方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highlight">標記</SelectItem>
                  <SelectItem value="warn">警告</SelectItem>
                  <SelectItem value="block">阻擋</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">嚴重程度</label>
              <Select value={editForm.severity} onValueChange={(value) => setEditForm({ ...editForm, severity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇嚴重程度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateKeyword} disabled={updateKeywordMutation.isPending}>
              {updateKeywordMutation.isPending ? '更新中...' : '更新'}
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
              您確定要刪除關鍵字 "{selectedKeyword?.word}" 嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDeleteKeyword} 
              disabled={deleteKeywordMutation.isPending}
              variant="destructive"
            >
              {deleteKeywordMutation.isPending ? '刪除中...' : '刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 