import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { useAuth } from '../pages/Auth/AuthContext';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import librosIcon from './../../public/img/libros.png';
import casaIcon from './../../public/img/calendario.png';
import logo from './../../public/img/continental.png';
import imayiner from './../../public/img/logo.png';
import aspireIcon from './../../public/img/user.png';
import entrarIcon from './../../public/img/entrar.png';
import arduino from './../../public/img/tecnologia.png';

const pages = ['Cursos', 'Calendario'];
const adminPages = ['Mis usuarios'];
const labPages = ['Laboratorio Arduino'];

const drawerStyles = {
  backgroundColor: '#26292B',
  height: '100%',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const ResponsiveAppBar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [openLabMenu, setOpenLabMenu] = React.useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handlePageClick = (page: string) => {
    // No cerrar el drawer si es "Laboratorio Arduino", solo si es otro menú
    if (page !== 'Laboratorio Arduino') {
      setDrawerOpen(false);
    }
    switch (page) {
      case 'Cursos':
        navigate('/courses');
        break;
      case 'Calendario':
        navigate('/home');
        break;
      case 'Laboratorio Arduino':
        navigate('/arduino-lab');
        break;
      case 'Mis usuarios':
        navigate('/register');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getIcon = (page: string) => {
    switch (page) {
      case 'Cursos':
        return librosIcon;
      case 'Calendario':
        return casaIcon;
      case 'Laboratorio Arduino':
        return arduino;
      default:
        return null;
    }
  };

  const getLabel = (page: string) => {
    switch (page) {
      case 'Cursos':
        return 'Cursos';
      case 'Calendario':
        return 'Calendario';
      case 'Laboratorio Arduino':
        return 'Laboratorio Arduino';
      default:
        return '';
    }
  };

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onKeyDown={toggleDrawer(false)}
      style={drawerStyles}
    >
      <List>
        <ListItem>
          <img
            src={logo}
            alt="Logo"
            style={{ width: '75px', height: '75px', margin: '0 auto' }}
          />
        </ListItem>
        {isAuthenticated && pages.map((page) => (
          <ListItem button key={page} onClick={() => handlePageClick(page)}>
            <ListItemIcon>
              <img
                src={getIcon(page)}
                alt={page}
                style={{ width: 24, height: 24 }}
              />
            </ListItemIcon>
            <ListItemText primary={getLabel(page)} />
          </ListItem>
        ))}
        
        {/* Separate laboratory submenu */}
        {isAuthenticated && (
          <>
            <ListItem button onClick={() => setOpenLabMenu(!openLabMenu)}>
              <ListItemIcon>
                <img
                  src={arduino}
                  alt="Laboratorios"
                  style={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText primary="Laboratorios" />
              {openLabMenu ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
        
            <Collapse in={openLabMenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {labPages.map((page) => (
                  <ListItem
                    button
                    sx={{ pl: 4 }}
                    key={page}
                    onClick={() => handlePageClick(page)}
                  >
                    <ListItemIcon>
                      <img
                        src={getIcon(page)}
                        alt={page}
                        style={{ width: 24, height: 24 }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={getLabel(page)} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
        
        {/* Administrador */}
        {isAuthenticated &&
          user.role === 'admin' &&
          adminPages.map((page) => (
            <ListItem button key={page} onClick={() => handlePageClick(page)}>
              <ListItemIcon>
                <img
                  src={aspireIcon}
                  alt={page}
                  style={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText primary="Crear Usuarios" />
            </ListItem>
          ))}
        {isAuthenticated ? (
          <>
            <ListItem button onClick={() => navigate('/account')}>
              <ListItemIcon>
                <img
                  src={aspireIcon}
                  alt="Cuenta"
                  style={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText primary="Cuenta" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <img
                  src={entrarIcon}
                  alt="Salir"
                  style={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText primary="Salir" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => navigate('/login')}>
            <ListItemIcon>
              <img
                src={entrarIcon}
                alt="Ingresar"
                style={{ width: 24, height: 24 }}
              />
            </ListItemIcon>
            <ListItemText primary="Ingresar" />
          </ListItem>
        )}
      </List>
      <Box sx={{ padding: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <img
            src={imayiner}
            alt="Logo"
            style={{ width: '50px', height: '50px', marginRight: '8px' }}
          />
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'white', fontSize: '0.70rem' }}
          >
            © 2024 derechos reservados IMYINER-PROYECT-I.E.R.L
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: '120px' },
          height: { xs: 'auto', md: '100vh' },
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: 'center',
          background: '#1E2123',
          left: 0,
          top: 0,
          zIndex: 1300,
        }}
      >
        <Toolbar
          sx={{
            flexDirection: { xs: 'row', md: 'column' },
            alignItems: 'center',
            width: '100%',
            justifyContent: 'flex-start',
            mt: { xs: 0, md: 8 },
            padding: 0,
            height: '100%',
            overflowY: 'auto', // Permite el scroll en el contenido del AppBar
          }}
        >
          {/* Contenido para dispositivos pequeños */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <IconButton
              size="large"
              aria-label="open drawer"
              onClick={toggleDrawer(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <img
              src={logo}
              alt="Logo"
              style={{ width: '95px', height: '75px', marginLeft: 'auto' }}
            />
          </Box>

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            sx={{ zIndex: 1400 }}
          >
            {drawerList}
          </Drawer>

          {/* Contenido para dispositivos medianos y grandes */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box sx={{ mt: 2, mb: 4 }}>
              <img
                src={logo}
                alt="Logo"
                style={{ width: '120px', height: '60px' }}
              />
            </Box>
            {isAuthenticated && (
              <Box sx={{ flexGrow: 1 }}>
                {pages.map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    sx={{
                      mb: 0.5,
                      color: 'inherit',
                      borderRadius: '0px',
                      justifyContent: 'center',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                      width: '100%',
                      padding: '10px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {getIcon(page) && (
                      <img
                        src={getIcon(page)}
                        alt={page}
                        style={{ width: 24, height: 24 }}
                      />
                    )}
                    <span style={{ marginTop: '3px', fontSize: '14px' }}>
                      {getLabel(page)}
                    </span>
                  </Button>
                ))}
                {/* Submenú de Laboratorios */}
                <Box>
                  <Button
                    onClick={() => setOpenLabMenu(!openLabMenu)}
                    sx={{
                      mb: 0.5,
                      color: 'inherit',
                      borderRadius: '0px',
                      justifyContent: 'center',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                      width: '100%',
                      padding: '10px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={arduino}
                      alt="Laboratorios"
                      style={{ width: 24, height: 24 }}
                    />
                    <span style={{ marginTop: '3px', fontSize: '14px' }}>
                      Laboratorios
                    </span>
                    {openLabMenu ? <ExpandLess /> : <ExpandMore />}
                  </Button>
                  <Collapse in={openLabMenu} timeout="auto" unmountOnExit>
                    <Box
                      sx={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: '100%',
                      }}
                    >
                      {labPages.map((page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          sx={{
                            mb: 0.5,
                            color: 'inherit',
                            borderRadius: '0px',
                            justifyContent: 'center',
                            textTransform: 'none',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.1)',
                            },
                            width: '100%',
                            padding: '10px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <img
                            src={getIcon(page)}
                            alt={page}
                            style={{ width: 24, height: 24 }}
                          />
                          <span style={{ marginTop: '3px', fontSize: '14px' }}>
                            {getLabel(page)}
                          </span>
                        </Button>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
                {user.role === 'admin' &&
                  adminPages.map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      sx={{
                        mb: 0.5,
                        color: 'inherit',
                        borderRadius: '0px',
                        justifyContent: 'center',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                        width: '100%',
                        padding: '10px 10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={aspireIcon}
                        alt={page}
                        style={{ width: 24, height: 24 }}
                      />
                      <span style={{ marginTop: 0, fontSize: '12px' }}>
                        Crear Usuarios
                      </span>
                    </Button>
                  ))}
              </Box>
            )}
            {isAuthenticated && (
              <Box sx={{ mb: 2 }}>
                <Button
                  key="Cuenta"
                  onClick={() => navigate('/account')}
                  sx={{
                    mb: 0.5,
                    color: 'inherit',
                    borderRadius: '0px',
                    justifyContent: 'center',
                    textTransform: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                    width: '100%',
                    padding: '10px 10px',
                    fontWeight: 'bold',
                  }}
                >
                  <img
                    src={aspireIcon}
                    alt="Cuenta"
                    style={{ width: 24, height: 24 }}
                  />
                  <span style={{ marginTop: 0, fontSize: '12px' }}>
                    Cuenta
                  </span>
                </Button>
                <Button
                  key="Logout"
                  onClick={handleLogout}
                  sx={{
                    color: 'inherit',
                    borderRadius: '0px',
                    justifyContent: 'center',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                    width: '100%',
                    padding: '10px 10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={entrarIcon}
                    alt="Salir"
                    style={{ width: 24, height: 24 }}
                  />
                  <span style={{ marginTop: 0, fontSize: '12px' }}>Salir</span>
                </Button>
              </Box>
            )}
            {!isAuthenticated && (
              <Box sx={{ mb: 2 }}>
                <Button
                  key="Ingresar"
                  onClick={() => navigate('/login')}
                  sx={{
                    mb: 2,
                    color: 'inherit',
                    borderRadius: '0px',
                    justifyContent: 'center',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                    width: '100%',
                    padding: '10px 10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={entrarIcon}
                    alt="Ingresar"
                    style={{ width: 24, height: 24 }}
                  />
                  <span style={{ marginTop: 0 }}>Ingresar</span>
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default ResponsiveAppBar;
