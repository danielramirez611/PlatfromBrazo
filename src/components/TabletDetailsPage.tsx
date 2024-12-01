import React, { useEffect, useState } from 'react';
import {
  getCourses,
  deleteCourse,
  updateCourse,
  addCourse,
  getCourseWeeks,
  addCourseWeek,
  getWeekFiles,
  addWeekFile,
  deleteWeek,
  deleteFile,
  toggleWeekStatus ,
  updateWeek,
  getEntregaStatus, // Asegúrate de importar esta función
  toggleEntregaStatus // Asegúrate de importar esta función
} from '../api';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Tooltip from '@mui/material/Tooltip';
import basura from '../../public/img/bote-de-basura.png';
import editar from '../../public/img/editar.png';
import habilitar from '../../public/img/habilitar.png';
import desabilitar from '../../public/img/desabilitar.png';
import archivo from '../../public/img/archivo.png';


const TabletDetailsPage = () => {
  const [courses, setCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [updatedCourseData, setUpdatedCourseData] = useState({
    title: '',
    introduction: '',
    objetivos_especificos: '',
    image: ''
  });
  const initialCourseData = {
    title: '',
    introduction: '',
    objetivos_especificos: '',
    image: ''
  };
  const initialWeekData = { semana: '', role: 'user' };
  const initialFileData = { nombre_archivo: '', archivo: '' };
  const MAX_FILE_SIZE = 128 * 1024 * 1024; // 128 MB

  const [newCourseData, setNewCourseData] = useState(initialCourseData);
  const [newWeekData, setNewWeekData] = useState(initialWeekData);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedWeekId, setSelectedWeekId] = useState('');
  const [newFileData, setNewFileData] = useState(initialFileData);
  const [currentImage, setCurrentImage] = useState('');
  const [editWeekModalOpen, setEditWeekModalOpen] = useState(false);
  const [weekToEdit, setWeekToEdit] = useState(null);
  const [updatedWeekData, setUpdatedWeekData] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [entregaHabilitada, setEntregaHabilitada] = useState(false); // Mantén esta línea
const [startTime, setStartTime] = useState(''); // Mantén esta línea
const [endTime, setEndTime] = useState(''); // Mantén esta línea
const [openModal, setOpenModal] = useState(false); // Mantén esta línea

useEffect(() => {
  const fetchWeeksAndEntregaStatus = async () => {
      if (selectedCourseId) {
          try {
              const weeksData = await getCourseWeeks(selectedCourseId);
              setWeeks(weeksData);

              const entregaStatus = await getEntregaStatus();
              setEntregaHabilitada(entregaStatus.isEnabled);
              setStartTime(entregaStatus.startTime || '');
              setEndTime(entregaStatus.endTime || '');
          } catch (error) {
              console.error('Error fetching weeks or entrega status:', error);
              toast.error('Error fetching weeks or entrega status');
          }
      }
  };

  fetchWeeksAndEntregaStatus();
}, [selectedCourseId]);

useEffect(() => {
  if (entregaHabilitada && endTime) {
      const now = new Date();
      const endDate = new Date(endTime);
      if (now >= endDate) {
          setEntregaHabilitada(false);
          toast.info('La habilitación de la entrega ha finalizado.');
      }
  }
}, [endTime, entregaHabilitada]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchWeeksAndFiles = async () => {
      if (selectedCourseId) {
        const weeksData = await getCourseWeeks(selectedCourseId);
        setWeeks(weeksData);
    
        const filesData = {};
        for (const week of weeksData) {
          if (week.is_enabled) { // Solo cargar archivos para semanas habilitadas
            const weekFiles = await getWeekFiles(week.id);
            filesData[week.id] = weekFiles;
          }
        }
        setFiles(filesData);
      }
    };
    

    fetchWeeksAndFiles();
  }, [selectedCourseId]);

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar este curso?');
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
      if (selectedCourseId === courseId) {
        setSelectedCourseId(courses.length > 1 ? courses[0].id : '');
        setWeeks([]);
        setFiles({});
      }
      toast.success('Curso eliminado correctamente.');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Error al eliminar el curso.');
    }
  };

  const handleDeleteWeek = async (weekId) => {
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar esta semana?');
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteWeek(weekId);
      setWeeks(weeks.filter(week => week.id !== weekId));
      setFiles(prevFiles => {
        const newFiles = { ...prevFiles };
        delete newFiles[weekId];
        return newFiles;
      });
      toast.success('Semana eliminada correctamente.');
    } catch (error) {
      console.error('Error deleting week:', error);
      toast.error('Error al eliminar la semana.');
    }
  };
  const handleToggleEntrega = async () => {
    try {
        const newStatus = true; // Siempre habilitar al hacer clic
        await toggleEntregaStatus(newStatus, startTime, endTime);
        setEntregaHabilitada(newStatus);
        toast.success('Entrega de archivos habilitada correctamente.');
        setOpenModal(false);  // Cierra el modal después de habilitar
    } catch (error) {
        console.error('Error al habilitar la entrega de archivos:', error);
        toast.error('Error al habilitar la entrega de archivos.');
    }
};

  const getCourseTitleById = (courseId) => {
    const course = courses.find(course => course.id === courseId);
    return course ? course.title : 'Curso no encontrado';
  };

  const handleDeleteFile = async (fileId, weekId) => {
    const confirmDelete = window.confirm('¿Seguro que quieres eliminar este archivo?');
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteFile(fileId);
      setFiles(prevFiles => {
        const newFiles = { ...prevFiles };
        newFiles[weekId] = newFiles[weekId].filter(file => file.id !== fileId);
        return newFiles;
      });
      toast.success('Archivo eliminado correctamente.');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error al eliminar el archivo.');
    }
  };

  const getWeekNameById = (weekId) => {
    const week = weeks.find(week => week.id === weekId);
    return week ? week.semana : 'Semana no encontrada';
  };

  const handleEditCourse = (course) => {
    setCourseToEdit(course);
    setUpdatedCourseData({
      title: course.title,
      introduction: course.introduction,
      objetivos_especificos: course.objetivos_especificos,
      image: course.image ? course.image : ''
    });
    setCurrentImage(course.image ? `data:image/jpeg;base64,${course.image}` : '');
    setEditModalOpen(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedCourseData({ ...updatedCourseData, image: reader.result.split(',')[1] });
        setCurrentImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64Str}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
    });
  };

  const handleSaveEdit = async () => {
    try {
      let compressedImage = updatedCourseData.image;
      if (updatedCourseData.image && updatedCourseData.image.startsWith('data:image/')) {
        compressedImage = await compressImage(updatedCourseData.image);
      }
      const updatedData = { ...updatedCourseData, image: compressedImage };
      await updateCourse(courseToEdit.id, updatedData);
      const updatedCourses = courses.map(course =>
        course.id === courseToEdit.id ? { ...course, ...updatedData } : course
      );
      setCourses(updatedCourses);
      setEditModalOpen(false);
      toast.success('Curso actualizado correctamente.');
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Error al actualizar el curso.');
    }
  };

  const handleAddNewCourseWithReset = async () => {
    if (!newCourseData.title || !newCourseData.introduction || !newCourseData.objetivos_especificos || !newCourseData.image) {
      toast.error('Todos los campos deben estar llenos para agregar un curso.');
      return;
    }
    try {
      let compressedImage = newCourseData.image;
      if (newCourseData.image && newCourseData.image.startsWith('data:image/')) {
        compressedImage = await compressImage(newCourseData.image);
      }
      const newData = { ...newCourseData, image: compressedImage };
      await addCourse(newData);
      const updatedCourses = await getCourses();
      setCourses(updatedCourses);
      setNewCourseData(initialCourseData); // Reset fields
      toast.success('Curso agregado correctamente.');
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Error al agregar el curso.');
    }
  };

  const handleNewImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCourseData({ ...newCourseData, image: reader.result.split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddWeekWithReset = async () => {
    if (!selectedCourseId || !newWeekData.semana || !newWeekData.role) {
      toast.error('Selecciona un curso, llena el campo de semana y selecciona un rol.');
      return;
    }
    try {
      await addCourseWeek(selectedCourseId, newWeekData);
      const weeksData = await getCourseWeeks(selectedCourseId);
      setWeeks(weeksData);
      setNewWeekData(initialWeekData); // Reset fields
      toast.success('Semana agregada correctamente.');
    } catch (error) {
      console.error('Error adding week:', error);
      toast.error('Error al agregar la semana.');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFileData({
          nombre_archivo: file.name,
          archivo: reader.result.split(',')[1]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileNameChange = (event) => {
    setNewFileData({
      ...newFileData,
      nombre_archivo: event.target.value
    });
  };

  const handleAddFileWithReset = async () => {
    try {
      if (!selectedWeekId || !newFileData) {
        toast.error('Selecciona una semana y un archivo');
        return;
      }
      await addWeekFile(selectedWeekId, newFileData);
      const weekFiles = await getWeekFiles(selectedWeekId);
      setFiles(prevFiles => ({
        ...prevFiles,
        [selectedWeekId]: weekFiles
      }));
      setNewFileData(initialFileData); // Reset fields
      toast.success('Archivo agregado correctamente.');
    } catch (error) {
      console.error('Error adding file:', error);
      toast.error('Error al agregar el archivo.');
    }
  };

  const handleEditWeek = (week) => {
    setWeekToEdit(week);
    setUpdatedWeekData(week.semana);
    setEditWeekModalOpen(true);
  };

  const handleSaveEditWeek = async () => {
    try {
      await updateWeek(weekToEdit.id, { semana: updatedWeekData });
      const updatedWeeks = weeks.map(week =>
        week.id === weekToEdit.id ? { ...week, semana: updatedWeekData } : week
      );
      setWeeks(updatedWeeks);
      setEditWeekModalOpen(false);
      toast.success('Semana actualizada correctamente.');
    } catch (error) {
      console.error('Error updating week:', error);
      toast.error('Error al actualizar la semana.');
    }
  };

  const handleDownload = (fileContent, fileName) => {
    try {
      // Detectar el tipo de archivo basado en la extensión
      const extension = fileName.split('.').pop().toLowerCase();
      let mimeType = '';
  
      if (extension === 'docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (extension === 'pdf') {
        mimeType = 'application/pdf';
      } else if (extension === 'pptx') { // Manejo para archivos PPTX
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      } else {
        throw new Error('Tipo de archivo no soportado');
      }
  
      // Decodificar el contenido del archivo
      const byteCharacters = atob(fileContent.replace(/\s/g, ''));
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
  
      // Crear un enlace de descarga
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName.endsWith(`.${extension}`) ? fileName : fileName.replace(/\.[^/.]+$/, '') + `.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      toast.success('Archivo descargado correctamente.');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error al descargar el archivo.');
    }
  };
  
  
  const handleToggleWeek = async (weekId, currentStatus) => {
    const confirmToggle = window.confirm(`¿Seguro que quieres ${currentStatus ? 'deshabilitar' : 'habilitar'} esta semana?`);
    if (!confirmToggle) {
      return;
    }
  
    try {
      await toggleWeekStatus(weekId, !currentStatus);
      setWeeks(weeks.map(week => 
        week.id === weekId ? { ...week, is_enabled: !currentStatus } : week
      ));
      toast.success(`Semana ${currentStatus ? 'deshabilitada' : 'habilitada'} correctamente.`);
    } catch (error) {
      console.error(`Error al ${currentStatus ? 'deshabilitar' : 'habilitar'} la semana:`, error);
      toast.error(`Error al ${currentStatus ? 'deshabilitar' : 'habilitar'} la semana.`);
    }
  };
  const filteredWeeks = weeks.filter((week) => {
    const matchesRole = filterRole ? week.role === filterRole : true;
    const matchesSearchTerm = week.semana.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearchTerm;
  });
  
  
  
  
  return (
    <Grid container component="main" sx={{ height: '100vh', backgroundColor: '#0D1A2E', color: 'white' }}>
      <Grid item xs={12} component={Paper} elevation={6} square sx={{ padding: {lg:'1',xs:'1rem'}, backgroundColor: '#0D1A2E', color: 'white' }}>
        <Typography component="h1" variant="h5" align="center">
          Detalles del Curso
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Typography variant="h6">Cargando...</Typography>
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Typography variant="h6">Error: {error.message}</Typography>
          </Box>
        ) : (
          <Grid sx={{ marginRight: { lg: '158px', md: '0px', sm: '40px', xs: '10px' } }}>
            <Grid container spacing={6} sx={{ marginLeft: { lg: '100px', md: '0px', xs: '0px' }, marginTop: { xs: '20px' } }}>
              <Grid container spacing={2} sx={{ padding: { lg: '20px', md: '20px', sm: '20px', xs: '10px' }, marginLeft: { lg: '0px', md: '120px', sm: '50px', xs: '-18px' } }}>
                <Grid item lg={4} md={12} sm={10} xs={11} sx={{ marginLeft: { lg: '0px', md: '0px', sm: '0px', xs: '0.2%' } }}>
                  <Typography component="h2" variant="h6" sx={{ marginTop: 2, textAlign: 'center' }}>
                    Agregar Nuevo Curso
                  </Typography>
                  <Paper sx={{ padding: 2, backgroundColor: 'white', color: 'black', borderRadius: '10px' }}>
                    <TextField
                      label="Título"
                      value={newCourseData.title}
                      onChange={(e) => setNewCourseData({ ...newCourseData, title: e.target.value })}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Introducción"
                      value={newCourseData.introduction}
                      onChange={(e) => setNewCourseData({ ...newCourseData, introduction: e.target.value })}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Objetivos Específicos"
                      value={newCourseData.objetivos_especificos}
                      onChange={(e) => setNewCourseData({ ...newCourseData, objetivos_especificos: e.target.value })}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={4}
                    />
                    <div>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="new-raised-button-file"
                        type="file"
                        onChange={handleNewImageChange}
                      />
                      <label htmlFor="new-raised-button-file">
                        <Button
                          variant="contained"
                          component="span"
                          sx={{
                            mt: 2,
                            backgroundColor: 'black',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'black',
                              opacity: 0.8,
                            },
                          }}
                        >
                          Subir Imagen
                        </Button>
                      </label>
                      {newCourseData.image && (
                        <Box mt={2} textAlign="center">
                          <img src={`data:image/jpeg;base64,${newCourseData.image}`} alt="Imagen del curso" style={{ maxHeight: '200px', maxWidth: '100%' }} />
                        </Box>
                      )}
                    </div>
                    <Button onClick={handleAddNewCourseWithReset} sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}>
                      Agregar Cursos
                    </Button>
                  </Paper>
                </Grid>
                <Grid item lg={8} md={7} xs={11}>
                  <Typography component="h2" variant="h6" sx={{ marginTop: 2, textAlign: 'center' }}>
                    Cursos
                  </Typography>
                  <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '370px', backgroundColor: '#0D1A2E', borderRadius: '10px', padding: 2 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', color: 'white', fontSize: '15px' }}>
                      <thead>
                        <tr>
                          <th>Título</th>
                          <th>Introducción</th>
                          <th>Objetivos Específicos</th>
                          <th>Imagen</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>{course.title}</td>
                            <td style={{ padding: '8px' }}>{truncateText(course.introduction, 20)}</td>
                            <td style={{ padding: '8px' }}>
                              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                {truncateText(course.objetivos_especificos, 50)}
                              </pre>
                            </td>
                            <td style={{ padding: '8px' }}>
                              {course.image ? (
                                <img src={`data:image/jpeg;base64,${course.image}`} alt={course.title} style={{ maxHeight: '50px', width: 'auto' }} />
                              ) : (
                                <Typography variant="body2" color="textSecondary">Imagen no disponible</Typography>
                              )}
                            </td>
                            <td style={{ padding: '8px',display:'flex', flexDirection:'column'  }}>
                              <Button
                                onClick={() => handleEditCourse(course)}
                                sx={{
                                  backgroundColor: 'green',
                                  color: 'green',
                                  borderRadius: '10px',
                                  height: '2.5rem',
                                  width: '50%',
                                  marginBottom: '0.5rem',
                                  '&:hover': {
                                    backgroundColor: 'black',
                                    opacity: 0.8,
                                  },
                                }}
                              >
                               <img src={editar} alt="Editar curso" style={{ height: '1.5rem', width: '1.5rem' }} />
                              </Button>
                              <Button
                                onClick={() => handleDeleteCourse(course.id)}
                                sx={{
                                  backgroundColor: 'red',
                                  color: 'white',
                                  borderRadius: '10px',
                                  height: '2.5rem',
                                  width: '50%',
                                  '&:hover': {
                                    backgroundColor: 'black',
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                <img src={basura} alt="Eliminar curso" style={{ height: '1.5rem', width: '1.5rem' }} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Grid>
              </Grid >
              <Grid container spacing={2} sx={{ padding: { lg: '40px', md: '20px', sm: '20px', xs: '10px' } }}>
              <Grid item lg={4} md={5} sm={10} xs={11} sx={{ marginLeft: { lg: '0px', md: '0px', sm: '40px', xs: '0.2%' } }}>
                    <Typography component="h2" variant="h6" sx={{ marginTop: 2, textAlign: 'center' }}>
                      Agregar Nueva Semana
                    </Typography>
                    <Paper sx={{ padding: 2, backgroundColor: 'white', color: 'black', borderRadius: '10px' }}>
                      <Grid sx={{ display: { lg: 'flex', sm: 'flex', xs: 'block' }, justifyContent: 'space-around' }}>
                        <Tooltip title="Selecciona un curso primero">
                          <Select
                            label="Curso"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            fullWidth
                            margin="normal"
                            displayEmpty
                          >
                            <MenuItem value="" disabled>Selecciona un curso</MenuItem>
                            {courses.map((course) => (
                              <MenuItem key={course.id} value={course.id}>
                                {course.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </Tooltip>

                        <Tooltip title={selectedCourseId ? "Selecciona quién podrá ver este contenido" : "Primero selecciona un curso"} arrow>
                          <Select
                            label="Rol"
                            value={newWeekData.role}
                            onChange={(e) => setNewWeekData({ ...newWeekData, role: e.target.value })}
                            fullWidth
                            margin="normal"
                            displayEmpty
                            sx={{ marginTop: { xs: '15px', md: '0px', sm: '0px', lg: '0px' } }}
                            disabled={!selectedCourseId} // Deshabilita el Select hasta que se seleccione un curso
                          >
                            <MenuItem value="" disabled>Seleccione quien podrá ver este contenido</MenuItem>
                            <MenuItem value="user">Estudiante</MenuItem>
                            <MenuItem value="admin">Docente</MenuItem>
                          </Select>
                        </Tooltip>
                      </Grid>
                      <Tooltip title={selectedCourseId ? "Agrega el nombre de la semna o numeración" : "Primero selecciona un curso"} arrow>
                        <TextField
                          label="Semana"
                          value={newWeekData.semana}
                          onChange={(e) => setNewWeekData({ ...newWeekData, semana: e.target.value })}
                          fullWidth
                          margin="normal"
                          disabled={!selectedCourseId}
                        />
                      </Tooltip>
                      <Button onClick={handleAddWeekWithReset} sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}>
                        Agregar Semana
                      </Button>
                    </Paper>
                  </Grid>

                  <Grid item lg={8} md={12} xs={11} sx={{ alignItems: 'center' }}>
                    <Grid sx={{display:'flex', alignItems:'center',justifyContent:'space-around'}}>
                      <Typography component="h2" variant="h6" sx={{ marginTop: 2, textAlign: 'center' }}>
                        Semanas del Curso
                        
                      </Typography>
                      <Grid item lg={6} md={6} sm={12} xs={12} sx={{ display:{lg:'flex',sm:'flex',xs:'block'},justifyContent:'space-around',alignItems:'center',padding:'1rem'}}>
                        <Grid item lg={5} md={6} sm={5} xs={12} sx={{background:'white',borderRadius:'4%' }}>
                          <Tooltip title={selectedCourseId ? "Puedes buscar por el nombre/titulo de la semana" : "Primero selecciona un curso"} arrow>
                            <TextField
                              label="Buscar por semana"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              fullWidth
                              disabled={!selectedCourseId}
                            />
                          </Tooltip>
                        </Grid>
                        <Grid item lg={5} md={6} sm={5} xs={12} sx={{background:'white',borderRadius:'4%',marginTop:{lg:'0px', xs:'5px'} }}>
                          <Tooltip title={selectedCourseId ? "Filtra porquien puede visualizar el contenido de la semana" : "Primero selecciona un curso"} arrow>
                            <Select
                              label="Filtrar por rol"
                              value={filterRole}
                              onChange={(e) => setFilterRole(e.target.value)}
                              fullWidth
                              displayEmpty
                              disabled={!selectedCourseId}
                              
                            >
                              
                              <MenuItem value="">Todos los roles</MenuItem>
                              <MenuItem value="user">Estudiante</MenuItem>
                              <MenuItem value="admin">Docente</MenuItem>
                            </Select>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                      {/* Filtro de búsqueda y rol */}
                     
                      <Box>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', color: 'white', fontSize: '15px' }}>
                        <thead>
                            <tr>
                              <th>Curso ID</th>
                              <th>Semana</th>
                              <th>Rol</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                        </table>
                      </Box>
                      {/* Tabla de semanas */}
                      <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '180px', backgroundColor: '#0D1A2E', borderRadius: '10px', padding: 2 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', color: 'white', fontSize: '15px' }}>
                          <tbody>
                            {filteredWeeks.map((week) => (
                              <tr key={week.id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{getCourseTitleById(week.curso_id)}</td>
                                <td style={{ padding: '8px' }}>{week.semana}</td>
                                <td style={{ padding: '8px' }}>
                                  {week.role === 'user' ? 'Estudiante' : week.role === 'admin' ? 'Docente' : week.role}
                                </td>
                                <td style={{ padding: '8px' }}>
                                  <Grid sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Button
                                      onClick={() => handleEditWeek(week)}
                                      sx={{
                                        backgroundColor: 'green',
                                        color: 'white',
                                        borderRadius: '10px',
                                        height: '2.5rem',
                                        width: '20%',
                                        marginBottom: '0.5rem',
                                        '&:hover': {
                                          backgroundColor: 'green',
                                          opacity: 0.5,
                                        },
                                        fontSize: { lg: '12px', sm: '12px', md: '12px', xs: '9px' }
                                      }}
                                    >
                                      <img src={editar} alt="editar semana" style={{ height: '1.5rem', width: '1.5rem' }} />
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteWeek(week.id)}
                                      sx={{
                                        backgroundColor: 'red',
                                        color: 'white',
                                        borderRadius: '10px',
                                        height: '2.5rem',
                                        width: '20%',
                                        '&:hover': {
                                          backgroundColor: 'red',
                                          opacity: 0.5,
                                        },
                                        fontSize: { lg: '12px', sm: '12px', md: '12px', xs: '9px' }
                                      }}
                                    >
                                      <img src={basura} alt="Eliminar semana" style={{ height: '1.5rem', width: '1.5rem' }} />
                                    </Button>
                                    <Button
                                      onClick={() => handleToggleWeek(week.id, week.is_enabled)}
                                      sx={{
                                        backgroundColor: week.is_enabled ? 'green' : 'gray',
                                        color: 'white',
                                        borderRadius: '10px',
                                        height: '2.5rem',
                                        width: '20%',
                                        top: '5px',
                                        marginBottom: '0.5rem',
                                        '&:hover': {
                                          backgroundColor: week.is_enabled ? 'darkgreen' : 'darkgray',
                                          opacity: 0.8,
                                        }
                                      }}
                                    >
                                      {week.is_enabled ? <img src={habilitar} alt="habilitar" style={{ height: '100%', width: 'auto' }} /> : <img src={desabilitar} alt="Desabilitar" style={{ height: '100%', width: 'auto' }} />}
                                    </Button>
                                  </Grid>
                                  
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </Grid>

                  </Grid>
                  
 {/*
                  <Button
    onClick={() => setOpenModal(true)}
    sx={{
        margin: '20px auto',
        backgroundColor: 'green',
        color: 'white',
        display: 'block',
        '&:hover': {
            backgroundColor: 'darkgreen',
            opacity: 0.8,
        },
    }}
>
    Habilitar Entrega
</Button> */}


        <Modal
    open={openModal}
    onClose={() => setOpenModal(false)}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
>
    <Box sx={{ ...modalStyle }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
            Habilitar Entrega
        </Typography>
        <TextField
            label="Fecha y hora de inicio"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
        />
        <TextField
            label="Fecha y hora de fin"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
        />
        <Button variant="contained" onClick={handleToggleEntrega}>Guardar</Button>
    </Box>
</Modal>



              <Grid container spacing={2} sx={{ padding: { lg: '40px', md: '20px', sm: '20px', xs: '10px' }, marginLeft: { lg: '0px', md: '120px', sm: '50px', xs: '-22px' } }}>
                <Grid item lg={4} md={5} sm={10} xs={11} sx={{ marginLeft: { lg: '0px', md: '0px', sm: '40px', xs: '0.2%' } }}>
                  <Typography component="h2" variant="h6" sx={{ marginTop: 2, textAlign: 'center' }}>
                    Agregar Archivo a Semana
                  </Typography>
                  <Paper sx={{ padding: 2, backgroundColor: 'white', color: 'black', borderRadius: '10px' }}>
                    <Tooltip title={selectedCourseId ? "Selecciona la semana a la que quieres agregar contenido" : "Primero selecciona un curso"} arrow>
                      <Select
                        label="Semana"
                        value={selectedWeekId}
                        onChange={(e) => setSelectedWeekId(e.target.value)}
                        fullWidth
                        margin="normal"
                        displayEmpty
                        disabled={!selectedCourseId}
                      >
                        <MenuItem value="" disabled>Selecciona una semana</MenuItem>
                        {weeks.map((week) => (
                          <MenuItem key={week.id} value={week.id}>
                            {week.semana}
                          </MenuItem>
                        ))}
                      </Select>
                    </Tooltip>
                    <Tooltip title={selectedWeekId ? "Agerga el archivo que quieras " : "Primero selecciona un curso"} arrow>
                      <TextField
                        label="Nombre del Archivo"
                        value={newFileData ? newFileData.nombre_archivo : ''}
                        fullWidth
                        margin="normal"
                        onChange={handleFileNameChange}
                        
                        disabled={!selectedWeekId}
                      />
                    </Tooltip>
                    <input
                      accept=".docx,.pdf,.pptx"
                      style={{ display: 'none' }}
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <Grid sx={{display:{lg:'flex',xs:'block'} , alignItems:'center'}}>
                      <label htmlFor="file-upload">
                        <Button
                          variant="contained"
                          component="span"
                          sx={{
                            mt: 1,
                            backgroundColor: 'black',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'black',
                              opacity: 0.8,
                            },
                          }}
                          disabled={!selectedWeekId}
                        >
                          Seleccionar Archivo
                        </Button>
                      </label>
                      {newFileData && (
                        <Typography sx={{ fontSize:'10px' }}>
                          {newFileData.nombre_archivo}
                        </Typography>
                      )}
                    </Grid>
                    <Button onClick={handleAddFileWithReset} sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}>
                      Subir Archivo
                    </Button>
                  </Paper>
                </Grid>
                <Grid item lg={8} md={12} xs={11} sx={{ alignItems: 'center' }}>
                  <Typography component="h2" variant="h6" sx={{ marginTop: 2, textAlign: 'center' }}>
                    Archivos de la Semana
                  </Typography>
                  <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '270px', backgroundColor: '#0D1A2E', borderRadius: '10px', padding: 2 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', color: 'white', fontSize: '15px' }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Semana ID</th>
                          <th>Nombre del Archivo</th>
                          <th>Archivo</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(files).map(weekId =>
                          files[weekId].map((file) => (
                            <tr key={file.id} style={{ borderBottom: '1px solid #ccc' }}>
                              <td style={{ padding: '8px' }}>{file.id}</td>
                              <td style={{ padding: '8px' }}>{getWeekNameById(file.semana_id)}</td>
                              <td style={{ padding: '8px' }}>{file.nombre_archivo}</td>
                              <td style={{ padding: '8px' }}>
                                <Button
                                  onClick={() => handleDownload(file.archivo, file.nombre_archivo)}
                                  sx={{ color: 'white', backgroundColor: 'blue', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}
                                >
                                  <img src={archivo} alt="Descargar archivo" style={{ height: '1.5rem', width: '1.5rem' }} />
                                </Button>
                              </td>
                              <td style={{ padding: '8px' }}>
                                <Button
                                  onClick={() => handleDeleteFile(file.id, file.semana_id)}
                                  sx={{
                                    backgroundColor: 'red',
                                    color: 'white',
                                    borderRadius: '10px',
                                    height: '2.5rem',
                                    width: '100%',
                                    '&:hover': {
                                      backgroundColor: 'red',
                                      opacity: 0.8,
                                    },
                                  }}
                                >
                                  <img src={basura} alt="Eliminar archivo" style={{ height: '1.5rem', width: '1.5rem' }} />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
      <ToastContainer />

      {/* Modal para editar curso */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            Editar Curso
          </Typography>
          <TextField
            label="Título"
            value={updatedCourseData.title}
            onChange={(e) => setUpdatedCourseData({ ...updatedCourseData, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Introducción"
            value={updatedCourseData.introduction}
            onChange={(e) => setUpdatedCourseData({ ...updatedCourseData, introduction: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Objetivos Específicos"
            value={updatedCourseData.objetivos_especificos}
            onChange={(e) => setUpdatedCourseData({ ...updatedCourseData, objetivos_especificos: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <div>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="contained"
                component="span"
                sx={{
                  mt: 2,
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'black',
                    opacity: 0.8,
                  },
                }}
              >
                Cambiar Imagen
              </Button>
            </label>
            {currentImage && (
              <Box mt={2} textAlign="center">
                <img src={currentImage} alt="Imagen del curso" style={{ maxHeight: '200px', maxWidth: '100%' }} />
              </Box>
            )}
          </div>
          <Button onClick={handleSaveEdit} sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}>
            Guardar Cambios
          </Button>
        </Box>
      </Modal>

      {/* Modal para editar semana */}
      <Modal open={editWeekModalOpen} onClose={() => setEditWeekModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            Editar Semana
          </Typography>
          <TextField
            label="Semana"
            value={updatedWeekData}
            onChange={(e) => setUpdatedWeekData(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button onClick={handleSaveEditWeek} sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}>
            Guardar Cambios
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
};
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default TabletDetailsPage;
