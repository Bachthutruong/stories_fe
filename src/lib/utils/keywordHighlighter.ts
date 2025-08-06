interface SensitiveKeyword {
  word: string;
  action: string;
  severity: string;
}

export const highlightSensitiveKeywords = (
  text: string, 
  keywords: SensitiveKeyword[]
): { text: string; hasViolations: boolean; violations: SensitiveKeyword[] } => {
  if (!keywords || keywords.length === 0) {
    return { text, hasViolations: false, violations: [] };
  }

  let highlightedText = text;
  const violations: SensitiveKeyword[] = [];
  const foundWords = new Set<string>();

  // Sort keywords by length (longest first) to avoid partial matches
  const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length);

  for (const keyword of sortedKeywords) {
    const regex = new RegExp(`(${keyword.word})`, 'gi');
    const matches = text.match(regex);
    
    if (matches && matches.length > 0) {
      violations.push(keyword);
      foundWords.add(keyword.word.toLowerCase());
      
      // Highlight the keyword with appropriate styling based on severity
      const highlightClass = getHighlightClass(keyword.severity);
      highlightedText = highlightedText.replace(
        regex,
        `<span class="${highlightClass}" title="Sensitive keyword: ${keyword.word} (${keyword.severity})">$1</span>`
      );
    }
  }

  return {
    text: highlightedText,
    hasViolations: violations.length > 0,
    violations
  };
};

const getHighlightClass = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'bg-red-200 text-red-800 border border-red-300 px-1 rounded';
    case 'medium':
      return 'bg-yellow-200 text-yellow-800 border border-yellow-300 px-1 rounded';
    case 'low':
      return 'bg-orange-200 text-orange-800 border border-orange-300 px-1 rounded';
    default:
      return 'bg-gray-200 text-gray-800 border border-gray-300 px-1 rounded';
  }
};

export const checkForViolations = (
  text: string, 
  keywords: SensitiveKeyword[]
): { hasViolations: boolean; violations: SensitiveKeyword[] } => {
  if (!keywords || keywords.length === 0) {
    return { hasViolations: false, violations: [] };
  }

  const violations: SensitiveKeyword[] = [];

  for (const keyword of keywords) {
    const regex = new RegExp(keyword.word, 'gi');
    if (regex.test(text)) {
      violations.push(keyword);
    }
  }

  return {
    hasViolations: violations.length > 0,
    violations
  };
};

export const getViolationSummary = (violations: SensitiveKeyword[]): string => {
  if (violations.length === 0) return '';

  const severityCounts = violations.reduce((acc, violation) => {
    acc[violation.severity] = (acc[violation.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const parts = [];
  if (severityCounts.high) parts.push(`${severityCounts.high} high severity`);
  if (severityCounts.medium) parts.push(`${severityCounts.medium} medium severity`);
  if (severityCounts.low) parts.push(`${severityCounts.low} low severity`);

  return `Contains ${parts.join(', ')} violations`;
}; 