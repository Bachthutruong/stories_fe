import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { generatePostLuckyNumber } from '../hooks/useLuckyNumber';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { LikeButton } from '../components/LikeButton';
import { ShareButton } from '../components/ui/share-button';
import { MessageCircle, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/providers/AuthProvider';
import { useToast } from '../hooks/use-toast';
import { useState } from 'react';

interface Post {
  _id: string;
  postId?: string;
  title: string;
  description: string;
  content?: string;
  images?: { url: string; public_id: string }[];
  likes: number;
  shares: number;
  commentsCount: number;
  status: string;
  isFeatured: boolean;
  isHidden: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  createdAt: string;
}

const PostCardSkeleton = () => (
  <Card className="w-full max-w-sm shadow-lg border-none animate-pulse h-full flex flex-col relative">
    <CardHeader className="p-3 sm:p-4">
      <Skeleton className="h-5 sm:h-6 w-3/4" />
      <Skeleton className="h-3 sm:h-4 w-1/2" />
    </CardHeader>
    <CardContent className="flex-grow p-3 sm:p-4">
      <Skeleton className="w-full h-32 sm:h-48 mb-3 sm:mb-4 rounded-md" />
      <Skeleton className="h-3 sm:h-4 w-full mb-2" />
      <Skeleton className="h-3 sm:h-4 w-2/3" />
    </CardContent>
    <CardFooter className="flex justify-between items-center p-3 sm:p-4">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
        <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
        <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
      </div>
    </CardFooter>
  </Card>
);

export default function MyPostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['my-posts'],
    queryFn: async () => {
      if (!user?.user) throw new Error('用戶未登入');
      const token = user.token;
      const res = await fetch('https://stories-be.onrender.com/api/posts/my-posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('獲取貼文失敗');
      }
      return res.json();
    },
    enabled: !!user?.user,
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.user) throw new Error('用戶未登入');
      const token = user.token;
      const res = await fetch(`https://stories-be.onrender.com/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('刪除貼文失敗');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      toast({
        title: '刪除成功',
        description: '貼文已成功刪除',
      });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: (error) => {
      toast({
        title: '刪除失敗',
        description: error instanceof Error ? error.message : '刪除貼文時發生錯誤',
        variant: 'destructive',
      });
    },
  });

  const handleDeletePost = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete._id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { variant: 'default' as const, text: '已發布', color: 'text-green-600' },
      draft: { variant: 'secondary' as const, text: '草稿', color: 'text-gray-600' },
      archived: { variant: 'outline' as const, text: '已封存', color: 'text-gray-500' },
      pending_review: { variant: 'outline' as const, text: '審核中', color: 'text-yellow-600' },
      rejected: { variant: 'destructive' as const, text: '已拒絕', color: 'text-red-600' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.published;
    return <Badge variant={config.variant} className={config.color}>{config.text}</Badge>;
  };

  const renderPostCard = (post: Post) => {
            const luckyNumber = post.postId ? generatePostLuckyNumber(post.postId) : '000';
    
    return (
      <Card key={post._id} className="w-full max-w-sm shadow-lg border-none hover:shadow-xl transition-shadow duration-300 h-full flex flex-col relative">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {post.isFeatured && (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    ⭐ 精選
                  </Badge>
                )}
                {post.isHidden && (
                  <Badge variant="destructive">
                    🙈 已隱藏
                  </Badge>
                )}
                {getStatusBadge(post.status)}
              </div>
              <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 mb-1">
                {post.title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-2">
                {post.description}
              </CardDescription>
            </div>
                                        <div className="ml-2 text-xs sm:text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {luckyNumber}
                            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-3 sm:p-4">
          {post.images && post.images.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <img 
                src={post.images[0].url} 
                alt={post.title}
                className="w-full h-32 sm:h-48 object-cover rounded-md"
              />
            </div>
          )}
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{post.userId.name}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton 
                postId={post._id} 
                initialLikes={post.likes} 
                isInitiallyLiked={false}
              />
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <ShareButton 
                url={`/posts/${post._id}`}
                title={post.title}
                description={post.description}
                variant="ghost"
                size="sm"
                showText={false}
              />
            </div>
            <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-0.5 sm:space-x-1">
              <Button variant="ghost" size="sm" className="flex items-center space-x-0.5 sm:space-x-1 text-muted-foreground p-1 sm:p-2">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{post.commentsCount}</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link to={`/posts/${post._id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/posts/${post._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeletePost(post)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  if (!user?.user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-muted-foreground mb-4">請先登入以查看您的貼文</div>
        <Link to="/login">
          <Button>登入</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-red-500 mb-4">錯誤: {error.message}</div>
        <Button onClick={() => window.location.reload()}>重試</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">我的夢想卡</h1>
        <p className="text-muted-foreground">
          查看和管理您發布的所有夢想卡
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
          {Array.from({ length: 8 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
          {posts.map(renderPostCard)}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            您還沒有發布任何夢想卡
          </div>
          <Link to="/create-post">
            <Button>發布第一個夢想卡</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              您確定要刪除夢想卡 "{postToDelete?.title}" 嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? '刪除中...' : '確認刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 