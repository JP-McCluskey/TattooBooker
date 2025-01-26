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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Bookmark, Loader2 } from "lucide-react";

const PLACEMENT_OPTIONS = [
  'Wrist',
  'Forearm - Inner',
  'Forearm - Outer',
  'Upper Arm',
  'Shoulder',
  'Chest',
  'Back - Upper',
  'Back - Lower',
  'Ribs',
  'Hip',
  'Thigh',
  'Leg - Calf',
  'Ankle',
  'Foot',
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

interface ExtendedTattooImage extends TattooImage {
  isLiked?: boolean;
  isFavorited?: boolean;
}

const Explore = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [images, setImages] = useState<ExtendedTattooImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [processingAction, setProcessingAction] = useState<{
    imageId: string;
    action: 'like' | 'favorite';
  } | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('tattoo_images')
          .select(`
            *,
            user_tattoo_likes!inner(user_id),
            user_tattoo_favorites!inner(user_id)
          `)
          .order('created_at', { ascending: false });

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
  }, [selectedPlacement, selectedStyle, user]);

  const handleLike = async (imageId: string) => {
    if (!user) return;

    try {
      setProcessingAction({ imageId, action: 'like' });
      const { data: liked, error } = await supabase
        .rpc('toggle_tattoo_like', { p_tattoo_id: imageId });

      if (error) throw error;

      setImages(prev => prev.map(image => {
        if (image.id === imageId) {
          return {
            ...image,
            likes_count: liked ? image.likes_count + 1 : image.likes_count - 1,
            isLiked: liked,
          };
        }
        return image;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleFavorite = async (imageId: string) => {
    if (!user) return;

    try {
      setProcessingAction({ imageId, action: 'favorite' });
      const { data: favorited, error } = await supabase
        .rpc('toggle_tattoo_favorite', { p_tattoo_id: imageId });

      if (error) throw error;

      setImages(prev => prev.map(image => {
        if (image.id === imageId) {
          return {
            ...image,
            favorites_count: favorited ? image.favorites_count + 1 : image.favorites_count - 1,
            isFavorited: favorited,
          };
        }
        return image;
      }));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Explore Tattoos</h1>
          
          <div className="flex flex-wrap gap-4">
            <Select
              value={selectedPlacement}
              onValueChange={setSelectedPlacement}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Placements</SelectItem>
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
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
          <div className="text-center text-destructive mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No tattoos found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={image.image_url}
                    alt={`Tattoo ${image.placement}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    {user ? (
                      <>
                        <Button
                          variant={image.isLiked ? "default" : "secondary"}
                          size="icon"
                          className="h-10 w-10"
                          disabled={processingAction?.imageId === image.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(image.id);
                          }}
                        >
                          {processingAction?.imageId === image.id && 
                           processingAction?.action === 'like' ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Heart 
                              className={`h-5 w-5 ${image.isLiked ? 'fill-current' : ''}`} 
                            />
                          )}
                        </Button>
                        <Button
                          variant={image.isFavorited ? "default" : "secondary"}
                          size="icon"
                          className="h-10 w-10"
                          disabled={processingAction?.imageId === image.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavorite(image.id);
                          }}
                        >
                          {processingAction?.imageId === image.id && 
                           processingAction?.action === 'favorite' ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Bookmark 
                              className={`h-5 w-5 ${image.isFavorited ? 'fill-current' : ''}`} 
                            />
                          )}
                        </Button>
                      </>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex gap-4">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-10 w-10"
                            >
                              <Heart className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-10 w-10"
                            >
                              <Bookmark className="h-5 w-5" />
                            </Button>
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sign in required</AlertDialogTitle>
                            <AlertDialogDescription>
                              You need to be signed in to like or favorite tattoos.
                              Would you like to sign in now?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => navigate('/login')}>
                              Sign In
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{image.placement}</span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className={`w-4 h-4 ${image.isLiked ? 'fill-primary text-primary' : ''}`} />
                        {image.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className={`w-4 h-4 ${image.isFavorited ? 'fill-primary text-primary' : ''}`} />
                        {image.favorites_count}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {image.styles.map((style, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;