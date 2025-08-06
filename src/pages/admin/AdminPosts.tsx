import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DataTable } from '../../components/ui/data-table';
import { SensitiveTextDisplay } from '../../components/SensitiveTextDisplay';
import { useState } from 'react';
import { Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminFetch } from '../../lib/utils';

interface Post {
  _id: string;
  title: string;
  description: string;
  content: string;
  status: string;
  isFeatured: boolean;
  isHidden: boolean;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

export default function AdminPosts() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    content: '',
    status: '',
    isFeatured: false,
    isHidden: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/posts');
      return res.json();
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast({ title: '成功', description: '貼文更新成功' });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法更新貼文', variant: 'destructive' });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast({ title: '成功', description: '貼文刪除成功' });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法刪除貼文', variant: 'destructive' });
    },
  });

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title,
      description: post.description,
      content: post.content,
      status: post.status,
      isFeatured: post.isFeatured,
      isHidden: post.isHidden
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdatePost = () => {
    if (!selectedPost) return;
    updatePostMutation.mutate({ id: selectedPost._id, data: editForm });
  };

  const handleDeletePost = () => {
    if (!selectedPost) return;
    deletePostMutation.mutate(selectedPost._id);
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
      key: 'title',
      header: '標題',
      render: (post: Post) => (
        <div className="max-w-xs">
          <SensitiveTextDisplay text={post.title} />
        </div>
      ),
    },
    {
      key: 'description',
      header: '描述',
      render: (post: Post) => (
        <div className="max-w-xs">
          <SensitiveTextDisplay text={post.description} />
        </div>
      ),
    },
    {
      key: 'author',
      header: '作者',
      render: (post: Post) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{post.userId?.name || '未知'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: '狀態',
      render: (post: Post) => getStatusBadge(post.status),
    },
    {
      key: 'featured',
      header: '精選',
      render: (post: Post) => (
        <Badge variant={post.isFeatured ? 'default' : 'secondary'}>
          {post.isFeatured ? '是' : '否'}
        </Badge>
      ),
    },
    {
      key: 'hidden',
      header: '隱藏',
      render: (post: Post) => (
        <Badge variant={post.isHidden ? 'destructive' : 'secondary'}>
          {post.isHidden ? '是' : '否'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: '建立時間',
      render: (post: Post) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (post: Post) => renderActions(post),
    },
  ];

  const renderActions = (post: Post) => (
    <div className="flex items-center space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>貼文詳情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">標題</h4>
              <SensitiveTextDisplay text={post.title} />
            </div>
            <div>
              <h4 className="font-semibold mb-2">描述</h4>
              <SensitiveTextDisplay text={post.description} />
            </div>
            <div>
              <h4 className="font-semibold mb-2">內容</h4>
              <SensitiveTextDisplay text={post.content} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">作者資訊</h4>
                <p>姓名: {post.userId?.name || '未知'}</p>
                <p>電子郵件: {post.userId?.email || '未知'}</p>
                <p>電話: {post.userId?.phoneNumber || '未知'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">貼文資訊</h4>
                <p>狀態: {getStatusBadge(post.status)}</p>
                <p>精選: {post.isFeatured ? '是' : '否'}</p>
                <p>隱藏: {post.isHidden ? '是' : '否'}</p>
                <p>建立時間: {new Date(post.createdAt).toLocaleDateString('zh-TW')}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(post)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(post)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入貼文列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">貼文管理</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">管理所有用戶貼文</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={posts || []}
      />

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>編輯貼文</DialogTitle>
            <DialogDescription>
              更新貼文資訊
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">標題</label>
              <Textarea
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="輸入貼文標題"
              />
            </div>
            <div>
              <label className="text-sm font-medium">描述</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="輸入貼文描述"
              />
            </div>
            <div>
              <label className="text-sm font-medium">內容</label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="輸入貼文內容"
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={editForm.isFeatured}
                  onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                />
                <label htmlFor="isFeatured" className="text-sm">精選貼文</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isHidden"
                  checked={editForm.isHidden}
                  onChange={(e) => setEditForm({ ...editForm, isHidden: e.target.checked })}
                />
                <label htmlFor="isHidden" className="text-sm">隱藏貼文</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdatePost} disabled={updatePostMutation.isPending}>
              {updatePostMutation.isPending ? '更新中...' : '更新'}
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
              您確定要刪除貼文 "{selectedPost?.title}" 嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDeletePost} 
              disabled={deletePostMutation.isPending}
              variant="destructive"
            >
              {deletePostMutation.isPending ? '刪除中...' : '刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 