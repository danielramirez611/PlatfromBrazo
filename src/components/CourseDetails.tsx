import React, { useEffect, useState } from 'react';
import { Container, Grid, Button, Divider, Typography, Box } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
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

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courses = await getCourses();
        const course = courses.find((c) => c.id.toString() === id);
        setCourseInfo(course ? { introduction: course.introduction, objetivos_especificos: course.objetivos_especificos } : null);
        
        const contents = await getCourseContent(id, user?.role);
        setCourseContents(contents);  
      } catch (error) {
        toast.error('Error loading course data');
      }
    };
    fetchCourseData();
  }, [id, user]);

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CourseHeader title={location.state?.title || 'Curso no encontrado'} image={location.state?.image || ''} />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', gap: '10px', justifyContent: 'space-around' }}>
          <Button variant="contained" onClick={() => setIntroductionOpen(true)}>Ver Introducción</Button>
          <Button variant="contained" onClick={() => setObjectivesOpen(true)}>Ver Objetivos Específicos</Button>
          <CourseIntroductionModal open={introductionOpen} onClose={() => setIntroductionOpen(false)} introduction={courseInfo?.introduction || ''} />
          <CourseObjectivesModal open={objectivesOpen} onClose={() => setObjectivesOpen(false)} objectives={courseInfo?.objetivos_especificos || ''} />
        </Grid>
        <Grid item xs={12}>
          <CourseContent courseContents={courseContents} userRole={user?.role || ''} />
        </Grid>
      </Grid>
      <ToastContainer />

      {/* Bloque de Copyright */}
      <Divider sx={{ borderColor: 'white', my: 2}} />
      <Box sx={{ textAlign: 'center', marginTop: '20px', marginBottom: '5px' }}>
        <Typography component="p" sx={{ margin: 0, fontSize: '14px', color: '#555' }}>
          <a property="dct:title" rel="cc:attributionURL" href="https://github.com/danielramirez611/IMAYINER.git">
            IMAYINER-PROYECT-E-LEARNING
          </a> de
          <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="mailto:imayinerproject@gmail.com">
            {' '}Imayiner Project EIRL
          </a> tiene licencia 
          <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style={{ marginLeft: '5px' }}>
            <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="CC" />
            <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="BY" />
            <img style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '5px' }} src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt="NC" />
          </a> 
          <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>
            Reconocimiento-NoComercial 4.0 Internacional
          </a>.
        </Typography>
      </Box>
    </Container>
  );
};

export default CourseDetail;
