import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useTranslation } from 'react-i18next';

export const NotFound = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('not_found.title')}
        description={t('not_found.description')}
      />

      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{t('not_found.title')}</h1>
          <AlertCircle className="w-16 h-16 text-primary-500 mx-auto mb-6" />
          <p className="text-gray-400 mb-8 max-w-md">
            {t('not_found.description')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>{t('not_found.back_to_home')}</span>
          </Link>
        </div>
      </main>
    </>
  );
};