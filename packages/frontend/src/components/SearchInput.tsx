import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchInput({ onSearch, isLoading = false, placeholder }: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || 'Ask a question about the documentation...'}
          disabled={isLoading}
          className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-lg
                   text-white placeholder-gray-400 focus:outline-none focus:ring-2
                   focus:ring-primary-500 focus:border-transparent disabled:opacity-50
                   disabled:cursor-not-allowed transition-all"
        />
      </div>
    </form>
  );
}
