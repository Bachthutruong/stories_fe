import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { Badge } from '../components/ui/badge';
import { User, Mail, Phone, Calendar, Edit, Save, X, Shield, Heart, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '../components/providers/AuthProvider';
import { useToast } from '../hooks/use-toast';
import { formatDate } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface UserStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  joinDate: string;
}

export default function MyAccountPage() {
  const { user, updateUserFromStorage, refreshUserData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  // Update editForm when user data is available
  React.useEffect(() => {
    if (user?.user) {
      setEditForm({
        name: user.user.name || '',
        email: user.user.email || '',
        phoneNumber: user.user.phoneNumber || '',
      });
    }
  }, [user]);

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      if (!user?.user) throw new Error('User not logged in');
      
      const token = user.token;
      const response = await fetch('https://stories-be.onrender.com/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      
      return response.json();
    },
    enabled: !!user?.user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      if (!user?.user) throw new Error('User not logged in');
      
      const token = user.token;
      const response = await fetch('https://stories-be.onrender.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: '成功',
        description: '個人資料已更新',
      });
      setIsEditing(false);
      
      // Update local user data without logging out
      if (data.user) {
        const currentUser = JSON.parse(localStorage.getItem('hem-story-user') || '{}');
        const updatedUser = {
          ...currentUser,
          user: {
            ...currentUser.user,
            ...data.user
          }
        };
        localStorage.setItem('hem-story-user', JSON.stringify(updatedUser));
        
        // Refresh user data in context
        refreshUserData();
        
        // Show dialog asking if user wants to logout
        setShowLogoutDialog(true);
      }
      
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: '錯誤',
        description: error.message || '更新個人資料失敗，請重試',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    // Validate form
    if (!editForm.name.trim()) {
      toast({
        title: '錯誤',
        description: '請輸入姓名',
        variant: 'destructive',
      });
      return;
    }
    
    if (!editForm.email.trim()) {
      toast({
        title: '錯誤',
        description: '請輸入電子郵件',
        variant: 'destructive',
      });
      return;
    }
    
    if (!editForm.phoneNumber.trim()) {
      toast({
        title: '錯誤',
        description: '請輸入電話號碼',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast({
        title: '錯誤',
        description: '請輸入有效的電子郵件格式',
        variant: 'destructive',
      });
      return;
    }
    
    updateProfileMutation.mutate(editForm);
  };

  const handleCancel = () => {
    if (user?.user) {
      setEditForm({
        name: user.user.name || '',
        email: user.user.email || '',
        phoneNumber: user.user.phoneNumber || '',
      });
    }
    setIsEditing(false);
  };

  const handleLogoutConfirm = () => {
    // Force logout by clearing storage and calling updateUserFromStorage
    localStorage.removeItem('hem-story-user');
    localStorage.removeItem('hem-story-token');
    updateUserFromStorage();
    setShowLogoutDialog(false);
    toast({
      title: '已登出',
      description: '您已成功登出，請重新登入',
    });
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
    // Refresh user data to show updated info
    refreshUserData();
    toast({
      title: '保持登入',
      description: '您選擇保持登入狀態，個人資料已更新',
    });
  };

  if (!user || !user.user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">我的帳戶</h1>
        <p className="text-muted-foreground">請先登入才能查看您的帳戶資訊</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">我的帳戶</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>個人資料</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">電子郵件</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">電話號碼</Label>
                    <Input
                      id="phone"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4 mr-1" />
                      {updateProfileMutation.isPending ? '儲存中...' : '儲存'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.user?.name || '未知'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.user?.email || '未知'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.user?.phoneNumber || '未知'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>加入時間：{stats?.joinDate ? formatDate(stats.joinDate, 'yyyy年MM月dd日') : '未知'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>角色：{user.user?.role === 'admin' ? '管理員' : '一般用戶'}</span>
                  </div>
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    編輯資料
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="stats" className="space-y-4">
            <TabsList>
              <TabsTrigger value="stats">統計資料</TabsTrigger>
              <TabsTrigger value="activity">活動記錄</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>統計資料</CardTitle>
                  <CardDescription>您的貼文和互動統計</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
                        <div className="text-sm text-muted-foreground">發布的貼文</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                        <div className="text-2xl font-bold">{stats?.totalLikes || 0}</div>
                        <div className="text-sm text-muted-foreground">收到的讚</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
                        <div className="text-sm text-muted-foreground">發表的評論</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>活動記錄</CardTitle>
                  <CardDescription>您最近的活動</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>您發布了一則新貼文</span>
                      </div>
                      <span className="text-sm text-muted-foreground">2小時前</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span>您的貼文收到了5個讚</span>
                      </div>
                      <span className="text-sm text-muted-foreground">1天前</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span>您評論了一則貼文</span>
                      </div>
                      <span className="text-sm text-muted-foreground">3天前</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登出確認</DialogTitle>
            <DialogDescription>
              您的個人資料已更新成功。您是否要登出並重新登入以確保所有變更生效？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleLogoutCancel}>
              保持登入
            </Button>
            <Button onClick={handleLogoutConfirm}>
              登出並重新登入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 