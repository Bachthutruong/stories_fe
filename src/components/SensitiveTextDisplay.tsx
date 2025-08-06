import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { highlightSensitiveKeywords, checkForViolations, getViolationSummary } from '../lib/utils/keywordHighlighter';
import { useKeywords } from '../hooks/useKeywords';

interface SensitiveTextDisplayProps {
  text: string;
  showViolationBadge?: boolean;
  className?: string;
}

export const SensitiveTextDisplay: React.FC<SensitiveTextDisplayProps> = ({
  text,
  showViolationBadge = true,
  className = ''
}) => {
  const { data: keywords, isLoading } = useKeywords();

  if (isLoading || !keywords) {
    return <span className={className}>{text}</span>;
  }

  const { text: highlightedText, hasViolations, violations } = highlightSensitiveKeywords(text, keywords || []);
  const violationSummary = getViolationSummary(violations);

  return (
    <div className="relative">
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
      
      {showViolationBadge && hasViolations && (
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Violations Detected
          </Badge>
          <span className="text-xs text-muted-foreground">
            {violationSummary}
          </span>
        </div>
      )}
    </div>
  );
};

export const checkTextViolations = (text: string, keywords: any[]) => {
  return checkForViolations(text, keywords);
}; 