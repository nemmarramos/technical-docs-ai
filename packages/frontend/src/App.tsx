import { useState } from 'react';
import { Brain, AlertCircle } from 'lucide-react';
import { SearchInput } from './components/SearchInput';
import { AnswerDisplay } from './components/AnswerDisplay';
import { SourceCard } from './components/SourceCard';
import { ConversationHistory } from './components/ConversationHistory';
import { CostTracker } from './components/CostTracker';
import { useConversationHistory, useQuestion } from './hooks/useApi';
import type { ConversationMessage, SearchResult } from './types';

function App() {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentSources, setCurrentSources] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');

  const { messages, clearHistory, addMessage } = useConversationHistory();
  const { askQuestion, isAsking, error } = useQuestion();

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);
    setCurrentAnswer('');
    setCurrentSources([]);

    const response = await askQuestion(query);
    if (response) {
      setCurrentAnswer(response.answer);
      setCurrentSources(response.sources);
      addMessage(response);
    }
  };

  const handleSelectMessage = (message: ConversationMessage) => {
    setCurrentQuery(message.query);
    setCurrentAnswer(message.answer);
    setCurrentSources(message.sources);
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all conversation history?')) {
      await clearHistory();
      setCurrentAnswer('');
      setCurrentSources([]);
      setCurrentQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Technical Docs AI
                </h1>
                <p className="text-sm text-gray-400">Intelligent documentation search powered by RAG</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchInput onSearch={handleSearch} isLoading={isAsking} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Error</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Cost Tracker */}
        <div className="mb-8">
          <CostTracker />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Answer and Sources */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Query */}
            {currentQuery && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-white mb-2">Your Question:</h2>
                <p className="text-gray-300">{currentQuery}</p>
              </div>
            )}

            {/* Answer */}
            {(currentAnswer || isAsking) && (
              <AnswerDisplay answer={currentAnswer} isLoading={isAsking} />
            )}

            {/* Sources */}
            {currentSources.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>Source Documents</span>
                  <span className="text-sm text-gray-400 font-normal">
                    ({currentSources.length} found)
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {currentSources.map((source, index) => (
                    <SourceCard key={source.id} source={source} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!currentQuery && !isAsking && (
              <div className="text-center py-16">
                <Brain className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                  Ask anything about the documentation
                </h2>
                <p className="text-gray-500">
                  Get AI-powered answers with source citations from your technical docs
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() => handleSearch('What are React hooks?')}
                    className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg
                             text-left transition-colors group"
                  >
                    <p className="text-white font-medium mb-1 group-hover:text-primary-400 transition-colors">
                      What are React hooks?
                    </p>
                    <p className="text-sm text-gray-400">Learn about React's built-in hooks</p>
                  </button>
                  <button
                    onClick={() => handleSearch('How do I use useEffect?')}
                    className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg
                             text-left transition-colors group"
                  >
                    <p className="text-white font-medium mb-1 group-hover:text-primary-400 transition-colors">
                      How do I use useEffect?
                    </p>
                    <p className="text-sm text-gray-400">Understand side effects in React</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <ConversationHistory
              messages={messages}
              onClear={handleClearHistory}
              onSelectMessage={handleSelectMessage}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by OpenAI GPT-4 + Pinecone Vector Database • Built with React + TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
