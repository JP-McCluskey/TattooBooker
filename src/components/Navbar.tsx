import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe, Menu, X, Settings, Search, User, Palette } from "lucide-react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isArtist, setIsArtist] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Check if user is an artist
  useEffect(() => {
    const checkArtistRole = async () => {
      if (!user) {
        setIsArtist(false);
        return;
      }

      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.id);

        setIsArtist(roleData?.some(role => role.roles?.name === 'artist') || false);
      } catch (error) {
        console.error('Error checking artist role:', error);
        setIsArtist(false);
      }
    };

    checkArtistRole();
  }, [user]);

  const handleAuthClick = async () => {
    if (user) {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    } else {
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="border-b bg-background relative z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div 
          className="text-xl font-bold cursor-pointer text-foreground hover:text-primary transition-colors"
          onClick={() => handleNavigate('/')}
        >
          {t('navbar.title')}
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => handleNavigate('/explore')}
            className="text-foreground hover:text-primary hover:bg-primary/10"
          >
            <Search className="h-5 w-5 mr-2" />
            Explore
          </Button>

          {/* Only show Join as Artist button if user is not logged in or is not an artist */}
          {(!user || !isArtist) && (
            <Button
              variant="ghost"
              onClick={() => handleNavigate('/artist-register')}
              className="text-foreground hover:text-primary hover:bg-primary/10"
            >
              <Palette className="h-5 w-5 mr-2" />
              Join as Artist
            </Button>
          )}

          <div className="flex items-center space-x-2">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleNavigate('/account')}
                  title="Account"
                  className="text-foreground hover:text-primary hover:bg-primary/10"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleNavigate('/settings')}
                  title="Settings"
                  className="text-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'light' ? t('navbar.darkMode') : t('navbar.lightMode')}
              className="text-foreground hover:text-primary hover:bg-primary/10"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              title={t('navbar.language')}
              className="text-foreground hover:text-primary hover:bg-primary/10"
            >
              <Globe className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleAuthClick}
              className="text-foreground hover:text-primary hover: bg-primary/10"
            >
              {user ? t('navbar.logout') : t('navbar.login')}
            </Button>

            {!user && (
              <Button
                onClick={() => handleNavigate('/register')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {t('navbar.register')}
              </Button>
            )}
          </div>
        </div>

        <button
          className="lg:hidden text-foreground hover:text-primary p-2 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isMobile && (
        <div
          className={`lg:hidden absolute top-16 inset-x-0 bg-background border-b shadow-lg transform transition-all duration-200 ease-in-out ${
            isMenuOpen 
              ? 'translate-y-0 opacity-100 visible'
              : '-translate-y-full opacity-0 invisible'
          }`}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Button
              variant="ghost"
              onClick={() => handleNavigate('/explore')}
              className="w-full flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              Explore
            </Button>

            {/* Only show Join as Artist button if user is not logged in or is not an artist */}
            {(!user || !isArtist) && (
              <Button
                variant="ghost"
                onClick={() => handleNavigate('/artist-register')}
                className="w-full flex items-center justify-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Join as Artist
              </Button>
            )}

            {user && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('/account')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Account
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </>
            )}

            <div className="flex justify-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                title={theme === 'light' ? t('navbar.darkMode') : t('navbar.lightMode')}
                className="text-foreground hover:text-primary hover:bg-primary/10"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setLanguage(language === 'en' ? 'fr' : 'en');
                  setIsMenuOpen(false);
                }}
                title={t('navbar.language')}
                className="text-foreground hover:text-primary hover:bg-primary/10"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={handleAuthClick}
                className="w-full text-foreground hover:text-primary hover:bg-primary/10"
              >
                {user ? t('navbar.logout') : t('navbar.login')}
              </Button>

              {!user && (
                <Button
                  onClick={() => handleNavigate('/register')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {t('navbar.register')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;