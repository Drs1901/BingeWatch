import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';

interface WatchLayoutProps {
  children: React.ReactNode;
}

export const WatchLayout: React.FC<WatchLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // Scroll to top when location changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
};