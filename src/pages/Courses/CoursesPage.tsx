import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Container, Row, Col } from 'react-bootstrap';
import LoadingSpinner from '../../components/LoadingSpinner';
import Typography from '@mui/material/Typography';
import { getCourses, addCourse, updateCourse, deleteCourse } from '../../api';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import './Style.css';
import Divider from '@mui/material/Divider';
import ModalComponent from '../../components/ModalComponent';
import IPModal from '../../components/IPModal'; 
import { useAuth } from '../../pages/Auth/AuthContext';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import editar from '../../../public/img/editar.png';
import basura from '../../../public/img/bote-de-basura.png';
import TextField from '@mui/material/TextField';

interface Course {
    id: number;
    title: string;
    image: string;
}



const CoursesPage: React.FC<Props> = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openIPModal, setOpenIPModal] = useState<boolean>(false); 
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [ips, setIps] = useState<string[]>([]);
    
    // Estados para el modal de agregar curso
    const [openAddCourseModal, setOpenAddCourseModal] = useState<boolean>(false);
    const [newCourseData, setNewCourseData] = useState({
        title: '',
        introduction: '',
        objetivos_especificos: '',
        image: ''
    });

    // Estados para el modal de editar curso
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
    const [updatedCourseData, setUpdatedCourseData] = useState({
        title: '',
        introduction: '',
        objetivos_especificos: '',
        image: ''
    });

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

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUpdatedCourseData({ ...updatedCourseData, image: reader.result.split(',')[1] });
            };
            reader.readAsDataURL(file);
        }
    };

    

    const handleAddNewCourseWithReset = async () => {
        if (!newCourseData.title || !newCourseData.introduction || !newCourseData.objetivos_especificos || !newCourseData.image) {
            alert('Todos los campos deben estar llenos para agregar un curso.');
            return;
        }
        try {
            await addCourse(newCourseData);
            const updatedCourses = await getCourses();
            setCourses(updatedCourses);
            setNewCourseData({ title: '', introduction: '', objetivos_especificos: '', image: '' });
            setOpenAddCourseModal(false);
        } catch (error) {
            console.error('Error adding course:', error);
        }
    };

    const handleSaveEdit = async () => {
        if (courseToEdit) {
            try {
                await updateCourse(courseToEdit.id, updatedCourseData);
                const updatedCourses = await getCourses();
                setCourses(updatedCourses);
                setEditModalOpen(false);
            } catch (error) {
                console.error('Error updating course:', error);
            }
        }
    };

    const handleEditCourse = (course: Course) => {
        setCourseToEdit(course);
        setUpdatedCourseData({
            title: course.title,
            introduction: course.introduction,
            objetivos_especificos: course.objetivos_especificos,
            image: course.image
        });
        setEditModalOpen(true);
    };

    const handleDeleteCourse = async (courseId: number) => {
        const confirmDelete = window.confirm('¿Seguro que quieres eliminar este curso?');
        if (!confirmDelete) {
            return;
        }
        try {
            await deleteCourse(courseId);
            setCourses(courses.filter(course => course.id !== courseId));
            alert('Curso eliminado correctamente.');
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error al eliminar el curso.');
        }
    };

    const { user } = useAuth(); 

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getCourses();
                setCourses(response);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setLoading(false);
            }
        };

      
        fetchCourses();
    }, []);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    
    // Then you can handle different screen sizes more granularly
    const containerStyle = {
        marginLeft: {
            xs: '8px',  // Extra small screens
            sm: '16px', // Small screens
            md: '32px', // Medium screens
            lg: '70px', // Large screens
        },
        marginTop: {
            xs: '24px',
            sm: '35px',
            md: '45px',
        },
        width: '100%', // Ensure container takes full width
        maxWidth: isLargeScreen ? '1300px' : '100%', // Control maximum width
    };
    

    
    const innerContainerStyle = {
        overflowX: 'auto', // Always allow horizontal scroll if needed
        padding: {
            xs: '16px', // Small screens
            md: '24px', // Medium screens
            lg: '32px 100px', // Large screens
        },
        width: '100%',
    };
    

    const handleOpenModal = () => {
        let videos: string[] = [];
    
        if (user.role === 'admin') {
            videos = ["/img/docente.mp4"];
        } else if (user.role === 'user') {
            videos = ["/img/estudiante.mp4"];
        } 
    
        videos.push("/img/estudiante.mp4");
        setSelectedVideos(videos);
        setOpenModal(true);
    };

    const handleOpenIPModal = () => {
        setOpenIPModal(true);
    };

    const handleCloseIPModal = () => {
        setOpenIPModal(false);
    };

    const handleOpenAddCourseModal = () => {
        setOpenAddCourseModal(true);
    };
    
    const handleCloseAddCourseModal = () => {
        setOpenAddCourseModal(false);
    };
    
    return (
        <Container>
        {loading ? (
            <LoadingSpinner />
        ) : (
            <Grid sx={{marginLeft: {lg: '130px', md:'50px' },marginRight: {lg: '10px' }, marginTop: {xs: '74px',sm: '85px',md: '45px',lg: '10px'},height:'100vh', width:'100wh'}}>
            <Grid 
                sx={{ 
                    display:'flex',
                    alignItems:'center',
                    justifyContent: {lg:'space-between',sm:'space-around'},

                }}
            >
                <Grid item xs={12} sx={{display: { xs: 'none', md: 'block', sm:'flex' }  }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ color: 'white',fontWeight: 'bold', textTransform: 'uppercase'}}
                    >
                        CURSOS
                    </Typography>
                </Grid>

                <Grid 
                sx={{

                    display:'flex',
                    textAlign:'center'

                }}
                >
                    <Box
                        sx={{
                            marginRight: { xs: '5px', md: '10px' },
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            color: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                        }}
                        component={Link}
                        to={`/malla/`}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}
                        >
                            Malla curicular
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            marginRight: { xs: '5px', md: '10px' }, 
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            color: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                        }}
                        onClick={handleOpenModal}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}
                        >
                            Guía de Plataforma
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            marginRight: { xs: '5px', md: '10px' }, 
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            color: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                        }}
                        onClick={handleOpenIPModal}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}
                        >
                            Ver IPs
                        </Typography>
                    </Box>

                </Grid>
            </Grid>

            <Grid sx={{width:'100%', padding:{lg:'10px', xs:'10px'},    display: 'flex', justifyContent: 'flex-end',}}>
                {user?.role === 'admin' && (
                    <Box
                        variant="contained"
                        sx={{
                            width:{lg:'100px',xs:'100px'},
                            marginLeft:{lg:'0px',xs:'10px',md:'40px'},
                            marginRight: { xs: '5px', md: '12%',lg:'0px' },
                            backgroundColor: 'rgba(123, 178, 40, 0.5)',
                            color: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(123, 178, 40, 0.7)',
                            },
                        }}
                        onClick={handleOpenAddCourseModal}
                    >
                        <Typography 
                        variant="h5" 
                        sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}
                        >
                        Agregar Curso
                        </Typography>
                        
                    </Box>
                )}
            </Grid>
                    <Row className="justify-content-center">
                        <Col xs={12} md={12}>
                            <Grid container spacing={2} justifyContent="center">
                                {courses.map((course) => (
                                    <Grid item key={course.id} xs={10} sm={10} md={7} lg={4}>
                                        <div style={{ position: 'relative', textAlign: 'center', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#1C1C1C' }}>
                                            <img src={`data:image/jpeg;base64,${course.image}`} alt={course.title} style={{ width: '100%', height: '100%', maxHeight: '330px', minHeight:'330px', objectFit: 'cover', filter: 'brightness(0.7)' }} />
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: 'white',
                                            }}>
                                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', position:'absolute',textTransform: 'uppercase', }}>
                                                    {course.title}
                                                </Typography>
                                                <Box
                                                    component={Link}
                                                    to={`/course/${course.id}`}
                                                    state={{ title: course.title, image: course.image }}
                                                    variant="contained"
                                                    sx={{
                                                        textDecoration: 'none',
                                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                        color: 'black',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '-10px',
                                                        height: '100%',
                                                        width: '100%',
                                                        transition: 'background-color 0.3s ease', // Transición suave
                                                        '&:hover': {
                                                          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Atenúa el fondo al hacer hover
                                                        },
                                                    }}
                                                    >
                                                </Box>
                                                {user?.role === 'admin' && (
                                                    <> <Box sx={{position: 'absolute', top: 0, right: 0,}}> 
                                                        <Button
                                                            onClick={() => handleEditCourse(course)}
                                                            style={{
                                                                marginTop: '10px',
                                                                marginRight:'5px',
                                                                backgroundColor: 'rgb(33, 150, 243, 0.5)',
                                                                color: 'white',
                                                                borderRadius: '10px',
                                                                padding: '8px 16px',
                                                                textDecoration: 'none',
                                                                fontSize: '13px',
                                                                transition: 'background-color 0.3s ease',
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.5)'}
                                                            >
                                                            <img src={editar} alt="editar curso" style={{ height: '1.5rem', width: '1.5rem' }} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteCourse(course.id)}
                                                            style={{
                                                                marginTop: '10px',
                                                                marginRight:'10px',
                                                                backgroundColor: 'rgb(255,0,0,0.5)',
                                                                color: 'white',
                                                                borderRadius: '10px',
                                                                padding: '8px 16px',
                                                                textDecoration: 'none',
                                                                fontSize: '13px',
                                                            }}
                                                            
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.5)'}
                                                            >
                                                            <img src={basura} alt="eliminar curso" style={{ height: '1.5rem', width: '1.5rem' }} />
                                                        </Button>
                                                    </Box>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Grid>
                                ))}
                            </Grid>
                        </Col>
                    </Row>
            </Grid>
        )}

            {/* Modal para agregar curso */}
            <Modal
                open={openAddCourseModal}
                onClose={handleCloseAddCourseModal}
                aria-labelledby="modal-add-course-title"
                aria-describedby="modal-add-course-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="modal-add-course-title" variant="h6" component="h2">
                        Agregar Nuevo Curso
                    </Typography>
                    <Box sx={{ padding: 2, backgroundColor: 'white', color: 'black', borderRadius: '10px' }}>
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
                        {user?.role === 'admin' && (

                        <Button onClick={handleAddNewCourseWithReset} sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}>
                            Agregar Curso
                        </Button>
                        )}

                    </Box>
                </Box>
            </Modal>

            {/* Modal para editar curso */}
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <Box sx={{ ...modalStyle, maxWidth: 500 }}>
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
                            id="edit-raised-button-file"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="edit-raised-button-file">
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
                        {updatedCourseData.image && (
                            <Box mt={2} textAlign="center">
                                <img src={`data:image/jpeg;base64,${updatedCourseData.image}`} alt="Imagen del curso" style={{ maxHeight: '200px', maxWidth: '100%' }} />
                            </Box>
                        )}
                    </div>
                    <Button onClick={handleSaveEdit} sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'black', opacity: 0.8 } }}>
                        Guardar Cambios
                    </Button>
                </Box>
            </Modal>

            <ModalComponent open={openModal} onClose={() => setOpenModal(false)} videos={selectedVideos} />
            <IPModal open={openIPModal} onClose={handleCloseIPModal} ips={ips} />
            
            <Divider sx={{ borderColor: 'white', my: 2, mt:52 }} />
            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom:'5px' }}>
                <p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/" style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                    <a property="dct:title" rel="cc:attributionURL" href="https://github.com/danielramirez611/IMAYINER.git">IMAYINER-PROYECT-E-LEARNING</a> de 
                    <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="mailto:imayinerproject@gmail.com"> Imayiner Project EIRL </a> tiene licencia <a></a> 
                    <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style={{ marginLeft: '5px' }}>
                        <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" />
                        <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" />
                        <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" />
                    </a> 
                    <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
                        Reconocimiento-NoComercial 4.0 Internacional 
                    </a>.
                </p>
            </div>
        </Container>
    );
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default CoursesPage;
