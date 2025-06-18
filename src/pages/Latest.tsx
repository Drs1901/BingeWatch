import React from 'react';
import { useQuery } from 'react-query';
import { Clock, Film, Tv } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLatest } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { Movie, TVShow } from '../types/tmdb';

export const Latest = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'movie' | 'tv'>('movie');

  const { data: latestItems, isLoading } = useQuery(
    ['latest', activeTab, i18n.language],
    () => getLatest(activeTab),
    {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  const tabs = [
    { id: 'movie' as const, label: t('latest.movies_tab'), icon: Film },
    { id: 'tv' as const, label: t('latest.tv_shows_tab'), icon: Tv },
  ];

  return (
    <>
      <SEO
        title={t(activeTab === 'movie' ? 'latest.title_movies' : 'latest.title_tv_shows')}
        description={t(activeTab === 'movie' ? 'latest.seo_description_movies' : 'latest.seo_description_tv_shows')}
        keywords={t(activeTab === 'movie' ? 'latest.seo_keywords_movies' : 'latest.seo_keywords_tv_shows')}
        type="website"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">
            {t(activeTab === 'movie' ? 'latest.heading_movies' : 'latest.heading_tv_shows')}
          </h1>
        </div>

        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg w-fit mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                activeTab === id
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800/50 rounded-xl" />
                <div className="mt-3 h-4 bg-gray-800/50 rounded-full w-3/4" />
                <div className="mt-2 h-4 bg-gray-800/50 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : !latestItems || latestItems.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.03] rounded-xl">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">{t(activeTab === 'movie' ? 'latest.no_movies_found' : 'latest.no_tv_shows_found')}</h2>
            <p className="text-gray-400">
              {t(activeTab === 'movie'
                ? 'latest.no_movies_message'
                : 'latest.no_tv_shows_message')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {latestItems.map((item: Movie | TVShow) => (
              <MovieCard key={item.id} item={item} mediaType={activeTab} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};