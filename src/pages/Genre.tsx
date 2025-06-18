import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Tag, Film, Tv } from 'lucide-react';
import { getByGenre, getGenres } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { useTranslation } from 'react-i18next';
import { Movie, TVShow } from '../types/tmdb';

export const Genre = () => {
  const { t, i18n } = useTranslation();
  const { id, type = 'movie' } = useParams<{ id: string; type: 'movie' | 'tv' }>();
  const navigate = useNavigate();
  const [activeType, setActiveType] = React.useState<'movie' | 'tv'>(type);

  // Get genre details
  const { data: genres } = useQuery(['genres', activeType, i18n.language], () => getGenres(activeType), {
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  const currentGenre = genres?.find((g) => g.id === parseInt(id!));

  // Get content by genre
  const { data: items, isLoading } = useQuery<Movie[] | TVShow[]>(
    ['genre', activeType, id, i18n.language],
    () => getByGenre(activeType, parseInt(id!)),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  const mediaTypeLocale = activeType === 'movie' ? t('genre.movies') : t('genre.tv_shows');

  const tabs = [
    { id: 'movie' as const, label: t('genre.movies'), icon: Film },
    { id: 'tv' as const, label: t('genre.tv_shows'), icon: Tv },
  ];

  const handleTabChange = (newType: 'movie' | 'tv') => {
    setActiveType(newType);
    navigate(`/genre/${id}/${newType}`);
  };

  return (
    <>
      <SEO
        title={t('genre.title', {
          genreName: currentGenre?.name || 'Genre',
          mediaType: mediaTypeLocale,
        })}
        description={t('genre.seo_description', {
          genreName: currentGenre?.name,
          mediaType: mediaTypeLocale.toLowerCase(),
        })}
        keywords={t('genre.seo_keywords', {
          genreName: currentGenre?.name,
          mediaType: activeType,
        })}
        type="website"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Tag className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">
            {t('genre.title', {
              genreName: currentGenre?.name || 'Genre',
              mediaType: mediaTypeLocale,
            })}
          </h1>
        </div>

        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg w-fit mb-8">
          {tabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => handleTabChange(tabId)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                activeType === tabId
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
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
        ) : !items || items.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.03] rounded-xl">
            <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">{t('genre.no_content')}</h2>
            <p className="text-gray-400">
              {t('genre.no_content_description', { mediaType: mediaTypeLocale.toLowerCase() })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <MovieCard key={item.id} item={item} mediaType={activeType} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};