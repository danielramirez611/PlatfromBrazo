import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Box, Avatar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D1A2E',
    },
    secondary: {
      main: '#ffffff',
    },
  },
});

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user'); // Eliminar el usuario del localStorage
    navigate('/login'); // Redirigir al login
  };

  const firstNameInitial = user.first_name ? capitalizeFirstLetter(user.first_name.charAt(0)) : '';
  const lastNameInitial = user.last_name ? capitalizeFirstLetter(user.last_name.charAt(0)) : '';

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ marginTop: '4rem', textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'secondary.main',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', mb: 2, width: 100, height: 100, fontSize: 48 }}>
            {firstNameInitial}
            {lastNameInitial}
          </Avatar>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Bienvenido, {capitalizeFirstLetter(user.first_name)} {capitalizeFirstLetter(user.last_name)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Estamos encantados de tenerte aquí. Esperamos que disfrutes de tu experiencia en nuestra plataforma.
          </Typography>
          <Typography variant="h6" component="h2" sx={{ mt: 1, mb: 4 }}>
            Correo: {user.email}
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 'auto',
              mb: 2,
            }}
          >
            
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AccountPage;
