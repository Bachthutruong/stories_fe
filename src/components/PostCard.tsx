"use client";

import type { Post } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from './ui/button';
import { MessageCircle, MoreVertical, Flag, UserCircle, Phone, Mail } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { ShareButton } from './ui/share-button';
import { SensitiveTextDisplay } from './SensitiveTextDisplay';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import ReportDialog from './ReportDialog';
import { useState } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { useAuth } from './providers/AuthProvider';
import ImageTest from './ImageTest';

interface PostCardProps {
  post: Post;
  showInteractionsInitially?: boolean; // To control if comments/form are shown by default
  onPostUpdate?: (updatedPost: Post) => void; // For optimistic updates
}

const PostCard: React.FC<PostCardProps> = ({ post, showInteractionsInitially = false, onPostUpdate }) => {
  const { user } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(showInteractionsInitially);
  // const [currentComments, setCurrentComments] = useState<CommentType[]>(post.comments || []);

  const handleCommentAdded = () => {
    // Refresh comments after adding
    if (onPostUpdate) {
      onPostUpdate({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
    }
  };

  const canEdit = user && (user.user.id === post.userId?._id || user?.user.role === 'admin');

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={`https://placehold.co/40x40.png?text=${post.userId?.name?.charAt(0) || 'U'}`} data-ai-hint="avatar profile" />
              <AvatarFallback><UserCircle /></AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base md:text-lg">{post.userId?.name || 'Anonymous'}</CardTitle>
              <CardDescription className="text-xs">
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link to={`/posts/${post._id}/edit`}>Edit Post</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
                <Flag className="mr-2 h-4 w-4" /> Report
              </DropdownMenuItem>
              {/* Add other actions like "View Post Details" if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {/* Image Test Component */}
      <ImageTest images={post.images} />
      
      {post.images && post.images.length > 0 && (
        <div className="relative w-full aspect-[16/10] bg-muted overflow-hidden">
          <img 
            src={post.images[0].url} 
            alt={post.description.substring(0,50)} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <SensitiveTextDisplay 
            text={post.description}
            className="text-sm text-muted-foreground line-clamp-3"
            showViolationBadge={true}
          />
          
          {post.contactInfo && (
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-xs">
                <Phone className="h-3 w-3" />
                <span>{post.contactInfo.phoneNumber}</span>
              </div>
              {post.contactInfo.email && (
                <div className="flex items-center space-x-2 text-xs">
                  <Mail className="h-3 w-3" />
                  <span>{post.contactInfo.email}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <LikeButton 
              postId={post._id} 
              initialLikes={post.likes} 
              isInitiallyLiked={false}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.commentsCount || 0}</span>
            </Button>
            <ShareButton
              url={`/posts/${post._id}`}
              title={post.title}
              description={post.description}
              variant="ghost"
              size="sm"
              showText={false}
            />
          </div>
        </div>
      </CardFooter>

      {showComments && (
        <div className="border-t p-4">
          <div className="space-y-4">
            <CommentForm 
              postId={post._id} 
              onCommentAdded={handleCommentAdded}
            />
            <CommentList postId={post._id} />
          </div>
        </div>
      )}

      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        contentType="post"
        contentId={post._id}
        contentTitle={post.title}
      />
    </Card>
  );
};

export default PostCard;