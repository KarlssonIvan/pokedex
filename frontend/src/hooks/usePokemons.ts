import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Pokemon, Order } from '../types/pokemons';

interface UsePokemonsProps {
  page: number;
  pageSize: number;
  sortBy: string;
  order: Order;
  type: string;
}

interface UsePokemonsReturn {
  pokemons: Pokemon[];
  totalPages: number;
  totalItems: number;
  loading: boolean;
  error: string | null;
  togglePokemon: (pokemonNumber: number) => Promise<void>
}

const usePokemons = ({
  page,
  pageSize,
  sortBy,
  order,
  type,
}: UsePokemonsProps): UsePokemonsReturn => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPokemons = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page,
          page_size: pageSize,
          sort_by: sortBy,
          order,
        };

        if (type) {
          params.type = type;
        }

        const response = await axios.get('/api/pokemons', { params });
        const enrichedPokemonList: Pokemon[] = response.data.pokemons.map((pokemon: Pokemon) => ({
            ...pokemon,
            imageUrl: getPokemonImageUrl(pokemon.name)
          }));
        setPokemons(enrichedPokemonList);
        setTotalPages(response.data.total_pages);
        setTotalItems(response.data.total_items);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error fetching pokemons');
      } finally {
        setLoading(false);
      }
    };
    fetchPokemons();
    return () => controller.abort();
  }, [page, pageSize, sortBy, order, type]);

  const togglePokemon = useCallback(async (pokemonNumber: number) => {
    // Find the index of the Pokémon to update
    const index = pokemons.findIndex(pokemon => pokemon.number === pokemonNumber);
    if (index === -1) {
      console.warn(`Pokémon with ID ${pokemonNumber} not found.`);
      return;
    }

    const currentSelected = pokemons[index].selected;

    const updatedPokemons = [...pokemons];
    updatedPokemons[index] = { ...updatedPokemons[index], selected: !currentSelected, isToggling: true };
    setPokemons(updatedPokemons);

    try {
      const response = await fetch(`/api/pokemons/${pokemonNumber}/toggle_selection`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to select Pokémon.');
      }

      const result = await response.json();
      const finalPokemons = [...pokemons];
      finalPokemons[index] = { ...finalPokemons[index], selected: result.selected, isToggling: false };
      setPokemons(finalPokemons);
    } catch (err: any) {
      console.error(err);
      const revertedPokemons = [...pokemons];
      revertedPokemons[index] = { ...revertedPokemons[index], selected: currentSelected, isToggling: false };
      setPokemons(revertedPokemons);
    }
  }, [pokemons]);

  return { pokemons, totalPages, totalItems, loading, error , togglePokemon};
};

const BASE_IMAGE_URL = 'https://img.pokemondb.net/sprites/silver/normal/'; 

const getPokemonImageUrl = (name: string): string => {

  let formattedName = name.toLowerCase();

  return `${BASE_IMAGE_URL}${formattedName}.png`;
};
export default usePokemons;
