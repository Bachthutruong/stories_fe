import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DataTable } from '../../components/ui/data-table';
import { SensitiveTextDisplay } from '../../components/SensitiveTextDisplay';
import { useState } from 'react';
import { Edit, Trash2, User, FileText, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminFetch } from '../../lib/utils';

interface Comment {
  _id: string;
  content: string;
  status: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  postId: {
    _id: string;
    title: string;
  };
}

export default function AdminComments() {
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    content: '',
    status: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/comments');
      return res.json();
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/comments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({ title: '成功', description: '評論更新成功' });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法更新評論', variant: 'destructive' });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/comments/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({ title: '成功', description: '評論刪除成功' });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法刪除評論', variant: 'destructive' });
    },
  });

  const handleEdit = (comment: Comment) => {
    setSelectedComment(comment);
    setEditForm({
      content: comment.content,
      status: comment.status
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (comment: Comment) => {
    setSelectedComment(comment);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateComment = () => {
    if (!selectedComment) return;
    updateCommentMutation.mutate({
      id: selectedComment._id,
      data: editForm
    });
  };

  const handleDeleteComment = () => {
    if (!selectedComment) return;
    deleteCommentMutation.mutate(selectedComment._id);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: '啟用', color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, text: '停用', color: 'text-gray-600' },
      pending: { variant: 'outline' as const, text: '待審核', color: 'text-yellow-600' },
      rejected: { variant: 'destructive' as const, text: '已拒絕', color: 'text-red-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const columns = [
    {
      key: 'content',
      header: '評論內容',
      render: (comment: Comment) => (
        <div className="max-w-xs">
          <SensitiveTextDisplay text={comment.content} />
        </div>
      ),
    },
    {
      key: 'author',
      header: '作者',
      render: (comment: Comment) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{comment.userId?.name || '未知'}</span>
        </div>
      ),
    },
    {
      key: 'post',
      header: '所屬貼文',
      render: (comment: Comment) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{comment.postId?.title || '未知貼文'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: '狀態',
      render: (comment: Comment) => getStatusBadge(comment.status),
    },
    {
      key: 'createdAt',
      header: '建立時間',
      render: (comment: Comment) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{new Date(comment.createdAt).toLocaleDateString('zh-TW')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (comment: Comment) => renderActions(comment),
    },
  ];

  const renderActions = (comment: Comment) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(comment)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(comment)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入評論列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">評論管理</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">管理所有用戶評論</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={comments || []}
      />

      {/* Edit Comment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>編輯評論</DialogTitle>
            <DialogDescription>
              更新評論內容和狀態
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">評論內容</label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="輸入評論內容"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">狀態</label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">啟用</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                  <SelectItem value="pending">待審核</SelectItem>
                  <SelectItem value="rejected">已拒絕</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateComment} disabled={updateCommentMutation.isPending}>
              {updateCommentMutation.isPending ? '更新中...' : '更新'}
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
              您確定要刪除這條評論嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDeleteComment} 
              disabled={deleteCommentMutation.isPending}
              variant="destructive"
            >
              {deleteCommentMutation.isPending ? '刪除中...' : '刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 