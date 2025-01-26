import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TattooImage, TattooStyle } from '../types/tattoo';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Bookmark, Upload, Loader2 } from "lucide-react";

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

const Account = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('liked');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<TattooImage[]>([]);
  const [favoritedImages, setFavoritedImages] = useState<TattooImage[]>([]);
  const [uploadForm, setUploadForm] = useState({
    image: null as File | null,
    title: '',
    placement: '',
    styles: [] as TattooStyle[],
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserImages = async () => {
      try {
        setLoading(true);
        
        // Fetch liked images
        const { data: likedData, error: likedError } = await supabase
          .from('tattoo_images')
          .select('*, user_tattoo_likes!inner(*)')
          .eq('user_tattoo_likes.user_id', user.id);

        if (likedError) throw likedError;
        setLikedImages(likedData || []);

        // Fetch favorited images
        const { data: favoritedData, error: favoritedError } = await supabase
          .from('tattoo_images')
          .select('*, user_tattoo_favorites!inner(*)')
          .eq('user_tattoo_favorites.user_id', user.id);

        if (favoritedError) throw favoritedError;
        setFavoritedImages(favoritedData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserImages();
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !uploadForm.image) return;

    try {
      setLoading(true);
      setError(null);

      // Upload image to storage
      const fileExt = uploadForm.image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, uploadForm.image);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Create tattoo image record
      const { error: dbError } = await supabase
        .from('tattoo_images')
        .insert({
          user_id: user.id,
          title: uploadForm.title,
          placement: uploadForm.placement,
          styles: uploadForm.styles,
          image_url: publicUrl,
          bucket_url: filePath,
        });

      if (dbError) throw dbError;

      // Reset form
      setUploadForm({
        image: null,
        title: '',
        placement: '',
        styles: [],
      });

      // Switch to liked tab to show the upload
      setActiveTab('liked');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList>
            <TabsTrigger value="liked" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Liked
            </TabsTrigger>
            <TabsTrigger value="favorited" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Favorited
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liked">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : likedImages.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No liked images yet
                </div>
              ) : (
                likedImages.map(image => (
                  <Card key={image.id} className="overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.title || 'Tattoo'}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      {image.title && (
                        <h3 className="font-semibold mb-2">{image.title}</h3>
                      )}
                      <p className="text-sm text-muted-foreground">{image.placement}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorited">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : favoritedImages.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No favorited images yet
                </div>
              ) : (
                favoritedImages.map(image => (
                  <Card key={image.id} className="overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.title || 'Tattoo'}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      {image.title && (
                        <h3 className="font-semibold mb-2">{image.title}</h3>
                      )}
                      <p className="text-sm text-muted-foreground">{image.placement}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload a Tattoo</CardTitle>
                <CardDescription>
                  Share your tattoo with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleImageUpload} className="space-y-6">
                  {error && (
                    <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter a title for your tattoo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Image</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placement">Placement</Label>
                    <Select
                      value={uploadForm.placement}
                      onValueChange={(value) => setUploadForm(prev => ({ ...prev, placement: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLACEMENT_OPTIONS.map(placement => (
                          <SelectItem key={placement} value={placement}>
                            {placement}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Styles</Label>
                    <div className="flex flex-wrap gap-2">
                      {STYLE_OPTIONS.map(style => (
                        <Button
                          key={style}
                          type="button"
                          variant={uploadForm.styles.includes(style) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setUploadForm(prev => ({
                              ...prev,
                              styles: prev.styles.includes(style)
                                ? prev.styles.filter(s => s !== style)
                                : [...prev.styles, style]
                            }));
                          }}
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !uploadForm.image || !uploadForm.placement || uploadForm.styles.length === 0}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Tattoo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;