import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Business } from '../types/business';
import { useLanguage } from '../context/LanguageContext';
import { formatPhoneNumber } from "../lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Star, Globe, Instagram, Calendar } from "lucide-react";

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Get location string
  const getLocation = () => {
    const parts = [];
    if (business.neighborhood) parts.push(business.neighborhood);
    if (business.city) parts.push(business.city);
    if (business.state) parts.push(business.state);
    return parts.join(', ');
  };

  const handleClick = () => {
    navigate(`/business/${business.id}`);
  };

  return (
    <Card 
      className="mb-4 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        {business.image_url && (
          <div className="sm:w-48 h-48 sm:h-auto relative">
            <img
              src={business.image_url}
              alt={business.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="space-y-1">
                <CardTitle className="text-xl">{business.title}</CardTitle>
                {getLocation() && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{getLocation()}</span>
                  </div>
                )}
              </div>
              
              {(business.total_score || business.reviews_count) && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{business.total_score}</span>
                  <span className="text-muted-foreground">
                    ({business.reviews_count} {t('business.reviews')})
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {business.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">{business.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              {business.phone_unformatted && (
                <a 
                  href={`tel:${business.phone_unformatted}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4" />
                  <span>{formatPhoneNumber(business.phone_unformatted)}</span>
                </a>
              )}
              
              {business.website && (
                <a 
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-4 h-4" />
                  <span>{t('business.website')}</span>
                </a>
              )}
              
              {business.instagram && (
                <a 
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-4 h-4" />
                  <span>{business.instagram}</span>
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {business.booking_links && (
                <Button 
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(business.booking_links, '_blank');
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  {t('business.bookAppointment')}
                </Button>
              )}
              
              {business.appointment_required && (
                <Badge variant="secondary">{t('business.appointmentRequired')}</Badge>
              )}
              {business.women_owned && (
                <Badge variant="secondary">{t('business.womenOwned')}</Badge>
              )}
              {business.wheelchair_accessible && (
                <Badge variant="secondary">{t('business.wheelchairAccessible')}</Badge>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default BusinessCard;