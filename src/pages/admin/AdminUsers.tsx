import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DataTable } from '../../components/ui/data-table';
import { useState } from 'react';
import { Edit, Trash2, User, Mail, Phone, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminFetch } from '../../lib/utils';

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    status: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/admin/users');
      return res.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: '成功', description: '用戶更新成功' });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法更新用戶', variant: 'destructive' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`https://stories-be.onrender.com/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: '成功', description: '用戶刪除成功' });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: '錯誤', description: '無法刪除用戶', variant: 'destructive' });
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      id: selectedUser._id,
      data: editForm
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser._id);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: 'default' as const, text: '管理員', color: 'text-red-600' },
      user: { variant: 'secondary' as const, text: '用戶', color: 'text-blue-600' },
      moderator: { variant: 'outline' as const, text: '版主', color: 'text-green-600' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: '啟用', color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, text: '停用', color: 'text-gray-600' },
      suspended: { variant: 'destructive' as const, text: '暫停', color: 'text-red-600' },
      pending: { variant: 'outline' as const, text: '待審核', color: 'text-yellow-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const columns = [
    {
      key: 'name',
      header: '姓名',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{user.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: '電子郵件',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{user.email}</span>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      header: '電話',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{user.phoneNumber}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: '角色',
      render: (user: User) => getRoleBadge(user.role),
    },
    {
      key: 'status',
      header: '狀態',
      render: (user: User) => getStatusBadge(user.status),
    },
    {
      key: 'createdAt',
      header: '註冊時間',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(user.createdAt).toLocaleDateString('zh-TW')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (user: User) => renderActions(user),
    },
  ];

  const renderActions = (user: User) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(user)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(user)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入用戶列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">用戶管理</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">管理所有註冊用戶</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users || []}
      />

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>編輯用戶</DialogTitle>
            <DialogDescription>
              更新用戶資訊
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">姓名</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="輸入用戶姓名"
              />
            </div>
            <div>
              <label className="text-sm font-medium">電子郵件</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="輸入電子郵件"
              />
            </div>
            <div>
              <label className="text-sm font-medium">電話</label>
              <input
                type="tel"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="輸入電話號碼"
              />
            </div>
            <div>
              <label className="text-sm font-medium">角色</label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用戶</SelectItem>
                  <SelectItem value="moderator">版主</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="suspended">暫停</SelectItem>
                  <SelectItem value="pending">待審核</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? '更新中...' : '更新'}
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
              您確定要刪除用戶 "{selectedUser?.name}" 嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDeleteUser} 
              disabled={deleteUserMutation.isPending}
              variant="destructive"
            >
              {deleteUserMutation.isPending ? '刪除中...' : '刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 