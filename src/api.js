import axios from 'axios';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'; // Habilita cualquier origen

let apiUrlsWithPort = [];
let apiUrlsWithoutPort = [];
let ipsVerData = [];
let apiUrlsWithDynamicPort = []; // Para almacenar URLs con puertos dinámicos

export const fetchIpsVer = async () => {
  try {
    const response = await axios.get('/ips-ver');
    console.log('Received IPs from /ips-ver:', response.data);

    if (response.data && Array.isArray(response.data.ips)) {
      ipsVerData = response.data.ips.map(ip => ({
        baseAddress: ip.address,  // IP sin el puerto y endpoint
        fullAddress: `${ip.address}:5000/ips-ver`,  // URL completa para la verificación
        networkName: ip.networkName,  // Nombre de la red (Ethernet o WiFi)
        isCurrent: ip.isCurrent,
        deviceName: ip.isRaspberryPi ? 'Raspberry Pi' : 'Otro dispositivo'
      }));
    } else {
      console.error('Invalid IPs response:', response.data);
    }
  } catch (error) {
    console.error('Error fetching IPs from /ips-ver:', error);
  }
};

export const getIpsVerData = () => {
  return ipsVerData;
};

// Solicitar un puerto cuando un usuario acceda al Codigo Lab
export const requestPortC = async (userId) => {
  try {
    const response = await axios.post('/assign-portC', { userId });
    if (response.data.success) {
      return response.data.port;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error requesting port:', error);
    throw error;
  }
};

export const releasePortC = async (userId) => {
  try {
    await axios.post('/release-portC', { userId });
    console.log('Puerto liberado');
  } catch (error) {
    console.error('Error releasing port:', error);
  }
};
// Solicitar un puerto cuando un usuario acceda al Arduino Lab
export const requestPort = async (userId) => {
  try {
    const response = await axios.post(`/assign-port`, { userId });
    if (response.data.success) {
      return response.data.port;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error requesting port:', error);
    throw error;
  }
};

export const releasePort = async (userId) => {
  try {
    await axios.post(`/release-port`, { userId });
    console.log('Puerto liberado');
  } catch (error) {
    console.error('Error releasing port:', error);
  }
};

// Función para obtener las URLs con puertos dinámicos
export const fetchApiUrls = async () => {
  try {
    const response = await axios.get('/my-ips');
    console.log('Received IPs response:', response.data);

    if (response.data && Array.isArray(response.data.ips)) {
      // Filtrar solo las IPs válidas en el rango deseado, aquí se usa 192.168.x.x como ejemplo
      const validIps = response.data.ips.filter(ip => {
        return ip.address.startsWith('192.168') || ip.address.startsWith('10.');
      });

      // URLs con puerto 5000
      apiUrlsWithPort = validIps.map(ip => `http://${ip.address}:5000`);

      // Manejo de puertos dinámicos (si hay múltiples puertos)
      apiUrlsWithDynamicPort = validIps.flatMap(ip => 
        ip.ports.map(port => `http://${ip.address}:${port}`) // Genera una URL por cada puerto
      );

      apiUrlsWithoutPort = validIps.map(ip => `http://${ip.address}`);
      console.log('Filtered valid IPs with dynamic ports URLs:', apiUrlsWithDynamicPort);
    } else {
      console.error('Invalid IPs response:', response.data);
    }
  } catch (error) {
    console.error('Error fetching IPs:', error);
  }
};


// Función para obtener URLs con puerto dinámico
export const getApiUrlsWithDynamicPort = () => {
  return apiUrlsWithDynamicPort;
};

// Mantener la función original que devuelve URLs con puerto 5000
export const getApiUrlsWithPort = () => {
  return apiUrlsWithPort;
};

// Función para obtener URLs sin puerto
export const getApiUrlsWithoutPort = () => {
  return apiUrlsWithoutPort;
};

// Función genérica para realizar solicitudes
const makeRequest = async (method, endpoint, data = null, params = null, usePort = true, useDynamicPort = false) => {
  if (apiUrlsWithPort.length === 0 && apiUrlsWithoutPort.length === 0) {
    await fetchApiUrls(); // Cargar URLs antes de hacer la solicitud
  }

  // Seleccionar entre URLs con puerto estático, dinámico o sin puerto
  let urls;
  if (useDynamicPort) {
    urls = getApiUrlsWithDynamicPort(); // Usar las URLs con puertos dinámicos
  } else {
    urls = usePort ? getApiUrlsWithPort() : getApiUrlsWithoutPort();
  }

  const requests = urls.map(url => {
    return axios({ method, url: `${url}${endpoint}`, data, params });
  });

  try {
    const response = await Promise.race(requests); // Se usa la primera respuesta que llega
    return response.data;
  } catch (error) {
    console.error('API request error:', error);
    if (error.response && error.response.status === 429) {
      // Gestionar si todos los puertos están en uso
      throw new Error('Todos los puertos están en uso. Inténtalo más tarde.');
    }
    throw error;
  }
};
export const registerUser = async (userData) => {
  return makeRequest('post', '/register', userData);
};

export const loginUser = async (userData) => {
  return makeRequest('post', '/login', userData);
};

export const getUsers = async () => {
  return makeRequest('get', '/users');
}; 

export const deleteUser = async (userId) => {
  return makeRequest('delete', `/deletes/${userId}`);
};

export const updateUser = async (userId, userData) => {
  return makeRequest('put', `/users/${userId}`, userData);
};

// Funciones relacionadas con cursos

export const getCourses = async () => {
  return makeRequest('get', '/cursos');
};

export const addCourse = async (courseData) => {
  return makeRequest('post', '/cursos', courseData);
};

export const deleteCourse = async (courseId) => {
  return makeRequest('delete', `/cursos/${courseId}`);
};

export const updateCourse = async (courseId, courseData) => {
  return makeRequest('put', `/cursos/${courseId}`, courseData);
};

// Funciones relacionadas con contenido de cursos

export const addCourseContent = async (courseId, contentData) => {
  return makeRequest('post', `/cursos/${courseId}/contenido`, contentData);
};

export const getCourseContent = async (courseId, role) => {
  return makeRequest('get', `/cursos/${courseId}/contenido`, null, { role });
};

// Funciones relacionadas con semanas y archivos

export const getCourseWeeks = async (courseId) => {
  return makeRequest('get', `/cursos/${courseId}/semanas`);
};

export const getWeekFiles = async (weekId) => {
  return makeRequest('get', `/semanas/${weekId}/archivos`);
};

export const addCourseWeek = async (courseId, weekData) => {
  return makeRequest('post', `/cursos/${courseId}/semanas`, weekData);
};

export const addWeekFile = async (weekId, fileData) => {
  return makeRequest('post', `/semanas/${weekId}/archivos`, fileData);
};

export const deleteWeek = async (weekId) => {
  return makeRequest('delete', `/semanas/${weekId}`);
};

export const deleteFile = async (fileId) => {
  return makeRequest('delete', `/archivos/${fileId}`);
};

export const updateWeek = async (weekId, weekData) => {
  return makeRequest('put', `/semanas/${weekId}`, weekData);
};

// Funciones relacionadas con entrega de archivos

export const submitFile = async (fileData) => {
  return makeRequest('post', '/entrega_archivos', fileData);
};

export const getEntregaArchivos = async () => {
  return makeRequest('get', '/entrega_archivos');
};

export const deleteEntregaArchivo = async (entregaId) => {
  return makeRequest('delete', `/entrega_archivos/${entregaId}`);
};

export const updateEntregaArchivo = async (entregaId, entregaData) => {
  return makeRequest('put', `/entrega_archivos/${entregaId}`, entregaData);
};

export const getUserEntregas = async (userId) => {
  return makeRequest('get', `/entrega_archivos/usuario/${userId}`);
};

// Funciones relacionadas con notas

export const fetchNotes = async (dateStr) => {
  return makeRequest('get', `/api/notes/${dateStr}`);
};

export const saveNote = async (noteData) => {
  return makeRequest('post', '/api/notes', noteData);
};

export const fetchAllNotes = async () => {
  return makeRequest('get', '/api/notes');
};

export const deleteNote = async (id) => {
  return makeRequest('delete', `/api/notes/${id}`);
};


export const toggleWeekStatus = async (weekId, isEnabled) => {
  return makeRequest('put', `/semanas/${weekId}/enable`, { is_enabled: isEnabled });
};

export const toggleEntregaStatus = async (isEnabled, startDate, endDate) => {
  return makeRequest('post', '/entrega-status', { isEnabled, startDate, endDate });
};

export const getEntregaStatus = async () => {
  return makeRequest('get', '/entrega-status');
};


export const uploadZipFile = async (fileData) => {
  return makeRequest('post', '/api/arduino-files', fileData);
};
export const fetchZipFiles = async () => {
  return makeRequest('get', '/api/arduino-files');
};

export const arduinoDelete = async (fileId) => {
  return makeRequest('delete', `/api/arduino-files/${fileId}`);
};


// Función para agregar un código de Arduino
export const addArduinoCode = async (codeData) => {
  return makeRequest('post', '/api/arduino-codes', codeData);
};

// Función para obtener todos los códigos de Arduino
export const fetchArduinoCodes = async () => {
  return makeRequest('get', '/api/arduino-codes');
};

// Función para eliminar un código de Arduino
export const deleteArduinoCode = async (codeId) => {
  return makeRequest('delete', `/api/arduino-codes/${codeId}`);
};
// Función para actualizar un código de Arduino
export const updateArduinoCode = async (codeId, updatedCodeData) => {
  return makeRequest('put', `/api/arduino-codes/${codeId}`, updatedCodeData);
};
