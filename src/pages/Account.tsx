import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { validateFullName, validatePhone, formatPhoneE164, validateImageFile } from '../lib/validation';
import { Profile, ProfileFormData, ProfileFormState } from '../types/profile';
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
import { Loader2, Upload } from "lucide-react";
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

const Account = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState<ProfileFormState>({
    data: {
      full_name: '',
      phone: '',
      address: '',
      bio: '',
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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setFormState(prev => ({
            ...prev,
            data: {
              full_name: profile.full_name || '',
              phone: profile.phone || '',
              address: profile.address || '',
              bio: profile.bio || '',
            },
          }));

          if (profile.avatar_url) {
            setImagePreview(profile.avatar_url);
          }
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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formState.data.full_name,
          phone: formState.data.phone ? formatPhoneE164(formState.data.phone) : null,
          address: formState.data.address || null,
          bio: formState.data.bio || null,
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

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

            <Card>
              <CardHeader>
                <CardTitle>{t('account.profile.title')}</CardTitle>
                <CardDescription>
                  {t('account.profile.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Account;