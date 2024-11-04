import React from 'react';
import { Container, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Malla: React.FC = () => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/malla.pdf'; // Ruta al documento PDF
        link.download = 'MallaCurricular.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                <Grid
                    item
                    xs={12}
                    md="auto"
                    sx={{
                        display: 'flex',
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        textAlign: { xs: 'center', md: 'left' },
                        marginTop: {xs:'30px', md:'0px',sm:'40px', lg:'0px'},
                        marginLeft: {md:'80px', sm:'0px', xs:'0px'}
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            color: 'white',
                            fontFamily: 'Roboto Slab',
                            mt: { xs: 1, md: 0 },
                        }}
                    >
                        Malla curricular
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={12}
                    md="auto"
                    sx={{
                        display: 'flex',
                        justifyContent: { xs: 'center', md: 'flex-end' },
                        mt: { xs: 2, md: 0 },
                    }}
                >
                    <Button
                        component={Link}
                        to="/courses"
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            backgroundColor: '#E93845',
                            '&:hover': { backgroundColor: '#D32F2F' },
                        }}
                    >
                        Volver
                    </Button>
                </Grid>
            </Grid>
            <Grid container justifyContent="center" sx={{ mt: 4 }}>
                <Grid item xs={12} md={9} lg={8}>
                    <img
                        src="/img/malla.jpg"
                        alt="Malla curricular"
                        style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }}
                    />
                </Grid>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" sx={{ mb: 4 }}>
                <Grid item>
                    <Button
                        onClick={handleDownload}
                        variant="contained"
                        sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#388E3C' }, display: 'flex', alignItems: 'center' }}
                    >
                        <span style={{ fontWeight: 'bold' }}>Descargar Malla</span>
                        <img src="/img/downlaod.png" alt="Descargar" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Malla;
