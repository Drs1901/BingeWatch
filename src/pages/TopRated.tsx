import React from 'react';
import { useQuery } from 'react-query';
import { Star, Film, Tv } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTopRated } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { Movie, TVShow } from '../types/tmdb';

export const TopRated = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'movie' | 'tv'>('movie');

  const { data: topRatedItems, isLoading } = useQuery(
    ['topRated', activeTab, i18n.language],
    () => getTopRated(activeTab)
  );

  const tabs = [
    { id: 'movie' as const, label: t('top_rated.movies_tab'), icon: Film },
    { id: 'tv' as const, label: t('top_rated.tv_shows_tab'), icon: Tv },
  ];

  return (
    <>
      <SEO
        title={t('top_rated.title')}
        description={t('top_rated.seo_description')}
        keywords={t('top_rated.seo_keywords')}
        type="website"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">{t('top_rated.heading')}</h1>
        </div>

        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg w-fit mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                activeTab === id
                  ? "bg-primary-500 text-white"
                  : "text-gray-400 hover:text-white"
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
                <div className="aspect-[2/3] bg-gray-800 rounded-lg" />
                <div className="mt-2 h-4 bg-gray-800 rounded w-3/4" />
                <div className="mt-2 h-4 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {topRatedItems?.map((item: Movie | TVShow) => (
              <MovieCard key={item.id} item={item} mediaType={activeTab} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};