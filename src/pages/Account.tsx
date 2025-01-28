import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { validateFullName, validatePhone, formatPhoneE164, validateImageFile, validateURL, validateSocialHandle } from '../lib/validation';
import { Profile, ProfileFormData, ProfileFormState } from '../types/profile';
import { TattooStyle } from '../types/tattoo';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Upload, Eye, EyeOff } from "lucide-react";

const STYLE_OPTIONS: TattooStyle[] = [
  'Tebori', 'Botanical', 'Portraiture', 'Sketch', 'Maori',
  'Colored Realism', 'Calligraphy', 'Black & Grey', 'Micro Realism',
  'Minimal', 'Fineline', 'Illustrative', 'Realism', 'Abstract',
  'Asian', 'Geometric', 'Blackwork', 'Dotwork', 'Lettering'
];

const Account = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isArtist, setIsArtist] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<TattooStyle[]>([]);

  const [formState, setFormState] = useState<ProfileFormState>({
    data: {
      full_name: '',
      phone: '',
      address: '',
      bio: '',
      hourly_rate: '',
      minimum_charge: '',
      website: '',
      booking_link: '',
      instagram: '',
      facebook: '',
      pinterest: '',
    },
    isDirty: false,
    isValid: false,
    isSubmitting: false,
    errors: {},
  });

  const validateForm = useCallback((data: ProfileFormData) => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!validateFullName(data.full_name)) {
      errors.full_name = t('validation.fullNameInvalid');
    }

    if (data.phone && !validatePhone(data.phone)) {
      errors.phone = t('validation.phoneInvalid');
    }

    if (data.website && !validateURL(data.website)) {
      errors.website = t('validation.websiteInvalid');
    }

    if (data.booking_link && !validateURL(data.booking_link)) {
      errors.booking_link = t('validation.bookingLinkInvalid');
    }

    if (data.instagram && !validateSocialHandle(data.instagram, 'instagram')) {
      errors.instagram = t('validation.instagramInvalid');
    }

    if (data.facebook && !validateSocialHandle(data.facebook, 'facebook')) {
      errors.facebook = t('validation.facebookInvalid');
    }

    return errors;
  }, [t]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Check if user is an artist
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.id);

        const artistRole = roleData?.some(role => role.roles?.name === 'artist');
        setIsArtist(artistRole || false);

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // If artist, fetch artist data
        let artistData = null;
        if (artistRole) {
          const { data: artist, error: artistError } = await supabase
            .from('artists')
            .select('*')
            .eq('id', user.id)
            .single();

          if (artistError && artistError.code !== 'PGRST116') {
            throw artistError;
          }
          artistData = artist;
        }

        setFormState(prev => ({
          ...prev,
          data: {
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
            bio: profile?.bio || '',
            hourly_rate: artistData?.hourly_rate?.toString() || '',
            minimum_charge: artistData?.minimum_charge?.toString() || '',
            website: artistData?.website || '',
            booking_link: artistData?.booking_link || '',
            instagram: artistData?.instagram || '',
            facebook: artistData?.facebook || '',
            pinterest: artistData?.pinterest || '',
          },
        }));

        if (artistData?.styles) {
          setSelectedStyles(artistData.styles);
        }

        if (profile?.avatar_url) {
          setImagePreview(profile.avatar_url);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormState(prev => {
      const newData = { ...prev.data, [name]: value };
      const errors = validateForm(newData);
      
      return {
        ...prev,
        data: newData,
        errors,
        isDirty: true,
        isValid: Object.keys(errors).length === 0,
      };
    });
  };

  const handleStyleToggle = (style: TattooStyle) => {
    setSelectedStyles(prev => 
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
    setFormState(prev => ({ ...prev, isDirty: true }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const validation = validateImageFile(file);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      // Create a preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user!.id);

      if (updateError) throw updateError;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.isDirty || !formState.isValid || formState.isSubmitting) {
      return;
    }

    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      setError(null);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formState.data.full_name,
          phone: formState.data.phone ? formatPhoneE164(formState.data.phone) : null,
          address: formState.data.address || null,
          bio: formState.data.bio || null,
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // If artist, update artist profile
      if (isArtist) {
        const { error: artistError } = await supabase
          .from('artists')
          .upsert({
            id: user!.id,
            styles: selectedStyles,
            hourly_rate: formState.data.hourly_rate ? parseFloat(formState.data.hourly_rate) : null,
            minimum_charge: formState.data.minimum_charge ? parseFloat(formState.data.minimum_charge) : null,
            website: formState.data.website || null,
            booking_link: formState.data.booking_link || null,
            instagram: formState.data.instagram || null,
            facebook: formState.data.facebook || null,
            pinterest: formState.data.pinterest || null,
          });

        if (artistError) throw artistError;
      }

      setFormState(prev => ({ ...prev, isDirty: false }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('account.title')}</h1>

        {error && (
          <div className="p-3 mb-6 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-2xl">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('account.avatar.title')}</CardTitle>
                <CardDescription>
                  {t('account.avatar.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt={formState.data.full_name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="avatar"
                      className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/90"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? t('account.avatar.uploading') : t('account.avatar.upload')}
                    </Label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('account.avatar.requirements')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('account.profile.title')}</CardTitle>
                  <CardDescription>
                    {t('account.profile.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      {t('account.profile.fullName')}
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formState.data.full_name}
                      onChange={handleInputChange}
                      className={formState.errors.full_name ? 'border-destructive' : ''}
                    />
                    {formState.errors.full_name && (
                      <p className="text-sm text-destructive">
                        {formState.errors.full_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {t('account.profile.phone')}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formState.data.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className={formState.errors.phone ? 'border-destructive' : ''}
                    />
                    {formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {formState.errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {t('account.profile.address')}
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formState.data.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      {t('account.profile.bio')}
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formState.data.bio}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {isArtist && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('account.artist.pricing')}</CardTitle>
                      <CardDescription>
                        {t('account.artist.pricingDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hourly_rate">
                            {t('account.artist.hourlyRate')}
                          </Label>
                          <Input
                            id="hourly_rate"
                            name="hourly_rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formState.data.hourly_rate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minimum_charge">
                            {t('account.artist.minimumCharge')}
                          </Label>
                          <Input
                            id="minimum_charge"
                            name="minimum_charge"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formState.data.minimum_charge}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('account.artist.styles')}</CardTitle>
                      <CardDescription>
                        {t('account.artist.stylesDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {STYLE_OPTIONS.map(style => (
                          <Button
                            key={style}
                            type="button"
                            variant={selectedStyles.includes(style) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStyleToggle(style)}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('account.artist.links')}</CardTitle>
                      <CardDescription>
                        {t('account.artist.linksDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">
                          {t('account.artist.website')}
                        </Label>
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          value={formState.data.website}
                          onChange={handleInputChange}
                          className={formState.errors.website ? 'border-destructive' : ''}
                        />
                        {formState.errors.website && (
                          <p className="text-sm text-destructive">
                            {formState.errors.website}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="booking_link">
                          {t('account.artist.bookingLink')}
                        </Label>
                        <Input
                          id="booking_link"
                          name="booking_link"
                          type="url"
                          value={formState.data.booking_link}
                          onChange={handleInputChange}
                          className={formState.errors.booking_link ? 'border-destructive' : ''}
                        />
                        {formState.errors.booking_link && (
                          <p className="text-sm text-destructive">
                            {formState.errors.booking_link}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram">
                          {t('account.artist.instagram')}
                        </Label>
                        <Input
                          id="instagram"
                          name="instagram"
                          value={formState.data.instagram}
                          onChange={handleInputChange}
                          placeholder="@username"
                          className={formState.errors.instagram ? 'border-destructive' : ''}
                        />
                        {formState.errors.instagram && (
                          <p className="text-sm text-destructive">
                            {formState.errors.instagram}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook">
                          {t('account.artist.facebook')}
                        </Label>
                        <Input
                          id="facebook"
                          name="facebook"
                          value={formState.data.facebook}
                          onChange={handleInputChange}
                          className={formState.errors.facebook ? 'border-destructive' : ''}
                        />
                        {formState.errors.facebook && (
                          <p className="text-sm text-destructive">
                            {formState.errors.facebook}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pinterest">
                          {t('account.artist.pinterest')}
                        </Label>
                        <Input
                          id="pinterest"
                          name="pinterest"
                          value={formState.data.pinterest}
                          onChange={handleInputChange}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Button
                type="submit"
                disabled={!formState.isDirty || !formState.isValid || formState.isSubmitting}
                className="w-full"
              >
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('account.profile.updating')}
                  </>
                ) : (
                  t('account.profile.update')
                )}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Account;