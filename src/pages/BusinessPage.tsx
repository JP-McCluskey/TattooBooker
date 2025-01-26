import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { Business } from '../types/business';
import { formatPhoneNumber } from '../lib/utils';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  MapPin, 
  Star, 
  Globe, 
  Instagram, 
  Calendar,
  Clock,
  ArrowLeft,
  Loader2
} from "lucide-react";

const BusinessPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBusiness(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">
            {error || 'Business not found'}
          </div>
        </div>
      </div>
    );
  }

  const getLocation = () => {
    const parts = [];
    if (business.neighborhood) parts.push(business.neighborhood);
    if (business.city) parts.push(business.city);
    if (business.state) parts.push(business.state);
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Hero Section */}
        <div className="relative rounded-lg overflow-hidden mb-8 bg-card">
          {business.image_url && (
            <div className="w-full h-64 relative">
              <img
                src={business.image_url}
                alt={business.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{business.title}</h1>
                {getLocation() && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span>{getLocation()}</span>
                  </div>
                )}
              </div>

              {(business.total_score || business.reviews_count) && (
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <div>
                    <span className="text-2xl font-bold">{business.total_score}</span>
                    <span className="text-muted-foreground ml-1">
                      ({business.reviews_count} {t('business.reviews')})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {business.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{business.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {business.image_urls && business.image_urls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {business.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${business.title} gallery ${index + 1}`}
                        className="rounded-lg object-cover w-full h-48"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Booking */}
            <Card>
              <CardContent className="pt-6">
                {business.booking_links && (
                  <Button 
                    className="w-full mb-4 flex items-center gap-2"
                    onClick={() => window.open(`${business.booking_links}?utm_source=tattoobooker&utm_medium=referral&utm_campaign=collab-with-me`, '_blank', 'referrerpolicy=origin')}
                  >
                    <Calendar className="w-4 h-4" />
                    {t('business.bookAppointment')}
                  </Button>
                )}

                <div className="space-y-4">
                  {business.phone_unformatted && (
                    <a 
                      href={`tel:${business.phone_unformatted}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{formatPhoneNumber(business.phone_unformatted)}</span>
                    </a>
                  )}
                  
                  {business.website && (
                    <a 
                      href={`${business.website}?utm_source=tattoobooker&utm_medium=referral&utm_campaign=collab-with-me`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{t('business.website')}</span>
                    </a>
                  )}
                  
                  {business.instagram && (
                    <a 
                      href={`https://instagram.com/${business.instagram.replace('@', '')}?utm_source=tattoobooker&utm_medium=referral&utm_campaign=collab-with-me`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>{business.instagram}</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            {business.opening_hours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(business.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize">{day}</span>
                        <span className="text-muted-foreground">
                          {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {business.appointment_required && (
                    <Badge variant="secondary">
                      {t('business.appointmentRequired')}
                    </Badge>
                  )}
                  {business.women_owned && (
                    <Badge variant="secondary">
                      {t('business.womenOwned')}
                    </Badge>
                  )}
                  {business.wheelchair_accessible && (
                    <Badge variant="secondary">
                      {t('business.wheelchairAccessible')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessPage;