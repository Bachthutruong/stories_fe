import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { LikeButton } from '../components/LikeButton';
import { ShareButton } from '../components/ui/share-button';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MessageCircle, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/providers/AuthProvider';
import { useToast } from '../hooks/use-toast';

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
  userId?: {
    name: string;
    phoneNumber: string;
    email: string;
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

export default function PostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('https://stories-be.onrender.com/api/posts');
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }
      return res.json();
    },
  });

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    if (!posts) return [];

    let filtered = posts;

    // Search by name or phone number
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        (post.userId?.name?.toLowerCase().includes(searchLower) || false) ||
        (post.userId?.phoneNumber?.includes(searchTerm) || false)
      );
    }

    // Sort posts
    switch (sortBy) {
      case 'likes':
        return filtered.sort((a, b) => b.likes - a.likes);
      case 'shares':
        return filtered.sort((a, b) => b.shares - a.shares);
      case 'comments':
        return filtered.sort((a, b) => b.commentsCount - a.commentsCount);
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [posts, searchTerm, sortBy]);

  const handleShareClick = async (postId: string) => {
    try {
      // Only update share count if user is logged in
      if (user?.user) {
        const token = user.token;
        const res = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to update share count');
        }
        const result = await res.json();
        toast({
          title: '分享成功！',
          description: result.message,
        });
      } else {
        // Still show success message even if not logged in
        toast({
          title: '分享成功！',
          description: '貼文已成功分享',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: '錯誤',
        description: '更新分享次數失敗',
        variant: 'destructive',
      });
    }
  };

  const renderPostCard = (post: Post) => {
    const luckyNumber = post.postId ? parseInt(post.postId.split('_').pop() || '0') : 0;
    
    return (
      <Link key={post._id} to={`/posts/${post._id}`} className="block">
        <Card className="w-full max-w-sm shadow-lg border-none hover:shadow-xl transition-shadow duration-300 h-full flex flex-col relative">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
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
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p>作者: {post.userId?.name || '匿名'}</p>
              <p>電話: {post.userId?.phoneNumber || '未提供'}</p>
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
                  onShare={() => handleShareClick(post._id)}
                />
              </div>
              <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-0.5 sm:space-x-1">
                <Button variant="ghost" size="sm" className="flex items-center space-x-0.5 sm:space-x-1 text-muted-foreground p-1 sm:p-2">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{post.commentsCount}</span>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  };

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
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">所有夢想卡</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜尋姓名或電話號碼..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="sm:w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新發布</SelectItem>
                <SelectItem value="oldest">最早發布</SelectItem>
                <SelectItem value="likes">按讚最多</SelectItem>
                <SelectItem value="shares">分享最多</SelectItem>
                <SelectItem value="comments">評論最多</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          找到 {filteredAndSortedPosts.length} 個夢想卡
          {searchTerm && ` (搜尋: "${searchTerm}")`}
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
          {Array.from({ length: 8 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredAndSortedPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchTerm ? '沒有找到符合搜尋條件的夢想卡' : '目前沒有夢想卡'}
          </div>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              清除搜尋
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
          {filteredAndSortedPosts.map(renderPostCard)}
        </div>
      )}
    </div>
  );
} 