import { useState, useEffect } from 'react';
import axios from 'axios';

interface UsePokemonTypesReturn {
  types: string[];
  loading: boolean;
  error: string | null;
}

const usePokemonTypes = (): UsePokemonTypesReturn => {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8000/api/pokemons/types');
        setTypes(response.data.types);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error fetching Pokémon types');
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return { types, loading, error };
};

export default usePokemonTypes;
