import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#57e389', // Primary color
    },
    background: {
      default: '#121212', // Background color for the whole app
      paper: '#1e1e1e',   // Background color for surfaces (e.g., Paper, Cards)
    },
    text: {
      primary: '#ffffff', // Text color on primary background
      secondary: '#b3b3b3', // Secondary text (e.g., subtitles, hints)
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Custom font family
    fontSize: 14, // Base font size
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for all buttons
          textTransform: 'none', // Disable uppercase styling
        },
        contained: {
          backgroundColor: '#57e389',
          color: '#121212',
          '&:hover': {
            backgroundColor: '#4ed47a', // Slightly darker shade for hover
          },
        },
      },
    },
  },
});

export default theme;
