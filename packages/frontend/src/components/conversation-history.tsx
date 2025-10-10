import { Clock, MessageSquare, Trash2 } from 'lucide-react';
import type { ConversationMessage } from '../types';

interface ConversationHistoryProps {
  messages: ConversationMessage[];
  onClear: () => void;
  onSelectMessage: (message: ConversationMessage) => void;
}

export function ConversationHistory({
  messages,
  onClear,
  onSelectMessage,
}: ConversationHistoryProps) {
  if (messages.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No conversation history yet</p>
        <p className="text-sm text-gray-500 mt-2">Your questions will appear here</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Conversation History</h3>
          <span className="text-sm text-gray-400">({messages.length})</span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-1 text-sm text-red-400 hover:text-red-300
                   hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => onSelectMessage(message)}
            className="w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700/50
                     transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-white font-medium line-clamp-2 flex-1">{message.query}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{message.sources.length} sources</span>
              <span className="text-green-400">${message.cost.totalCost.toFixed(4)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
