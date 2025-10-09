import ReactMarkdown from 'react-markdown';
import { Bot, Loader2 } from 'lucide-react';

interface AnswerDisplayProps {
  answer: string;
  isLoading?: boolean;
}

export function AnswerDisplay({ answer, isLoading }: AnswerDisplayProps) {
  if (!answer && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary-500/20 rounded-lg">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />
          ) : (
            <Bot className="h-5 w-5 text-primary-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-white">AI Answer</h3>
      </div>

      <div className="markdown-content prose prose-invert max-w-none">
        <ReactMarkdown>{answer || 'Thinking...'}</ReactMarkdown>
      </div>
    </div>
  );
}
