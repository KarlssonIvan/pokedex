import { useState, useEffect } from 'react';

interface UsePaginationReturn {
  currentPage: number;
  pokemonsPerPage: number;
  setPage: (page: number) => void;
  setPokemonsPerPage: (size: number) => void;
}

const usePagination = (): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const savedPage = localStorage.getItem('currentPage');
    const parsedPage = savedPage ? parseInt(savedPage, 10) : 1;
    return parsedPage > 0 ? parsedPage : 1;
  });

  const [pokemonsPerPage, setPokemonsPerPage] = useState<number>(() => {
    const savedPageSize = localStorage.getItem('pokemonsPerPage');
    const parsedPageSize = savedPageSize ? parseInt(savedPageSize, 10) : 5;
    return parsedPageSize > 0 ? parsedPageSize : 5;
  });

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('pokemonsPerPage', pokemonsPerPage.toString());
  }, [pokemonsPerPage]);

  return {
    currentPage,
    pokemonsPerPage,
    setPage: setCurrentPage,
    setPokemonsPerPage,
  };
};

export default usePagination;
