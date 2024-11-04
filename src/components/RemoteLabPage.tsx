import React, { useState, useEffect } from 'react';
import './MODELESTILSO.css'; 
import { Grid, CircularProgress, Typography, Modal } from '@mui/material';
import { fetchApiUrls, getApiUrlsWithoutPort } from '../api';

const RemoteLabPage: React.FC = () => {
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [urls, setUrls] = useState<string[]>([]);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const loadUrls = async () => {
            try {
                await fetchApiUrls(); // Carga las IPs desde el servidor
                const baseUrls = getApiUrlsWithoutPort().map(ip => `${ip}:8000/#/workspace`);
                if (baseUrls.length > 0) {
                    setUrls(baseUrls); // Asigna las URLs completas con la ruta
                    setIsLoading(true); // Comienza la carga
                } else {
                    console.error('No se encontraron URLs válidas');
                }
            } catch (error) {
                console.error('Error fetching IPs:', error);
            }
        };
        loadUrls();

        // Verifica si ya se mostró el mensaje de bienvenida en el pasado
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setShowWelcome(true); // Mostrar el mensaje de bienvenida
            const welcomeTimer = setTimeout(() => {
                setShowWelcome(false); // Oculta el mensaje después de 15 segundos
                localStorage.setItem('hasSeenWelcome', 'true'); // Marca que ya se mostró el mensaje
                window.location.href = '/tablet/#/workscape'; // Redirige a la nueva ruta
            }, 15000); // 15 segundos

            return () => clearTimeout(welcomeTimer); // Limpia el temporizador al desmontar el componente
        }
    }, []); // Ejecutar solo cuando se monta el componente

    useEffect(() => {
        if (isLoading && urls.length > 0) {
            const timer = setTimeout(() => {
                setCurrentUrlIndex(prevIndex => (prevIndex + 1) % urls.length);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentUrlIndex, isLoading, urls]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(true);
        setCurrentUrlIndex(prevIndex => (prevIndex + 1) % urls.length);
    };

    const getCurrentUrl = () => {
        if (urls.length === 0) {
            return ''; // Evita que intente cargar si no hay URLs disponibles
        }
        return urls[currentUrlIndex];
    };

    return (
        <Grid sx={{ width: '100%', marginLeft: { lg: '20px', sm: '-3%', md: '40px', xs: '-3%' } }}>
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
                {isLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <CircularProgress />
                        <Typography variant="h6" sx={{ mt: 2 , color: 'white'}}>Cargando...</Typography>
                    </div>
                )}
                <iframe 
                    src={getCurrentUrl()}
                    style={{ 
                        border: 'none', 
                        width: '93.7%', 
                        height: '100%', 
                        marginLeft: '6.3%', 
                        position: 'relative',
                        top: 0, 
                        left: 0,
                        display: isLoading ? 'none' : 'block'
                    }}
                    title="Remote Lab"
                    onLoad={handleLoad}
                    onError={handleError}
                />

                {/* Modal para el mensaje de bienvenida */}
                  {/* Modal para el mensaje de bienvenida */}
                  <Modal
                    open={showWelcome}
                    onClose={() => setShowWelcome(false)}
                    aria-labelledby="welcome-modal"
                    aria-describedby="welcome-modal-description"
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        top: 0, // Que ocupe desde la parte superior
                        left: 0, // Que ocupe desde la parte izquierda
                        width: '100vw', // Que cubra todo el ancho de la pantalla
                        height: '100vh', // Que cubra todo el alto de la pantalla
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden', // Para asegurar que el video cubra toda la pantalla
                    }}>
                        {/* Video de fondo */}
                        <video 
                            autoPlay 
                            muted 
                            loop 
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                zIndex: -1 // Asegúrate de que el video esté detrás del contenido
                            }}
                        >
                            <source src="../../public/img/lab2.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        <Typography id="welcome-modal-description" variant="h6" style={{ color: 'white', textShadow: '0px 0px 10px rgba(0, 0, 0, 0.7)' }}>
                            ¡Bienvenido al Laboratorio Remoto!
                        </Typography>
                    </div>
                </Modal>
            </div>
        </Grid>      
    );
};

export default RemoteLabPage;
