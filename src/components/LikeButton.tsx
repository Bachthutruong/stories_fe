"use client";

import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { cn } from '../lib/utils';
import { useAuth } from './providers/AuthProvider';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  isInitiallyLiked: boolean;
}

export function LikeButton({ postId, initialLikes, isInitiallyLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Effect to sync with potential external changes to isInitiallyLiked
  useEffect(() => {
    setIsLiked(isInitiallyLiked);
    setLikes(initialLikes);
  }, [isInitiallyLiked, initialLikes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent parent link navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (isLoading) return;
    
    // If user is logged in, proceed directly
    if (user?.user) {
      await performLike();
    } else {
      // If not logged in, show dialog to enter name
      setShowNameDialog(true);
    }
  };

  const performLike = async (name?: string) => {
    setIsLoading(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked ? likes + 1 : likes - 1;
    setIsLiked(newIsLiked);
    setLikes(newLikes);

    try {
      // const requestBody: any = {};
      
      if (user?.user) {
        // Logged in user
        const token = user.token;
        const res = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to update like status');
        }

        const result = await res.json();
        setLikes(result.likes);
        setIsLiked(result.isLiked);
        
        toast({
          title: "成功",
          description: result.isLiked ? '您已按讚此貼文！' : '您已取消按讚此貼文',
        });
             } else if (name) {
         // Non-logged in user with name
         const res = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/like-guest`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ userName: name }),
         });

        if (!res.ok) {
          throw new Error('Failed to update like status');
        }

        const result = await res.json();
        setLikes(result.likes);
        setIsLiked(result.isLiked);
        
        toast({
          title: "成功",
          description: result.isLiked ? '您已按讚此貼文！' : '您已取消按讚此貼文',
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(isLiked);
      setLikes(likes);
      
      toast({
        title: "錯誤",
        description: "更新按讚狀態失敗，請重試",
        variant: "destructive"
      });
      console.error('Like error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (!userName.trim()) {
      toast({
        title: "錯誤",
        description: "請輸入您的姓名",
        variant: "destructive"
      });
      return;
    }
    
    setShowNameDialog(false);
    performLike(userName.trim());
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={cn(
          "flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors",
          isLiked && "text-primary",
          isAnimating && "animate-subtle-pulse"
        )}
      >
        <Heart className={cn("h-4 w-4", isLiked && "fill-current text-primary")} />
        <span>{likes}</span>
      </Button>

      {/* Name Input Dialog for non-logged in users */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>按讚貼文</DialogTitle>
            <DialogDescription>
              請輸入您的姓名以按讚此貼文
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
              按讚
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
