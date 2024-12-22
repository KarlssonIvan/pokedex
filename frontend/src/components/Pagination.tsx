import React from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, Button, Typography, SelectChangeEvent } from '@mui/material';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>, _: React.ReactNode) => {
    onPageSizeChange(event.target.value as number);
  };
  
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <FormControl variant="outlined" size="small">
        <InputLabel id="page-size-label">Items per page</InputLabel>
        <Select
          labelId="page-size-label"
          value={pageSize}
          onChange={handlePageSizeChange}
          label="Items per page"
        >
          {[5, 10, 20].map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" alignItems="center">
        <Button variant="contained" onClick={handlePrev} disabled={page === 1} sx={{ mr: 2 }}>
          Previous
        </Button>
        <Typography variant="body1">
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={page === totalPages}
          sx={{ ml: 2 }}
        >
          Next
        </Button>
      </Box>
      <Typography variant="body1">Total Pokémons: {totalItems}</Typography>
    </Box>
  );
};

export default PaginationComponent;
