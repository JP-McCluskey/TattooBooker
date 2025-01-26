import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TattooStyle } from '../types/tattoo';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageIcon, Loader2 } from "lucide-react";

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

const CURRENCIES = [
  { value: 'USD', label: '$ (USD)' },
  { value: 'EUR', label: '€ (EUR)' },
  { value: 'GBP', label: '£ (GBP)' },
  { value: 'CAD', label: '$ (CAD)' },
  { value: 'AUD', label: '$ (AUD)' },
];

const ArtistRegister = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<TattooStyle[]>([]);
  const [styles, setStyles] = useState<TattooStyle[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studioName: '',
    website: '',
    bio: '',
    hourlyRate: '',
    minimumCharge: '',
    currency: 'USD',
    bookingLink: '',
    facebook: '',
    instagram: '',
    pinterest: '',
    street: '',
    building: '',
    floor: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover' | 'certificates') => {
    if (!e.target.files?.length) return;

    if (type === 'profile') {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    } else if (type === 'cover') {
      const file = e.target.files[0];
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCertificates(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!acceptedTerms || !acceptedPrivacy) {
        setError('You must accept the Terms & Conditions and Privacy Policy');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }

      if (specialties.length === 0) {
        setError('Please select at least one specialty');
        return;
      }

      if (!profileImage) {
        setError('Please upload a profile image');
        return;
      }

      setLoading(true);

      // 1. Create user account
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            is_artist: true,
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('user_already_exists')) {
          setError('This email is already registered. Please use a different email or sign in.');
          return;
        }
        throw signUpError;
      }

      if (!user) throw new Error('Failed to create user account');

      // 2. Upload images
      const uploadImage = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        return publicUrl;
      };

      // Upload profile image first
      const profileImageUrl = await uploadImage(profileImage, 'profile');

      // Update profile with avatar
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: `${formData.firstName} ${formData.lastName}`,
          avatar_url: profileImageUrl,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Upload other images
      let coverImageUrl = '';
      let certificateUrls: string[] = [];

      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage, 'cover');
      }

      if (certificates.length > 0) {
        certificateUrls = await Promise.all(
          certificates.map(file => uploadImage(file, 'certificates'))
        );
      }

      // 3. Create artist profile
      const { error: artistError } = await supabase
        .from('artists')
        .insert({
          id: user.id,
          specialties,
          styles,
          hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          minimum_charge: formData.minimumCharge ? parseFloat(formData.minimumCharge) : null,
          currency: formData.currency,
          bio: formData.bio,
          website: formData.website,
          booking_link: formData.bookingLink,
          facebook: formData.facebook,
          instagram: formData.instagram,
          pinterest: formData.pinterest,
          certificates: certificateUrls,
          profile_image_url: profileImageUrl,
          cover_image_url: coverImageUrl,
          street: formData.street,
          building: formData.building,
          floor: formData.floor,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postalCode,
        });

      if (artistError) throw artistError;

      // Success! Redirect to dashboard
      navigate('/account');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Join as an Artist</h1>

          {error && (
            <div className="p-3 mb-6 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Images */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Images</CardTitle>
                <CardDescription>Upload your profile and cover images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer relative"
                    onClick={() => document.getElementById('profile-image')?.click()}
                  >
                    {profilePreview ? (
                      <div className="relative">
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="w-32 h-32 mx-auto rounded-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm">Change image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Click to upload profile image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 400x400px
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      id="profile-image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer relative"
                    onClick={() => document.getElementById('cover-image')?.click()}
                  >
                    {coverPreview ? (
                      <div className="relative">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm">Change image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ImageIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Click to upload cover image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 1200x400px
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      id="cover-image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cover')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter your personal and business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studioName">Studio Name</Label>
                  <Input
                    id="studioName"
                    name="studioName"
                    value={formData.studioName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself and your work..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Where are you based?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building">Building</Label>
                    <Input
                      id="building"
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set your rates and currency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate</Label>
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumCharge">Minimum Charge</Label>
                    <Input
                      id="minimumCharge"
                      name="minimumCharge"
                      type="number"
                      value={formData.minimumCharge}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialties and Styles */}
            <Card>
              <CardHeader>
                <CardTitle>Specialties & Styles</CardTitle>
                <CardDescription>What type of work do you do?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Specialties (What you do best)</Label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map(style => (
                      <Button
                        key={style}
                        type="button"
                        variant={specialties.includes(style) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSpecialties(prev =>
                            prev.includes(style)
                              ? prev.filter(s => s !== style)
                              : [...prev, style]
                          );
                        }}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Styles (What you do)</Label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map(style => (
                      <Button
                        key={style}
                        type="button"
                        variant={styles.includes(style) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setStyles(prev =>
                            prev.includes(style)
                              ? prev.filter(s => s !== style)
                              : [...prev, style]
                          );
                        }}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media & Links</CardTitle>
                <CardDescription>Connect your online presence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingLink">Booking Link</Label>
                  <Input
                    id="bookingLink"
                    name="bookingLink"
                    type="url"
                    value={formData.bookingLink}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="username or page URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinterest">Pinterest</Label>
                  <Input
                    id="pinterest"
                    name="pinterest"
                    value={formData.pinterest}
                    onChange={handleChange}
                    placeholder="username"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader>
                <CardTitle>Certificates & Awards</CardTitle>
                <CardDescription>Upload your certifications and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('certificates')?.click()}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Click to upload certificates
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You can select multiple files
                      </p>
                    </div>
                  </div>
                  <input
                    id="certificates"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'certificates')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Privacy */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm"
                >
                  I agree to the Terms & Conditions
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                />
                <Label
                  htmlFor="privacy"
                  className="text-sm"
                >
                  I agree to the Privacy Policy
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !acceptedTerms || !acceptedPrivacy}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Artist Account'
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ArtistRegister;