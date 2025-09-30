"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface TermsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

interface SiteSettings {
  termsAndConditions: {
    title: string;
    content: string;
  };
}

const TermsDialog: React.FC<TermsDialogProps> = ({ isOpen, onOpenChange, onAgree }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const response = await fetch('https://stories-be.onrender.com/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleAgree = () => {
    if (isConfirmed) {
      onAgree();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsConfirmed(false); // Reset checkbox when dialog closes
    }
    onOpenChange(open);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>載入中...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">正在載入條款...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg md:text-xl">
            {settings?.termsAndConditions?.title || '使用條款與隱私政策'}
          </DialogTitle>
          {/* <DialogDescription className="text-sm">
            Before submitting your post, please read and agree to our terms and conditions.
          </DialogDescription> */}
        </DialogHeader>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 text-sm min-h-0">
          <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {settings?.termsAndConditions?.content || 'Loading terms and conditions...'}
          </div>
        </div>
        
        {/* Fixed bottom section with checkbox and buttons */}
        <div className="flex-shrink-0 space-y-4 pt-4 border-t">
          {/* Enhanced Confirmation Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border border-muted">
            <Checkbox
              id="terms-confirm"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              className="mt-0.5"
            />
            <Label 
              htmlFor="terms-confirm" 
              className="text-sm text-foreground leading-relaxed cursor-pointer flex-1 select-none"
            >
              I confirm that I have read and agree to the terms and conditions
            </Label>
          </div>
          
          {/* Enhanced Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="flex-1 h-12 text-base font-medium"
            >
              取消
            </Button>
            <Button 
              onClick={handleAgree} 
              disabled={!isConfirmed}
              className={`flex-1 h-12 text-base font-medium transition-all duration-200 ${
                isConfirmed 
                  ? 'bg-primary hover:bg-primary/90 shadow-lg' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isConfirmed ? '我同意' : '接受並參與夢想牆'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;