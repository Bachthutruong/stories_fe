import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LikeButton } from '../components/LikeButton';
import { ShareButton } from '../components/ui/share-button';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import { Button } from '../components/ui/button';
import { MessageCircle, Flag } from 'lucide-react';
import { useAuth } from '../components/providers/AuthProvider';
import { useToast } from '../hooks/use-toast';
import { SensitiveTextDisplay } from '../components/SensitiveTextDisplay';
import ReportDialog from '../components/ReportDialog';
import { ImageCarousel } from '../components/ImageCarousel';
import { generatePostLuckyNumber } from '../hooks/useLuckyNumber';
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
  userId: {
    name: string;
    phoneNumber: string;
    email: string;
  };
  createdAt: string;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await fetch(`https://stories-be.onrender.com/api/posts/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch post');
      }
      return res.json();
    },
  });

  const handleShareClick = async () => {
    try {
      // Only update share count if user is logged in
      if (user?.user) {
        const token = user.token;
        const res = await fetch(`https://stories-be.onrender.com/api/posts/${id}/share`, {
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
          title: 'Shared!',
          description: result.message,
        });
      } else {
        // Still show success message even if not logged in
        toast({
          title: 'Shared!',
          description: 'Post shared successfully',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update share count',
        variant: 'destructive',
      });
    }
  };

  const handleReport = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to report this post',
        variant: 'destructive'
      });
      return;
    }
    setIsReportDialogOpen(true);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (error || !post) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error?.message}</div>;
  }

  // const postId = post.postId || post._id;
  const description = post.description || post.content || '';

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between bg-primary/10 px-2 sm:px-3 py-2 rounded">
            <div className="flex flex-col flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-2xl text-foreground m-0 p-0 truncate">{post.title}</CardTitle>
            </div>
            <span className="ml-2 sm:ml-4 bg-blue-700 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold flex-shrink-0">
              {generatePostLuckyNumber(post)}
            </span>
          </div>
          <CardDescription className="text-sm sm:text-base mt-1">
          來自於 {post.userId?.name || 'Anonymous'} - {new Date(post.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {post.images && post.images.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <ImageCarousel 
                images={post.images}
                alt={description}
                className="w-full"
              />
            </div>
          )}
          
          <div className="mb-4 sm:mb-6">
            <SensitiveTextDisplay 
              text={description}
              className="text-sm sm:text-lg text-gray-700 leading-relaxed"
              showViolationBadge={true}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2 sm:space-x-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LikeButton 
                postId={post._id} 
                initialLikes={post.likes} 
                isInitiallyLiked={false}
              />
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                <ShareButton
                  url={`/posts/${post._id}`}
                  title={post.title}
                  description={description}
                  variant="ghost"
                  size="sm"
                  showText={false}
                  onShare={handleShareClick}
                />
                <span className="text-xs sm:text-sm text-muted-foreground">{post.shares}</span>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center space-x-0.5 sm:space-x-1 text-muted-foreground p-1 sm:p-2">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{post.commentsCount}</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReport}
              className="flex items-center space-x-1 text-muted-foreground hover:text-red-500 p-1 sm:p-2"
            >
              <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">回報問題，守護夢想！</span>
            </Button>
          </div>

          <div className="border-t pt-4 sm:pt-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">陪夢想說說話            </h3>
            {user ? (
              <CommentForm postId={post._id} />
            ) : (
              <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">登入後，把你的心意送給這張夢想卡</p>
            )}
            <CommentList postId={post._id} />
          </div>
        </CardContent>
      </Card>

      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        contentType="post"
        contentId={post._id}
        contentTitle={post.title}
      />
    </div>
  );
} 