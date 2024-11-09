import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getUsers, deleteUser, updateUser } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Grid,
  Paper,
  Avatar,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const defaultTheme = createTheme();

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [genero, setGenero] = useState('');
  const [role, setRole] = useState('user');
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [dniError, setDniError] = useState(null);
  const [celularError, setCelularError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          first_name: firstName,
          last_name: lastName,
          username,
          password,
          dni,
          celular,
          email,
          genero,
          role,
        });
        toast.success('Usuario actualizado exitosamente.', { autoClose: 15000 });
      } else {
        await registerUser({
          first_name: firstName,
          last_name: lastName,
          username,
          password,
          dni,
          celular,
          email,
          genero,
          role,
        });
        toast.success('Registro exitoso. Por favor, inicia sesión.', { autoClose: 15000 });
      }
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      resetForm();
    } catch (error) {
      if (error.response.status === 403) {
        toast.error('No se puede actualizar el usuario administrador.', { autoClose: 15000 });
      } else if (error.response.status === 400) {
        const errorData = error.response.data;
        setUsernameError(errorData.username ? errorData.username[0] : null);
        setPasswordError(errorData.password ? errorData.password[0] : null);
        setDniError(errorData.dni ? errorData.dni[0] : null);
        setCelularError(errorData.celular ? errorData.celular[0] : null);
        setEmailError(errorData.email ? errorData.email[0] : null);
        toast.error('Error en el registro. Por favor, verifica los campos.', { autoClose: 15000 });
      } else {
        toast.error('Error en el registro. Por favor, inténtalo de nuevo.', { autoClose: 15000 });
      }
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar este usuario?');
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      toast.success('Usuario eliminado correctamente.');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error('No se puede eliminar el usuario administrador.');
      } else {
        toast.error('Error al eliminar el usuario.');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setUsername(user.username);
    setPassword(user.password);
    setDni(user.dni);
    setCelular(user.celular);
    setEmail(user.email);
    setGenero(user.genero);
    setRole(user.role);
  };

  const resetForm = () => {
    setEditingUserId(null);
    setFirstName('');
    setLastName('');
    setUsername('');
    setPassword('');
    setDni('');
    setCelular('');
    setEmail('');
    setGenero('');
    setRole('user');
    setUsernameError(null);
    setPasswordError(null);
    setDniError(null);
    setCelularError(null);
    setEmailError(null);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ minHeight: '100vh', backgroundImage: 'url(/img/login-banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
        <Grid item xs={12} md={8} sx={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={6} sx={{ padding: '2rem', width: '100%', maxWidth: '800px', backgroundColor: '#0D1A2E', color: 'white', borderRadius: '16px', marginTop:{lg:'-25px', md:'0px', xs:'55px'}, marginLeft:{lg:'60PX',md:'0px', xs:'0px'} }}>
            <Grid container justifyContent="center" alignItems="center" direction="column">
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                {editingUserId ? 'Editar Usuario' : 'Registro'}
              </Typography>
              <form className="register-form" onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="firstName"
                      label="Nombre"
                      name="firstName"
                      autoFocus
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      InputLabelProps={{
                        style: { color: '#fff' },
                      }}
                      InputProps={{
                        style: { color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="lastName"
                      label="Apellido"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      InputLabelProps={{
                        style: { color: '#fff' },
                      }}
                      InputProps={{
                        style: { color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="Nombre de usuario"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      error={usernameError !== null}
                      helperText={usernameError}
                      InputLabelProps={{
                        style: { color: '#fff' },
                      }}
                      InputProps={{
                        style: { color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Correo Electrónico"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={emailError !== null}
                      helperText={emailError}
                      InputLabelProps={{
                        style: { color: '#fff' },
                      }}
                      InputProps={{
                        style: { color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                      error={passwordError !== null}
                      helperText={passwordError}
                      InputLabelProps={{
                        style: { color: '#fff' },
                      }}
                      InputProps={{
                        style: { color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="dni"
                      label="DNI"
                      id="dni"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      error={dniError !== null}
                      helperText={dniError}
                      InputLabelProps={{
                        style: { color: '#fff' },
                      }}
                      InputProps={{
                        style: { color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="celular"
                      label="Celular"
                      id="celular"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      error={celularError !== null}
                      helperText={celularError}
                      InputLabelProps={{
                        style: { color: '#fff' },
                      }}
                      InputProps={{
                        style: { color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Select
                          value={genero}
                          onChange={(e) => setGenero(e.target.value)}
                          displayEmpty
                          fullWidth
                          style={{ color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px', border: '1px solid #fff' }}
                        >
                          <MenuItem value="" disabled>
                            <em>Selecciona tu género</em>
                          </MenuItem>
                          <MenuItem value="masculino">Masculino</MenuItem>
                          <MenuItem value="femenino">Femenino</MenuItem>
                          <MenuItem value="otro">Otro</MenuItem>
                        </Select>
                      }
                      sx={{ width: '100%', margin: '8px 0', color: '#fff' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          displayEmpty
                          fullWidth
                          style={{ color: '#fff', backgroundColor: '#1c2533', borderRadius: '8px', border: '1px solid #fff' }}
                        >
                          <MenuItem value="" disabled>
                            <em>Selecciona el rol del usuario</em>
                          </MenuItem>
                          <MenuItem value="user">Estudiante</MenuItem>
                          <MenuItem value="admin">Docente</MenuItem>
                        </Select>
                      }
                      sx={{ width: '100%', margin: '8px 0', color: '#fff' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        borderRadius: '10px',
                        height: '56px',
                        width: '100%',
                        '@media (max-width: 600px)': {
                          width: '100%',
                        },
                        '&:hover': {
                          backgroundColor: 'black',
                          opacity: 0.8,
                        },
                      }}
                    >
                      {editingUserId ? 'Actualizar' : 'Registrarse'}
                    </Button>
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                  <Grid item xs={12} sm={6} >
                    <Button
                      onClick={() => navigate('/course-tablet')}
                      fullWidth
                      variant="contained"
                      color="secondary"
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: '10px',
                        height: '2.5rem',
                        width: '100%',
                        '@media (max-width: 600px)': {
                          width: '100%',
                        },
                        '&:hover': {
                          backgroundColor: '#4CAF50',
                          opacity: 0.8,
                        },
                      }}
                    >
                      Ver Detalles del Curso
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      onClick={() => navigate('/arduino-tablet')}
                      fullWidth
                      variant="contained"
                      color="secondary"
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: '10px',
                        height: '2.5rem',
                        width: '100%',
                        '@media (max-width: 600px)': {
                          width: '100%',
                        },
                        '&:hover': {
                          backgroundColor: '#4CAF50',
                          opacity: 0.8,
                        },
                      }}
                    >
                      Ver codigos de Arduino
                    </Button>         
                  </Grid>
                   {/*<Grid item xs={12} sm={6}>
                    <Button
                      onClick={() => navigate('/entregas-tablet')}
                      fullWidth
                      variant="contained"
                      color="secondary"
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: '10px',
                        height: '2.5rem',
                        width: '100%',
                        '@media (max-width: 600px)': {
                          width: '100%',
                        },
                        '&:hover': {
                          backgroundColor: '#4CAF50',
                          opacity: 0.8,
                        },
                      }}
                    >
                      Ver Entregas de Archivos
                    </Button>         
                    </Grid>*/}
                  
                </Grid>
              </form>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ padding: '2rem', marginLeft: { lg: '-50px', xs: '0px', md: '0px' } }}>
            <div style={{ width: '100%' }}>
              <Typography variant="h4" component="h2" sx={{ color: '#fff', mb: 2 }}>
                Usuarios Registrados
              </Typography>
              {loading ? (
                <div style={{ color: '#fff' }}>Cargando...</div>
              ) : error ? (
                <div style={{ color: '#fff' }}>Error: {error.message}</div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="user table">
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ color: '#fff' }}>Nombre</TableCell>
                          <TableCell style={{ color: '#fff' }}>Apellido</TableCell>
                          <TableCell style={{ color: '#fff' }}>Nombre de usuario</TableCell>
                          <TableCell style={{ color: '#fff' }}>Correo electrónico</TableCell>
                          <TableCell style={{ color: '#fff' }}>DNI</TableCell>
                          <TableCell style={{ color: '#fff' }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell style={{ color: '#fff' }}>{user.first_name}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{user.last_name}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{user.username}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{user.email}</TableCell>
                            <TableCell style={{ color: '#fff' }}>{user.dni}</TableCell>
                            <TableCell>
                              <IconButton aria-label="edit" onClick={() => handleEdit(user)} sx={{ color: 'white' }}>
                                <EditIcon />
                              </IconButton>
                              <IconButton aria-label="delete" onClick={() => handleDelete(user.id)} sx={{ color: 'white' }}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </div>
          </Grid>

      </Grid>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default RegisterPage;
