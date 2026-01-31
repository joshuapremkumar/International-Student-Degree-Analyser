import { useState, type FormEvent } from 'react';
import { Search, GraduationCap } from 'lucide-react';

interface SearchFormProps {
  onSearch: (degree: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [degree, setDegree] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!degree.trim()) {
      setError('Please enter a degree name');
      return;
    }
    
    if (degree.trim().length < 2) {
      setError('Degree name must be at least 2 characters');
      return;
    }

    setError('');
    onSearch(degree.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <GraduationCap className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          International Student Degree Analyser
        </h1>
        <p className="text-lg text-gray-600">
          Find the top 30 universities worldwide for your desired degree
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            placeholder="Enter degree (e.g., Computer Science, MBA, Engineering)"
            className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>
        
        {error && (
          <p className="mt-2 text-red-600 text-sm animate-fade-in">{error}</p>
        )}
      </form>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-gray-500">Popular:</span>
        {['Computer Science', 'MBA', 'Engineering', 'Medicine', 'Data Science'].map((deg) => (
          <button
            key={deg}
            onClick={() => setDegree(deg)}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
          >
            {deg}
          </button>
        ))}
      </div>
    </div>
  );
}
