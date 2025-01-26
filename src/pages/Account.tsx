import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
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
import { Loader2 } from "lucide-react";

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isArtist, setIsArtist] = useState(false);

  // Update the initial state for profileData and artistData
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: '',
  });

  const [artistData, setArtistData] = useState({
    specialties: [] as TattooStyle[],
    styles: [] as TattooStyle[],
    hourly_rate: '',
    minimum_charge: '',
    currency: 'USD',
    website: '',
    booking_link: '',
    facebook: '',
    instagram: '',
    pinterest: '',
    certificates: [] as string[],
    profile_image_url: '',
    cover_image_url: '',
    street: '',
    building: '',
    floor: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Check if user is an artist - modified to handle no roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.id);

        if (roleError) throw roleError;

        // Check if any of the user's roles is 'artist'
        const isArtistUser = roleData?.some(role => role.roles?.name === 'artist') || false;
        setIsArtist(isArtistUser);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (profileData) {
          setProfileData({
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url || '',
          });
        }

        // If artist, fetch artist data
        if (isArtistUser) {
          const { data: artistData, error: artistError } = await supabase
            .from('artists')
            .select('*')
            .eq('id', user.id)
            .single();

          if (artistError && artistError.code !== 'PGRST116') {
            // Only throw if it's not a "no rows returned" error
            throw artistError;
          }
          
          if (artistData) {
            setArtistData({
              specialties: artistData.specialties || [],
              styles: artistData.styles || [],
              hourly_rate: artistData.hourly_rate?.toString() || '',
              minimum_charge: artistData.minimum_charge?.toString() || '',
              currency: artistData.currency || 'USD',
              website: artistData.website || '',
              booking_link: artistData.booking_link || '',
              facebook: artistData.facebook || '',
              instagram: artistData.instagram || '',
              pinterest: artistData.pinterest || '',
              certificates: artistData.certificates || [],
              profile_image_url: artistData.profile_image_url || '',
              cover_image_url: artistData.cover_image_url || '',
              street: artistData.street || '',
              building: artistData.building || '',
              floor: artistData.floor || '',
              city: artistData.city || '',
              state: artistData.state || '',
              country: artistData.country || '',
              postal_code: artistData.postal_code || '',
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // If artist, update artist data
      if (isArtist) {
        const { error: artistError } = await supabase
          .from('artists')
          .update({
            specialties: artistData.specialties,
            styles: artistData.styles,
            hourly_rate: artistData.hourly_rate ? parseFloat(artistData.hourly_rate) : null,
            minimum_charge: artistData.minimum_charge ? parseFloat(artistData.minimum_charge) : null,
            currency: artistData.currency,
            website: artistData.website,
            booking_link: artistData.booking_link,
            facebook: artistData.facebook,
            instagram: artistData.instagram,
            pinterest: artistData.pinterest,
            certificates: artistData.certificates,
            profile_image_url: artistData.profile_image_url,
            cover_image_url: artistData.cover_image_url,
            street: artistData.street,
            building: artistData.building,
            floor: artistData.floor,
            city: artistData.city,
            state: artistData.state,
            country: artistData.country,
            postal_code: artistData.postal_code,
          })
          .eq('id', user?.id);

        if (artistError) throw artistError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {error && (
          <div className="p-3 mb-6 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </CardContent>
        </Card>

        {isArtist && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Artist Information</CardTitle>
              <CardDescription>Update your artist profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Artist-specific fields */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={artistData.website}
                  onChange={(e) => setArtistData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_link">Booking Link</Label>
                <Input
                  id="booking_link"
                  value={artistData.booking_link}
                  onChange={(e) => setArtistData(prev => ({ ...prev, booking_link: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={artistData.hourly_rate}
                    onChange={(e) => setArtistData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_charge">Minimum Charge</Label>
                  <Input
                    id="minimum_charge"
                    type="number"
                    value={artistData.minimum_charge}
                    onChange={(e) => setArtistData(prev => ({ ...prev, minimum_charge: e.target.value }))}
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Artist Profile'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Account;