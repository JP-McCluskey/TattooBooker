import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { supabase } from '../lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch: (searchTerm: string, selectedCity: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const { userCity, loading: locationLoading } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .not('city', 'is', null)
        .order('city');

      if (!error && data) {
        const uniqueCities = [...new Set(data.map(item => item.city as string))];
        setCities(uniqueCities);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (userCity && !locationLoading) {
      // Check if the user's city exists in our database
      const cityExists = cities.some(
        city => city.toLowerCase() === userCity.toLowerCase()
      );
      if (cityExists) {
        setSelectedCity(userCity);
        onSearch(searchTerm, userCity);
      }
    }
  }, [userCity, locationLoading, cities, searchTerm, onSearch]);

  const handleSearch = () => {
    onSearch(searchTerm, selectedCity === 'all' ? '' : selectedCity);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('search.placeholder')}
            className="w-full"
          />
        </div>
        
        <Select 
          value={selectedCity} 
          onValueChange={setSelectedCity}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <SelectValue placeholder={t('search.allCities')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allCities')}</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} className="w-full sm:w-auto">
          <Search className="w-4 h-4 mr-2" />
          {t('search.button')}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;