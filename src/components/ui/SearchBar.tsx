import { useState } from 'react';
import { Search, X } from 'lucide-react';

//@ts-ignore
const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
//@ts-ignore
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div
      className={`relative flex items-center max-w-xl w-full rounded-lg border transition-all duration-200 bg-white ${
        isFocused
          ? 'border-indigo-500 ring-2 ring-indigo-100'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="w-full py-2.5 px-3 text-gray-700 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-gray-500"
        placeholder="Search by title, tags, or description..."
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="p-2 mr-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;