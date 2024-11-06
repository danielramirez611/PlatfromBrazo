import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import "../../App.css";
import { useAuth } from '../Auth/AuthContext';

const defaultTheme = createTheme();

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageStyle, setMessageStyle] = useState({});
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/account'); // Redirigir a la página de cuenta si ya está autenticado
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(''); // Limpiar mensaje antes de enviar la solicitud
    setMessageStyle({}); // Limpiar estilo del mensaje

    try {
      const response = await loginUser({ email, password });
      console.log('Response:', response); // Depuración

      if (response) {
        login(response.user);
        toast.success('Inicio de sesión exitoso: ¡Bienvenido!', { autoClose: 15000 });
        navigate('/account'); // Redirigir a la página de cuenta
      } else {
        throw new Error('Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      if (error.response) {
        console.log('Error response:', error.response); // Depuración
        setMessage(error.response.data.message);
        setMessageStyle({ color: 'red' });
        toast.error(error.response.data.message, { autoClose: 15000 });
      } else {
        setMessage('Error al iniciar sesión, por favor intente nuevamente');
        setMessageStyle({ color: 'red' });
        toast.error('Error al iniciar sesión, por favor intente nuevamente', { autoClose: 15000 });
      }
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ 
        height: '100vh', 
        backgroundImage: 'url(/img/arequipa.jpg)', 
        backgroundSize: 'cover',  
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat', 
        overflow: 'auto' 
      }}>
        <Grid
          item
          xs={false}
          sm={false}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            paddingTop: '4rem',
            zIndex: 1,
            '@media (max-width: 992px)': {
              display: 'none',
            },
          }}
        >
          <Typography
            variant="h1"
            component="div"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '60%',
              transform: 'translate(-50%, -50%)',
              color: '#FFFFFF',
              fontSize: '4rem',
              fontWeight: 'bold',
              '@media (max-width: 1200px)': {
                fontSize: '3rem',
              },
            }}
          >
            Bienvenidos a la <br />
            Universidad Continental
          </Typography>
        </Grid>
        <Grid 
          item 
          xs={12} 
          sm={12} 
          md={6} 
          component={Paper} 
          elevation={6} 
          square 
          sx={{ 
            backgroundColor: '#0D1A2E', 
            color: 'white',  
            padding: { xs: '2rem', sm: '3rem', lg: '4rem' }
          }}
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              marginTop: { xs: '30%', sm: '10%', lg:'0' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img 
              src="/img/unicontinental.png" 
              alt="icon" 
              style={{ 
                marginRight: '1rem', 
                height: window.innerWidth <= 600 ? '150px' : '300px', 
                marginTop: '0',
                maxWidth: '100%', 
                width: 'auto',
                padding:'10px' 
              }} 
            />
            <Typography
              component="h1"
              variant="h5"
              sx={{
                color: 'black',
                backgroundColor: '#D3D3D3',
                borderRadius: '25px',
                padding: '1rem 2rem',
                textAlign: 'center',
                width: '90%',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '@media (max-width: 600px)': {
                  width: '100%',
                  padding: '0.5rem 1rem',
                  fontSize: '1.25rem',
                },
              }}
            >
              Iniciar sesión
            </Typography>
            <form className="login-form" onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{
                  style: { color: '#fff' },
                }}
                InputProps={{
                  style: { color: '#fff', backgroundColor: '#1c2533' },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{
                  style: { color: '#fff' },
                }}
                InputProps={{
                  style: { color: '#fff', backgroundColor: '#1c2533' },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: 'black',
                  color: 'white',
                  borderRadius: '10px',
                  height: '2.5rem',
                  '@media (max-width: 600px)': { 
                    width: '100%',
                  },
                  '&:hover': {
                    backgroundColor: 'black',
                    opacity: 0.8,
                  },
                }}
              >
                Ingresar
              </Button>
            </form>
            {message && (
              <Typography variant="body1" sx={{ ...messageStyle, marginTop: '1rem' }}>
                {message}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default LoginPage;
