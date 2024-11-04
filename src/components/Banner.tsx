import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface BannerProps {
    imageUrl: string;
    title: string;
}

const Banner: React.FC<BannerProps> = ({ imageUrl, title }) => {
    return (
        <Box
            className="banner-container"
            style={{
                background: `url(${imageUrl}) no-repeat center center`,
                backgroundSize: 'cover', // Asegura que la imagen cubra todo el contenedor
                width: '100vw', // Ancho total de la pantalla
                height: '200px', // Ajusta la altura según sea necesario
                marginBottom: '30px', // Espacio inferior para separar del contenido debajo
            }}
        >
            <Box
                className="banner-overlay"
                
            >
                <Typography variant="h4" component="h1" gutterBottom style={{ fontWeight: 'bold', maxWidth: '80%' }}>
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};

export default Banner;
