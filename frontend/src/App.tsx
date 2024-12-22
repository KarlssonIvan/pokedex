import React, { useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography } from '@mui/material';
import { getTheme } from './theme';
import ThemeToggle from './components/ThemeToggle';
import PokemonTable from './components/PokemonTable';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" >
          <Toolbar>
            <Typography variant="body1" component="div" sx={{ flexGrow: 1 }}>
              Pokémon Manager
            </Typography>
            <ThemeToggle toggleTheme={toggleTheme} />
          </Toolbar>
        </AppBar>
        <Container sx={{ marginTop: 2 }}>
          <Routes>
            <Route path="/" element={<PokemonTable />} />
            {/* Add more routes here if needed */}
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
