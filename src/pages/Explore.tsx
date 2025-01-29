import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TattooImage, TattooStyle } from '../types/tattoo';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Bookmark, Loader2, Search } from "lucide-react";

const PLACEMENT_OPTIONS = [
  'Arm - Upper',
  'Arm - Lower',
  'Leg - Upper',
  'Leg - Lower',
  'Chest',
  'Back - Upper',
  'Back - Lower',
  'Neck',
  'Hand',
  'Foot',
  'Ribs',
  'Hip',
  'Head',
  'Face',
];

const STYLE_OPTIONS: TattooStyle[] = [
  'Tebori',
  'Botanical',
  'Portraiture',
  'Sketch',
  'Maori',
  'Colored Realism',
  'Calligraphy',
  'Black & Grey',
  'Micro Realism',
  'Minimal',
  'Fineline',
  'Illustrative',
  'Realism',
  'Abstract',
  'Asian',
  'Geometric',
  'Blackwork',
  'Dotwork',
  'Lettering',
];

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<TattooImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('tattoo_images')
          .select(`
            *,
            user_tattoo_likes (user_id),
            user_tattoo_favorites (user_id)
          `)
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        if (selectedPlacement !== 'all') {
          query = query.eq('placement', selectedPlacement);
        }

        if (selectedStyle !== 'all') {
          query = query.contains('styles', [selectedStyle]);
        }

        const { data, error } = await query;

        if (error) throw error;

        const processedImages = (data || []).map(image => ({
          ...image,
          isLiked: user ? image.user_tattoo_likes?.some(like => like.user_id === user.id) : false,
          isFavorited: user ? image.user_tattoo_favorites?.some(fav => fav.user_id === user.id) : false,
        }));

        setImages(processedImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [selectedPlacement, selectedStyle, searchTerm, user]);

  const handleLike = async (imageId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('toggle_tattoo_like', { p_tattoo_id: imageId });

      if (error) throw error;

      setImages(prevImages => 
        prevImages.map(image => 
          image.id === imageId
            ? {
                ...image,
                isLiked: data,
                likes_count: data 
                  ? image.likes_count + 1 
                  : image.likes_count - 1
              }
            : image
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFavorite = async (imageId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('toggle_tattoo_favorite', { p_tattoo_id: imageId });

      if (error) throw error;

      setImages(prevImages => 
        prevImages.map(image => 
          image.id === imageId
            ? {
                ...image,
                isFavorited: data,
                favorites_count: data 
                  ? image.favorites_count + 1 
                  : image.favorites_count - 1
              }
            : image
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-foreground text-3xl font-bold">{t('explore.title')}</h1>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder={t('explore.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Select
              value={selectedPlacement}
              onValueChange={setSelectedPlacement}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('explore.filterByPlacement')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('explore.allPlacements')}</SelectItem>
                {PLACEMENT_OPTIONS.map(placement => (
                  <SelectItem key={placement} value={placement}>
                    {placement}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedStyle}
              onValueChange={setSelectedStyle}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('explore.filterByStyle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('explore.allStyles')}</SelectItem>
                {STYLE_OPTIONS.map(style => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-6 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t('explore.noResults')}
            </div>
          ) : (
            images.map(image => (
              <Card key={image.id} className="overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.title || 'Tattoo'}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  {image.title && (
                    <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">{image.placement}</span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <button
                        onClick={() => handleLike(image.id)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${image.isLiked ? 'fill-primary text-primary' : ''}`} />
                        <span className="text-foreground">{image.likes_count}</span>
                      </button>
                      <button
                        onClick={() => handleFavorite(image.id)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Bookmark className={`w-4 h-4 ${image.isFavorited ? 'fill-primary text-primary' : ''}`} />
                        <span className="text-foreground">{image.favorites_count}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {image.styles.map(style => (
                      <Badge key={style} variant="secondary">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Explore;