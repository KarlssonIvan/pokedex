import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import usePokemons from '../hooks/usePokemons';
import usePagination from '../hooks/usePagination';
import usePokemonTypes from '../hooks/usePokemonTypes';
import PaginationComponent from './Pagination';
import { Order } from '../types/pokemons';

const PokemonTable: React.FC = () => {
  const [filterType, setFilterType] = useState('');
  const [sortBy, _] = useState('number');
  const [order, setOrder] = useState(Order.Asc);
  const {
    currentPage,
    pokemonsPerPage,
    setPage,
    setPokemonsPerPage,
  } = usePagination();

  const { types: pokemonTypes } = usePokemonTypes();

  const { pokemons, totalPages, totalItems, loading, error, togglePokemon } = usePokemons({
    page: currentPage,
    pageSize: pokemonsPerPage,
    sortBy,
    order,
    type: filterType,
  });

  const handleSort = () => {
    const isAsc = order === 'asc';
    setOrder(isAsc ? Order.Desc : Order.Asc);
  };


  const handleFilterChange = (event: SelectChangeEvent<string>, _: React.ReactNode)  => {
    const value = event.target.value as string;
    setFilterType(value);
    setPage(1); 
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPokemonsPerPage(newPageSize);
    setPage(1);
  };

  const handleToggle = async (pokemonNumber: number) => {
    try {
        await togglePokemon(pokemonNumber);
      } catch (error: any) {
        console.error(error.message);
        
      }
    };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="filter-type-label">Filter by Type</InputLabel>
          <Select
            labelId="filter-type-label"
            value={filterType}
            onChange={handleFilterChange}
            label="Filter by Type"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {pokemonTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'number'}
                  direction={order}
                  onClick={handleSort}
                >
                  Number
                </TableSortLabel>
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type One</TableCell>
              <TableCell>Type Two</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : pokemons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No Pokémons found.
                </TableCell>
              </TableRow>
            ) : (
              pokemons.map((pokemon) => (
                <TableRow key={pokemon.number} selected={pokemon.selected}  
                onClick={() => !pokemon.isToggling && handleToggle(pokemon.number)}
                hover
                style={{
                  cursor: pokemon.isToggling ? 'not-allowed' : 'pointer',
                  backgroundColor: pokemon.selected ? 'rgba(0, 123, 255, 0.1)' : 'inherit',
                  opacity: pokemon.isToggling ? 0.6 : 1,
                }}
                tabIndex={0} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    !pokemon.isToggling && handleToggle(pokemon.number);
                  }
                }}>
                <TableCell>
                <img
                  src={pokemon.imageUrl}
                  alt={pokemon.name}
                  width={20}
                  height={20}
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'pokeball.svg'; // Provide a placeholder image path
                  }}
                /></TableCell>
                  <TableCell>{pokemon.number}</TableCell>
                  <TableCell>{pokemon.name}</TableCell>
                  <TableCell>{pokemon.type_one}</TableCell>
                  <TableCell>{pokemon.type_two || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2}>
        <PaginationComponent
          page={currentPage}
          pageSize={pokemonsPerPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Box>
    </Box>
  );
};

export default PokemonTable;
