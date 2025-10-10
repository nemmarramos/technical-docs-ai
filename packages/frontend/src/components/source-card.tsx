import { FileText, MapPin } from 'lucide-react';
import type { SearchResult } from '../types';

interface SourceCardProps {
  source: SearchResult;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const { metadata, content, score } = source;
  const fileName = metadata.source.split('/').pop() || metadata.source;
  const relevance = Math.round(score * 100);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
            {index + 1}
          </div>
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-white truncate">{fileName}</span>
        </div>
        <span className="text-xs text-gray-400 ml-2">{relevance}% match</span>
      </div>

      {metadata.heading && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-400">
          <MapPin className="h-3 w-3" />
          <span>{metadata.heading}</span>
        </div>
      )}

      <pre className="text-sm text-gray-300 bg-slate-900 rounded p-3 overflow-x-auto whitespace-pre-wrap">
        {content}
      </pre>

      {metadata.lineStart && metadata.lineEnd && (
        <div className="mt-2 text-xs text-gray-500">
          Lines {metadata.lineStart}-{metadata.lineEnd}
        </div>
      )}
    </div>
  );
}
