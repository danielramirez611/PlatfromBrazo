import React, { useState, useEffect } from 'react';
import { fetchApiUrls, getApiUrlsWithDynamicPort, requestPort, releasePort, fetchArduinoCodes } from '../api';
import { Grid, CircularProgress, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { useAuth } from '../pages/Auth/AuthContext';
import ArduinoFileTable from './ArduinoFileTable';

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 2000) => {
    return Promise.race([
        fetch(url, options),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
        )
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
    const [codes, setCodes] = useState<any[]>([]); // Lista de códigos de Arduino
    const [selectedCode, setSelectedCode] = useState<any>(null); // Código seleccionado
    const [copied, setCopied] = useState<boolean>(false); // Estado para manejar el copiado

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

    useEffect(() => {
        if (!user) return;

        const assignPort = async () => {
            try {
                const port = await requestPort(user.id);
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
                await releasePort(user.id);
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

    useEffect(() => {
        const loadArduinoCodes = async () => {
            try {
                const fetchedCodes = await fetchArduinoCodes();
                setCodes(fetchedCodes);
            } catch (error) {
                console.error('Error fetching codes:', error);
            }
        };
        loadArduinoCodes();
    }, []);

    const getCurrentUrl = () => {
        if (urlsWithDynamicPort.length > 0 && assignedPort) {
            let currentIp = urlsWithDynamicPort[currentUrlIndex];

            if (currentIp.includes('http://')) {
                currentIp = currentIp.replace('http://', '');
            }

            if (currentIp.includes(':')) {
                currentIp = currentIp.split(':')[0];
            }

            const currentUrl = `http://${currentIp}:${assignedPort}`;
            console.log('Generated URL:', currentUrl);
            return currentUrl;
        }
        return '';
    };

    const getCurrentPort = () => {
        return assignedPort || 'Desconocido';
    };

    const handleSelectChange = (event: any) => {
        const selectedId = event.target.value;
        const selected = codes.find(code => code.id === selectedId);
        setSelectedCode(selected);
    };

    const handleCopy = () => {
        if (selectedCode && selectedCode.code) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selectedCode.code)
                    .then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    })
                    .catch(err => {
                        console.error("Error al copiar el código: ", err);
                    });
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = selectedCode.code;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    console.log('Código copiado con execCommand');
                } catch (err) {
                    console.error('Error al copiar el código con execCommand: ', err);
                }
                document.body.removeChild(textArea);
            }
        } else {
            console.error("No se ha seleccionado ningún código o el código está vacío.");
        }
    };

    const handleLogout = async () => {
        try {
            await releasePort(user.id);
            console.log('Puerto liberado al cerrar sesión');
            logout();
        } catch (error) {
            console.error('Error liberando puerto en el cierre de sesión:', error);
        }
    };

    return (
        <Grid container sx={{ width: '100%', height: '100vh', overflow: 'auto', color: 'white', justifyContent: 'center' }} spacing={2}>
            <Grid item xs={12} md={12} sx={{ width: {xs:'100%', md:'94%'}, height:'100%' , overflow: 'auto', whiteSpace: 'nowrap', boxSizing: 'border-box', marginTop: { xs: '15%', md: '0' }, marginLeft:{xs:'0%', md:'6%'} }}>
                <div style={{ width: '100%', height: '100%', position: 'relative'}}>
                    {isLoading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <CircularProgress />
                            <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>Cargando...</Typography>
                        </div>
                    )}
                    {!isLoading && errorMsg && (
                        <Typography variant="body1" sx={{ mt: 2, color: 'red' }}>{errorMsg}</Typography>
                    )}
                    <iframe
                        src={getCurrentUrl()}
                        style={{
                            border: 'none',
                            width: '100%',
                            height: '100%',
                            display: isLoading ? 'none' : 'block',
                            overflow: 'hidden',
                            boxSizing: 'border-box'
                        }}
                        title="Arduino Lab"
                        onLoad={() => {
                            setIsLoaded(true);
                            setIsLoading(false);
                        }}
                        onError={(e) => {
                            setIsLoaded(false);
                            setIsLoading(true);
                            console.error('Error al cargar el contenido del iframe:', e);
                        }}
                        className="hidden-scrollbar"
                    />
                </div>
            </Grid>
            <Grid sx={{ textAlign: 'center', marginTop: '20px', position:'absolute', top:'0', zIndex:'2' }}>
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                    Usando el puerto: {getCurrentPort()}
                                </Typography>
            </Grid>

        </Grid>
    );
};

export default ArduinoLab;
