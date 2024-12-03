import React, { useEffect, useState } from 'react';
import {
  Container, 
  Grid, 
  Button, 
  Divider, 
  Typography, 
  Box, 
  useMediaQuery, 
  IconButton 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useLocation } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import CourseHeader from './CourseHeader';
import CourseIntroductionModal from './CourseIntroductionModal';
import CourseObjectivesModal from './CourseObjectivesModal';
import CourseContent from './CourseContent';
import { useAuth } from '../pages/Auth/AuthContext';
import { getCourses, getCourseContent } from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation<{ title: string, image: string }>();
  const [courseInfo, setCourseInfo] = useState<{ introduction: string; objetivos_especificos: string } | null>(null);
  const [courseContents, setCourseContents] = useState([]);
  const [introductionOpen, setIntroductionOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Puedes ajustar el breakpoint según tus necesidades

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courses = await getCourses();
        const course = courses.find((c) => c.id.toString() === id);
        setCourseInfo(course ? { introduction: course.introduction, objetivos_especificos: course.objetivos_especificos } : null);
        
        const contents = await getCourseContent(id, user?.role);
        setCourseContents(contents);  
      } catch (error) {
        toast.error('Error al cargar los datos del curso');
      }
    };
    fetchCourseData();
  }, [id, user]);

  return (
    <Grid  sx={{ minHeight: '100vh', width: {xs: '100%',sm: '98%',md: '98%',lg: '85%',xl: '89%'}, display: 'flex', flexDirection: 'column',marginLeft: { xs: '0%', sm: '0%', md: '0%', lg: '11%', xl: '10%', }, padding:{ xs: '0%', sm: '0%', md: '0%', lg: '0%', xl: '0%', }, marginTop:{ xs: '5%', sm: '5%', md: '5%', lg: '1%', xl: '1%', } }}>
      <Grid
        container
        spacing={4}
        sx={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        {/* Columna Izquierda: CourseHeader y Contenido */}
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CourseHeader
            title={location.state?.title || 'Curso no encontrado'}
            image={location.state?.image || ''}
          />
          <Grid sx={{display:{xs:'flex',md:'block'}, padding:{xs:'15px',md:'0px'}}}>
            {/* Introducción */}
            <Box>
              <Typography variant="h5" sx={{ marginBottom: 2, textAlign:'left',color: '#FFF', display:{xs:'none',md:'block', } }}>
                Introducción
              </Typography>
              {isSmallScreen ? (
                <Grid sx={{padding:'5px'}}>
                  <Button variant="contained" onClick={() => setIntroductionOpen(true)}>Ver Introducción</Button>
                </Grid>  
                
              ) : (
                <Typography variant="body1" sx={{ marginBottom: 2, fontSize: '1em',maxHeight:'100px',overflowY:'auto' ,textAlign:'left', color: '#FFF' }}>
                  {courseInfo?.introduction || 'No hay introducción disponible.'}
                </Typography>
              )}
            </Box>
            {/* Objetivos Específicos */}
            <Box>
              <Typography variant="h5" sx={{ marginBottom: 2, textAlign:'left',display:{xs:'none',md:'block', color: '#FFF'} }}>
                Objetivos Específicos
              </Typography>
              {isSmallScreen ? (  
                <Grid sx={{padding:'5px'}}>
                  <Button variant="contained" onClick={() => setObjectivesOpen(true)}>Ver Objetivos Específicos</Button>
                </Grid>
              ) : (
                <Typography variant="body1" sx={{ marginBottom: 2, fontSize: '1em',maxHeight:'100px',overflowY:'auto', textAlign:'left' , color: '#FFF'}}>
                  {courseInfo?.objetivos_especificos || 'No hay objetivos específicos disponibles.'}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Columna Derecha: CourseContent */}
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            
          }}
        >
          <CourseContent 
            courseContents={courseContents} 
            userRole={user?.role || ''} 
            courseId={id || ''} // Pasa el id del curso aquí
          />
        </Grid>
      </Grid>

      <ToastContainer />

      {/* Bloque de Copyright */}
      <Divider sx={{ borderColor: 'white', my: 2 }} />
      <Box sx={{ textAlign: 'center', my: 2 }}>
        <Typography
          component="p"
          sx={{ margin: 0, fontSize: '14px', color: '#555' }}
        >
          <a
            property="dct:title"
            rel="cc:attributionURL"
            href="https://github.com/danielramirez611/IMAYINER.git"
            style={{ color: '#555', textDecoration: 'none' }}
          >
            IMAYINER-PROYECT-E-LEARNING
          </a>{' '}
          de{' '}
          <a
            rel="cc:attributionURL dct:creator"
            property="cc:attributionName"
            href="mailto:imayinerproject@gmail.com"
            style={{ color: '#555', textDecoration: 'none' }}
          >
            Imayiner Project EIRL
          </a>{' '}
          tiene licencia{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1"
            target="_blank"
            rel="license noopener noreferrer"
            style={{ marginLeft: '5px', color: '#555', textDecoration: 'none' }}
          >
            <img
              style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}
              src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
              alt="CC"
            />
            <img
              style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}
              src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"
              alt="BY"
            />
            <img
              style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }}
              src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1"
              alt="NC"
            />
          </a>{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1"
            target="_blank"
            rel="license noopener noreferrer"
            style={{ color: '#555', textDecoration: 'none' }}
          >
            Reconocimiento-NoComercial 4.0 Internacional
          </a>
          .
        </Typography>
      </Box>
          
      {/* Modales */}
      
      <CourseIntroductionModal open={introductionOpen} onClose={() => setIntroductionOpen(false)} introduction={courseInfo?.introduction || ''} />
      <CourseObjectivesModal open={objectivesOpen} onClose={() => setObjectivesOpen(false)} objectives={courseInfo?.objetivos_especificos || ''} />
    </Grid>
  );
};

export default CourseDetail;
