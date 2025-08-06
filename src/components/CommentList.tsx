import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

import { formatDate } from '../lib/utils';
import { UserCircle, Flag } from 'lucide-react';
import { SensitiveTextDisplay } from './SensitiveTextDisplay';
import ReportDialog from './ReportDialog';
import { useState } from 'react';
import { useAuth } from './providers/AuthProvider';
import { useToast } from '../hooks/use-toast';

interface Comment {
  _id: string;
  content: string;
  userId: {
    name: string;
    phoneNumber: string;
    email?: string;
  };
  createdAt: string;
}

interface CommentListProps {
  postId: string;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const [reportDialogOpen, setReportDialogOpen] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: comments, isLoading, error } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/comments`);
      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }
      return res.json();
    },
  });

  const handleReportComment = (commentId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to report this comment',
        variant: 'destructive'
      });
      return;
    }
    setReportDialogOpen(commentId);
  };

  if (isLoading) {
    return <div className="space-y-4 py-4">
      <div className="animate-pulse">
        <div className="flex space-x-3">
          <div className="h-8 w-8 bg-muted rounded-full"></div>
          <div className="flex-1 bg-muted/50 p-3 rounded-lg">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>;
  }

  if (error) {
    return <p className="text-sm text-muted-foreground py-4">Failed to load comments.</p>;
  }

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="space-y-4 py-4">
      {comments.map((comment) => (
        <div key={comment._id} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://placehold.co/40x40.png?text=${comment.userId.name.charAt(0)}`} />
            <AvatarFallback>
              <UserCircle className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {comment.userId.name}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt, 'MMM d, yyyy h:mm a')}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReportComment(comment._id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                >
                  <Flag className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="mt-1">
              <SensitiveTextDisplay 
                text={comment.content}
                className="text-sm text-foreground"
                showViolationBadge={false}
              />
            </div>
          </div>
        </div>
      ))}

      {reportDialogOpen && (
        <ReportDialog
          isOpen={!!reportDialogOpen}
          onClose={() => setReportDialogOpen(null)}
          contentType="comment"
          contentId={reportDialogOpen}
          contentTitle={comments.find(c => c._id === reportDialogOpen)?.content}
        />
      )}
    </div>
  );
};

export default CommentList;