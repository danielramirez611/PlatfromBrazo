import React, { useState, useEffect } from 'react';
import { fetchApiUrls, getApiUrlsWithDynamicPort, requestPortC, releasePortC } from '../api';
import { Grid, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../pages/Auth/AuthContext';

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 2000) => {
    return Promise.race([
        fetch(url, options),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
        ),
    ]);
};

const ArduinoLab: React.FC = () => {
    const { user, logout } = useAuth();
    const [assignedPort, setAssignedPort] = useState<number | null>(null);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [urlsWithDynamicPort, setUrlsWithDynamicPort] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Obtener URLs y puertos dinámicos
    useEffect(() => {
        const loadUrls = async () => {
            try {
                await fetchApiUrls();
                const urls = getApiUrlsWithDynamicPort();
                setUrlsWithDynamicPort(urls);
                if (urls.length === 0) {
                    setErrorMsg('No se encontraron URLs válidas con puertos dinámicos');
                }
            } catch (error) {
                console.error('Error fetching IPs:', error);
                setErrorMsg('Error al obtener las URLs');
            }
        };
        loadUrls();
    }, []);

    // Solicitar y liberar el puerto
    useEffect(() => {
        if (!user) return;

        const assignPort = async () => {
            try {
                const port = await requestPortC(user.id);
                setAssignedPort(port);
                console.log(`Puerto asignado: ${port}`);
            } catch (error) {
                console.error('Error asignando puerto:', error);
                setErrorMsg('Error al asignar el puerto');
            }
        };

        assignPort();

        const handleUnload = async () => {
            try {
                await releasePortC(user.id);
                console.log('Puerto liberado');
            } catch (error) {
                console.error('Error al liberar el puerto:', error);
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            handleUnload();
        };
    }, [user]);

    // Probar URL y rotar entre ellas
    useEffect(() => {
        if (urlsWithDynamicPort.length > 0 && !isLoaded) {
            const testUrl = async () => {
                const currentUrl = getCurrentUrl();
                try {
                    const response = await fetchWithTimeout(currentUrl, { method: 'HEAD', mode: 'no-cors' }, 2000);
                    if (response.ok || response.type === 'opaque') {
                        setIsLoaded(true);
                        setIsLoading(false);
                    } else {
                        throw new Error('URL no accesible');
                    }
                } catch (error) {
                    console.warn('Error probando la URL:', currentUrl, error);
                    setCurrentUrlIndex(prevIndex => (prevIndex + 1) % urlsWithDynamicPort.length);
                    setIsLoaded(false);
                    setIsLoading(true);
                }
            };

            testUrl();
        }
    }, [currentUrlIndex, urlsWithDynamicPort, isLoaded]);

    // Obtener URL actual
    const getCurrentUrl = () => {
        if (urlsWithDynamicPort.length > 0 && assignedPort) {
            let currentIp = urlsWithDynamicPort[currentUrlIndex];
            currentIp = currentIp.replace('http://', '').split(':')[0]; // Limpiar la IP
            return `http://${currentIp}:${assignedPort}`;
        }
        return '';
    };

    const getCurrentPort = () => {
        return assignedPort || 'Desconocido';
    };

    // Estilos para mejorar la experiencia en dispositivos móviles y pantallas grandes
    const containerStyles = {
        width: '100%',
        height: '100vh',
        overflow: 'auto',
        color: 'white',
        marginTop: '60px',

        justifyContent: 'center',
        padding: '16px',
    };

    const iframeStyles = {
        border: 'none',
        width: '100%',
        height: '90vh', // Incrementar la altura en móviles para que ocupe casi toda la pantalla
        display: isLoading ? 'none' : 'block',
        overflow: 'hidden',
        boxSizing: 'border-box',
        maxWidth: '100vw',
        maxHeight: '100vh',
    };

    const portStyles = {
        fontSize: '1rem',
        textAlign: 'center',
        marginTop: '20px',
        color: 'white',
    };

    const titleStyles = {
        textAlign: 'center',
        fontSize: { xs: '1.2rem', md: '1.5rem' }, // Cambiar el tamaño de la fuente según el tamaño de la pantalla
        color: 'white',
    };

    return (
        <Grid container sx={containerStyles}>
            <Grid
                item
                xs={12}
                md={8} // Pantallas medianas (tabletas)
                lg={10} // Pantallas grandes (PC)
                xl={11} // Pantallas muy grandes
                sx={{ width: '100%', height: { xs: '90vh', md: '100%' }, paddingLeft: { md: '4%', xs: '0' }, boxSizing: 'border-box' }}
            >
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <CircularProgress />
                            <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>Cargando...</Typography>
                        </div>
                    ) : errorMsg ? (
                        <Typography variant="body1" sx={{ mt: 2, color: 'red' }}>{errorMsg}</Typography>
                    ) : (
                        <iframe
                            src={getCurrentUrl()}
                            style={iframeStyles}
                            title="Arduino Lab"
                            onLoad={() => setIsLoaded(true)}
                            onError={(e) => {
                                setIsLoaded(false);
                                setIsLoading(true);
                                console.error('Error al cargar el contenido del iframe:', e);
                            }}
                        />
                    )}
                </div>
            </Grid>

            {/* Mostrar el puerto que se está utilizando */}
            <Grid item xs={12} sx={portStyles}>
                <Typography variant="h6">
                    Usando el puerto: {getCurrentPort()}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default ArduinoLab;
