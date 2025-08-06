"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{settings?.termsAndConditions?.title || 'Terms and Conditions'}</DialogTitle>
          <DialogDescription>
            Before submitting your post, please read and agree to our terms and conditions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="whitespace-pre-wrap text-muted-foreground">
            {settings?.termsAndConditions?.content || 'Loading terms and conditions...'}
          </div>
          
          {/* Confirmation Checkbox */}
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="terms-confirm"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
            />
            <Label htmlFor="terms-confirm" className="text-sm text-gray-700">
              I confirm that I have read and agree to the terms and conditions
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAgree} disabled={!isConfirmed}>
            I Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;