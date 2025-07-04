import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SEO } from '../../components/SEO';
import toast from 'react-hot-toast';
import { AuthError } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleAuthError = (error: AuthError) => {
    switch (error.message) {
      case 'Email not confirmed':
        toast.error(t('auth.verify_email_toast'), { duration: 5000 });
        break;
      case 'Invalid login credentials':
        toast.error(t('auth.invalid_credentials_toast'));
        break;
      default:
        toast.error(t('auth.login_failed_toast'));
        console.error('Auth error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success(t('auth.login_success_toast'));
      navigate(from, { replace: true });
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={t('auth.login_seo_title')}
        description={t('auth.login_seo_description')}
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0f0f0f]">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-2xl font-bold text-white hover:text-primary-400 transition-colors"
            >
              <LogIn className="w-8 h-8" />
              <span>{t('auth.sign_in_title')}</span>
            </Link>
            <p className="mt-2 text-gray-400">
              {t('auth.welcome_back')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  {t('auth.email_label')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 pl-12 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/20"
                    placeholder={t('auth.email_placeholder')}
                  />
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  {t('auth.password_label')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 pl-12 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/20"
                    placeholder={t('auth.password_placeholder')}
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? t('auth.signing_in') : t('auth.sign_in_button')}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm">
                <span className="text-gray-500">{t('auth.no_account')}</span>{' '}
                <Link
                  to="/auth/register"
                  className="font-medium text-primary-400 hover:text-primary-300"
                >
                  {t('auth.sign_up_link')}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};