"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './providers/AuthProvider';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment';
  contentId: string;
  contentTitle?: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: '垃圾訊息或誤導性內容' },
  { value: 'inappropriate', label: '不當或冒犯性內容' },
  { value: 'harassment', label: '騷擾或霸凌' },
  { value: 'violence', label: '暴力或威脅' },
  { value: 'copyright', label: '版權侵犯' },
  { value: 'other', label: '其他' },
];

export default function ReportDialog({ 
  isOpen, 
  onClose, 
  contentType, 
  contentId, 
  contentTitle 
}: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: '需要選擇原因',
        description: '請選擇舉報原因',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.user) {
      toast({
        title: '需要登入',
        description: '請先登入才能提交舉報',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = user.token;
      const response = await fetch('https://stories-be.onrender.com/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '提交舉報失敗');
      }

      toast({
        title: '舉報已提交',
        description: '感謝您的舉報，我們會盡快審核。',
      });

      // Reset form
      setReason('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: '錯誤',
        description: error instanceof Error ? error.message : '提交舉報失敗',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>舉報{contentType === 'post' ? '貼文' : '評論'}</DialogTitle>
          <DialogDescription>
            透過舉報不當內容來幫助我們維護社群安全。
            {contentTitle && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>內容：</strong> {contentTitle}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">舉報原因</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="請選擇原因" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">其他詳情（選填）</Label>
            <Textarea
              id="description"
              placeholder="請提供任何額外的說明..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !reason}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? '提交中...' : '提交舉報'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}