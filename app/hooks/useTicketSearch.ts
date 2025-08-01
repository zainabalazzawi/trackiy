import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Ticket } from '@/app/types';

interface UseTicketSearchReturn {
  query: string;
  results: Ticket[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

// Search function using axios
const searchTickets = async (query: string): Promise<Ticket[]> => {
  if (!query.trim()) return [];
  const response = await axios.get('/api/search/tickets', {
    params: { q: query.trim() }
  });
  return response.data;
};

export const useTicketSearch = (): UseTicketSearchReturn => {
  const [query, setQuery] = useState('');

  // Use React Query for better caching and state management
  const { data: results = [], isLoading,  } = useQuery({
    queryKey: ['tickets', 'search', query],
    queryFn: () => searchTickets(query),
  });

  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    results,
    isLoading,
    setQuery,
    clearSearch,
  };
}; 