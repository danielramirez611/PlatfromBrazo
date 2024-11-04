import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface BannerProps {
    imageUrl: string;
    title: string;
}

const Banner2: React.FC<BannerProps> = ({ imageUrl, title }) => {
    return (
        <Box
            className="banner-container"
            style={{
                background: `url(${imageUrl}) no-repeat center center`,
                backgroundSize: 'cover', // Asegura que la imagen cubra todo el contenedor
                width: '100%', // Ancho total de la pantalla
                height: '30vh', // Altura flexible según el tamaño de la ventana
                maxHeight: '200px', // Altura máxima
                position: 'relative',
                marginBottom: '20px', // Espacio inferior para separar del contenido debajo
            }}
        >
            <Box
                className="banner-overlay"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end', // Alinear a la derecha
                    textAlign: 'right', // Alineación de texto a la derecha
                    color: 'white',
                    padding: '20px',
                    overflowWrap: 'break-word', // Permite dividir palabras largas
                    wordWrap: 'break-word', // Permite dividir palabras largas
                }}
            >
                 <Typography variant="h4" component="h1" gutterBottom style={{ fontWeight: 'bold', maxWidth: '80%' }}>
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};

export default Banner2;
