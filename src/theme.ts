import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    dragonball: {
      50: '#fff9db',
      100: '#ffe9ae',
      200: '#ffda7d',
      300: '#ffcb4b',
      400: '#ffbb1a',
      500: '#e6a200',
      600: '#b37f00',
      700: '#815c00',
      800: '#4f3800',
      900: '#1f1600',
    },
    orange: {
      500: '#ff7700',
      600: '#ff9500',
      700: '#ff5500',
    },
  },
  fonts: {
    heading: `'Saiyan-Sans', sans-serif`,
    body: `system-ui, sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: '#242424',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      variants: {
        dragonball: {
          bg: 'linear-gradient(to right, #ff7700, #ff9500)',
          color: 'white',
          fontFamily: 'Saiyan-Sans',
          _hover: {
            bg: 'linear-gradient(to right, #ff9500, #ffcc00)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(255, 150, 0, 0.3)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
});

export default theme;