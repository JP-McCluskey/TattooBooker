import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Business } from '../types/business';
import BusinessCard from './BusinessCard';
import SearchBar from './SearchBar';
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 25;

const BusinessList: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBusinesses = async (searchTerm = '', selectedCity = '', page = 0) => {
    try {
      setLoading(true);
      
      // First, get total count for pagination
      let countQuery = supabase
        .from('businesses')
        .select('id', { count: 'exact' });

      if (selectedCity) {
        countQuery = countQuery.eq('city', selectedCity);
      }

      if (searchTerm) {
        countQuery = countQuery.ilike('title', `%${searchTerm}%`);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Then fetch the actual data
      let query = supabase
        .from('businesses')
        .select('*')
        .order('total_score', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setBusinesses(data || []);
      setHasMore((count || 0) > (page + 1) * ITEMS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSearch = (searchTerm: string, selectedCity: string) => {
    setCurrentPage(0);
    fetchBusinesses(searchTerm, selectedCity, 0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBusinesses('', '', newPage);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      <SearchBar onSearch={handleSearch} />
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No businesses found
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {businesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center py-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasMore || loading}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BusinessList;