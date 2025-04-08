import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Grid, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Header from './components/Header';
import TokenInput from './components/TokenInput';
import ModelSelector from './components/ModelSelector';
import ResultsDisplay from './components/ResultsDisplay';
import TokenVisualizer from './components/TokenVisualizer';
import AdvancedOptions from './components/AdvancedOptions';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import useTheme from './hooks/useTheme';
import useTokenCalculation from './hooks/useTokenCalculation';

function App() {
  const [isDarkMode, setIsDarkMode] = useTheme();
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');

  const results = useTokenCalculation(text, selectedModel);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TokenInput text={text} setText={setText} />
            </Grid>

            <Grid item xs={12} md={4}>
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ResultsDisplay results={results} model={selectedModel} />
            <TokenVisualizer tokens={results.tokens} isCalculating={results.isCalculating} />
            <AdvancedOptions />
          </Box>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;