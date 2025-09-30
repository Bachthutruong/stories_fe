"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from './providers/AuthProvider';
import { useToast } from '../hooks/use-toast';

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment too long"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [pendingComment, setPendingComment] = useState('');

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const submitComment = async (content: string, name?: string) => {
    setIsSubmitting(true);
    
    try {
      if (user?.user) {
        // Logged in user
        const token = user.token;
        const response = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to post comment');
        }
      } else if (name) {
        // Guest user
        const response = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/comments-guest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, userName: name }),
        });

        if (!response.ok) {
          throw new Error('Failed to post comment');
        }
      }

      form.reset({ content: '' });
      toast({ title: "Comment Added", description: "Your comment has been posted." });
      
      if (onCommentAdded) {
        onCommentAdded();
      }

    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({ title: "Error", description: "Could not post comment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<CommentFormData> = async (data) => {
    if (!user?.user) {
      // If not logged in, show dialog to enter name
      setPendingComment(data.content);
      setShowNameDialog(true);
      return;
    }
    
    await submitComment(data.content);
  };

  const handleNameSubmit = () => {
    if (!userName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }
    
    setShowNameDialog(false);
    submitComment(pendingComment, userName.trim());
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 border-t mt-4">
          <h3 className="text-lg font-semibold font-headline">寫下你的祝福或鼓勵</h3>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">留言</FormLabel>
                <FormControl>
                  <Textarea placeholder="輕輕留下一句話，讓夢想不孤單…" {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : '送出祝福'}
          </Button>
        </form>
      </Form>

      {/* Name Input Dialog for non-logged in users */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>送出祝福</DialogTitle>
            <DialogDescription>
              請輸入您的姓名以留言
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">姓名</Label>
              <Input
                id="user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="請輸入您的姓名"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>
              取消
            </Button>
            <Button onClick={handleNameSubmit}>
              留言
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommentForm;
