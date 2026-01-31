import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchForm } from './components/SearchForm';
import { ResultsTable } from './components/ResultsTable';
import { useUniversitySearch } from './hooks/useUniversitySearch';
import { AlertCircle, Database } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      retry: 2,
    },
  },
});

function AppContent() {
  const { mutate, data, isPending, error, isSuccess } = useUniversitySearch();

  const handleSearch = (degree: string) => {
    mutate(degree);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">DegreeAnalyser</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <section className="mb-12">
          <SearchForm onSearch={handleSearch} isLoading={isPending} />
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error.message}</p>
          </div>
        )}

        {/* Results Section */}
        {isSuccess && data && (
          <section className="animate-fade-in">
            <ResultsTable 
              results={data.data.results} 
              degree={data.data.degree} 
            />
            
            {data.data.cached && (
              <div className="mt-4 text-center text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  Results served from cache
                </span>
              </div>
            )}
          </section>
        )}

        {/* Info Cards */}
        {!isSuccess && !isPending && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <InfoCard 
              title="Post-Study Work Visas"
              description="Check how long you can stay after graduation in different countries"
              icon="🌍"
            />
            <InfoCard 
              title="Industry Hubs"
              description="Match your degree to the country's economy and job market"
              icon="💼"
            />
            <InfoCard 
              title="Hidden Costs"
              description="Understand health insurance, visa fees, and proof of funds requirements"
              icon="💰"
            />
            <InfoCard 
              title="Employability Rankings"
              description="Compare graduate employment rates and starting salaries"
              icon="📈"
            />
            <InfoCard 
              title="Scholarship Realism"
              description="Distinguish between full-ride scholarships and tuition waivers"
              icon="🎓"
            />
            <InfoCard 
              title="Global Recognition"
              description="Verify accreditation by relevant global bodies (AACSB, ABET, etc.)"
              icon="✅"
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 International Student Degree Analyser. All rights reserved.</p>
            <p className="mt-2">
              Data powered by Tavily AI Search. Results are for informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
