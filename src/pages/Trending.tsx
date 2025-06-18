import React from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, Film, Tv } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTrending } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { Movie, TVShow } from '../types/tmdb';

export const Trending = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'movie' | 'tv'>('movie');
  const [timeWindow, setTimeWindow] = React.useState<'day' | 'week'>('week');

  const { data: trendingItems, isLoading } = useQuery(
    ['trending', activeTab, timeWindow, i18n.language],
    () => getTrending(activeTab, timeWindow)
  );

  const tabs = [
    { id: 'movie' as const, label: t('trending.movies_tab'), icon: Film },
    { id: 'tv' as const, label: t('trending.tv_shows_tab'), icon: Tv },
  ];

  const timeWindows = [
    { id: 'day' as const, label: t('trending.today_filter') },
    { id: 'week' as const, label: t('trending.this_week_filter') },
  ];

  return (
    <>
      <SEO
        title={t('trending.title')}
        description={t('trending.seo_description')}
        keywords={t('trending.seo_keywords')}
        type="website"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">{t('trending.heading')}</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
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

          <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
            {timeWindows.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTimeWindow(id)}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  timeWindow === id
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>
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
            {trendingItems?.map((item: Movie | TVShow) => (
              <MovieCard key={item.id} item={item} mediaType={activeTab} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};