import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarSlimProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBarSlim: React.FC<SearchBarSlimProps> = ({ 
  onSearch, 
  placeholder = "Search city, neighbourhood, or listing code",
  className = ""
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Slim search query:', query);
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-[var(--surface)]/50 border border-[var(--border)] rounded-full text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ember)] focus:border-transparent"
      />
    </form>
  );
};

export default SearchBarSlim;
