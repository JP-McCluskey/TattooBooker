import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { supabase } from '../lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, MapPin, Check } from "lucide-react";
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (searchTerm: string, selectedCity: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const { userCity, error: locationError, loading: locationLoading } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [cities, setCities] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

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
    if (userCity && !locationLoading && !locationError) {
      // First try exact city match
      const cityExists = cities.some(
        city => city.toLowerCase() === userCity.toLowerCase()
      );
      
      if (cityExists) {
        setSelectedCity(userCity);
        onSearch(searchTerm, userCity);
      } else {
        // If no exact city match, try to find businesses in the same state
        const userState = userCity.split(', ')[1]; // Assuming format "City, State"
        if (userState) {
          const cityInState = cities.find(city => city.endsWith(userState));
          if (cityInState) {
            setSelectedCity(cityInState);
            onSearch(searchTerm, cityInState);
          }
        }
      }
    }
  }, [userCity, locationLoading, locationError, cities, searchTerm, onSearch]);

  const handleSearch = () => {
    onSearch(searchTerm, selectedCity === 'all' ? '' : selectedCity);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('search.placeholder')}
            className="w-full pl-10"
          />
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative w-[200px]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  role="combobox"
                  aria-expanded={open}
                  className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {selectedCity === 'all' ? t('search.allCities') : selectedCity}
                    </span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder={t('search.allCities')} />
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedCity('all');
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCity === 'all' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {t('search.allCities')}
                    </CommandItem>
                    {cities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => {
                          setSelectedCity(city);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCity === city ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={handleSearch}
            className="shrink-0"
          >
            <Search className="w-4 h-4 mr-2" />
            {t('search.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;