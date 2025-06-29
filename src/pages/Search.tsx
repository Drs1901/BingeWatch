import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search as SearchIcon, Film, Tv, Loader, X, AlertCircle } from 'lucide-react';
import { search } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { useTranslation } from 'react-i18next';

type MediaType = 'all' | 'movie' | 'tv';

export const Search = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') as MediaType) || 'all';
  const [searchTerm, setSearchTerm] = useState(query);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(query);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        setSearchParams({ q: searchTerm.trim(), type });
        setDebouncedSearchTerm(searchTerm.trim());
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, type, setSearchParams]);

  // Update search term when URL query changes
  useEffect(() => {
    setSearchTerm(query);
    setDebouncedSearchTerm(query);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery(
    ['search', debouncedSearchTerm, type, i18n.language],
    () => search(debouncedSearchTerm),
    {
      enabled: !!debouncedSearchTerm,
      keepPreviousData: true,
      retry: 2,
      onError: (error: any) => {
        setError(error?.message || t('search.generic_error'));
      },
    }
  );

  const filteredResults = searchResults?.results.filter(
    (item) => type === 'all' || item.media_type === type
  );

  const mediaTypes: { value: MediaType; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: t('search.all'), icon: SearchIcon },
    { value: 'movie', label: t('search.movies'), icon: Film },
    { value: 'tv', label: t('search.tv_shows'), icon: Tv },
  ];

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchParams({ type });
    setError(null);
  };

  return (
    <>
      <SEO
        title={query ? t('search.results_for', { query }) : t('search.title')}
        description={
          query
            ? t('search.seo_description_query', { query })
            : t('search.seo_description_default')
        }
        keywords={t('search.seo_keywords', { query })}
        type="website"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full px-6 py-4 pl-14 pr-12 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              />
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              {mediaTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSearchParams({ q: searchTerm, type: value })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    type === value
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="text-center py-12 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">{t('search.error')}</h2>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader className="w-8 h-8 text-primary-500 animate-spin" />
                <p className="text-gray-400">{t('search.searching_for', { searchTerm })}</p>
              </div>
            </div>
          ) : searchTerm && (!filteredResults || filteredResults.length === 0) ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl">
              <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">{t('search.no_results')}</h2>
              <p className="text-gray-400">
                {t('search.no_results_description', { searchTerm })}
              </p>
            </div>
          ) : filteredResults ? (
            <>
              <div className="text-gray-400 mb-6">
                {t('search.found_results', {
                  count: filteredResults.length,
                  searchTerm,
                })}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredResults.map((item) => (
                  <MovieCard
                    key={`${item.media_type}-${item.id}`}
                    item={item}
                    mediaType={item.media_type as 'movie' | 'tv'}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
};