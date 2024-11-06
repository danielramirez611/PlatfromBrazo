import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os'; // Importa el módulo 'os' para obtener las IPs
import multer from 'multer';
import { exec } from 'child_process';

const upload = multer({ storage: multer.memoryStorage() });

// Configura multer para manejar archivos en memoria
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

// Aumentar el límite de tamaño a 2 GB
app.use(express.json({ limit: '2048mb' }));
app.use(bodyParser.json({ limit: '2048mb' }));
app.use(bodyParser.urlencoded({ limit: '2048mb', extended: true }));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// MySQL connection configuration
const dbConfig = {
  connectionLimit: 50,
  host: '127.0.0.1',
  user: 'daniel',
  password: 'adaniel',
  database: 'imayine_db',
  acquireTimeout: 10000,
  connectTimeout: 10000,
  timeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  maxAllowedPacket: 64 * 1024 * 1024 // Esto no afecta directamente la configuración de MySQL
};

// Create MySQL connection pool
let db;

const handleDisconnect = () => {
  db = mysql.createPool(dbConfig);

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      setTimeout(handleDisconnect, 2000); // Try reconnecting after 2 seconds
    } else {
      console.log('Connected to the MySQL database');
      connection.release();

      // Ensure the admin user exists
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'admin';
      const adminQuery = `
        INSERT IGNORE INTO usuarios (first_name, last_name, username, password, dni, celular, email, genero, role)
        VALUES ('Admin', 'User', 'admin', ?, '12345678', '0000000000', ?, 'N/A', 'admin')
      `;
      db.query(adminQuery, [adminPassword, adminEmail], (err, result) => {
        if (err) {
          console.error('Error ensuring admin user exists:', err);
        } else {
          console.log('Admin user ensured to exist');
        }
      });
    }
  });

  db.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed. Reconnecting...');
      handleDisconnect();
    } else {
      throw err;
    }
  });
};

handleDisconnect();

// USUARIOS
let activePortsC = {};  // Aquí almacenaremos los puertos asignados a cada usuario

// Función para obtener puertos de Docker
const getDockerPortsC = () => {
  return new Promise((resolve, reject) => {
    exec('docker ps --filter "ancestor=pagina_html" --format "{{.Ports}}"', (error, stdout) => {
      if (error) {
              return reject(error);
          }
          const ports = stdout.trim().split(', ').map(portMapping => {
              const match = portMapping.match(/(\d+)->/);
              return match ? match[1] : null;
          }).filter(port => port !== null);
          resolve(ports);
      });
  });
};

// Ruta para asignar un puerto a un usuario logueado
// Ruta para asignar un puerto a un usuario logueado
app.post('/assign-portC', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
      return res.status(400).json({ success: false, message: 'No se proporcionó userId' });
  }

  // Si ya hay un puerto asignado para este usuario, devuelve el mismo puerto
  if (activePortsC[userId]) {
      return res.json({ success: true, port: activePortsC[userId] });
  }

  try {
      const dockerPorts = await getDockerPortsC();

      const usedPorts = Object.values(activePortsC);  // Puertos ya en uso
      const availablePorts = dockerPorts.filter(port => !usedPorts.includes(port));  // Puertos disponibles

      // Si no hay puertos disponibles, devolver error
      if (availablePorts.length === 0) {
          return res.status(429).json({ success: false, message: 'Todos los puertos están en uso' });
      }

      // Asignar el primer puerto disponible al usuario
      const assignedPort = availablePorts[0];
      activePortsC[userId] = assignedPort;

      res.json({ success: true, port: assignedPort });
  } catch (error) {
      console.error('Error obteniendo puertos de Docker:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los puertos de Docker' });
  }
});

// Ruta para liberar el puerto cuando un usuario se desconecta
app.post('/release-portC', (req, res) => {
  const { userId } = req.body;

  if (activePortsC[userId]) {
      delete activePortsC[userId];  // Liberar el puerto
      res.json({ success: true, message: `Puerto liberado para el usuario ${userId}` });
  } else {
      res.status(404).json({ success: false, message: 'Usuario no tiene puerto asignado' });
  }
});








// Gestión de Puertos Dinámicos
let activePorts = {};  // Aquí almacenaremos los puertos asignados a cada usuario

// Función para obtener puertos de Docker
const getDockerPorts = () => {
  return new Promise((resolve, reject) => {
      exec('docker ps --filter "name=mi_proyecto_docker" --format "{{.Ports}}"', (error, stdout) => {
          if (error) {
              return reject(error);
          }
          const ports = stdout.trim().split(', ').map(portMapping => {
              const match = portMapping.match(/(\d+)->/);
              return match ? match[1] : null;
          }).filter(port => port !== null);
          resolve(ports);
      });
  });
};

// Ruta para asignar un puerto a un usuario logueado
// Ruta para asignar un puerto a un usuario logueado
app.post('/assign-port', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
      return res.status(400).json({ success: false, message: 'No se proporcionó userId' });
  }

  // Si ya hay un puerto asignado para este usuario, devuelve el mismo puerto
  if (activePorts[userId]) {
      return res.json({ success: true, port: activePorts[userId] });
  }

  try {
      const dockerPorts = await getDockerPorts();

      const usedPorts = Object.values(activePorts);  // Puertos ya en uso
      const availablePorts = dockerPorts.filter(port => !usedPorts.includes(port));  // Puertos disponibles

      // Si no hay puertos disponibles, devolver error
      if (availablePorts.length === 0) {
          return res.status(429).json({ success: false, message: 'Todos los puertos están en uso' });
      }

      // Asignar el primer puerto disponible al usuario
      const assignedPort = availablePorts[0];
      activePorts[userId] = assignedPort;

      res.json({ success: true, port: assignedPort });
  } catch (error) {
      console.error('Error obteniendo puertos de Docker:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los puertos de Docker' });
  }
});

// Ruta para liberar el puerto cuando un usuario se desconecta
app.post('/release-port', (req, res) => {
  const { userId } = req.body;

  if (activePorts[userId]) {
      delete activePorts[userId];  // Liberar el puerto
      res.json({ success: true, message: `Puerto liberado para el usuario ${userId}` });
  } else {
      res.status(404).json({ success: false, message: 'Usuario no tiene puerto asignado' });
  }
});



// Ruta para obtener IPs y puertos del sistema
app.get('/my-ips', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = [];

  for (const interfaceName in networkInterfaces) {
    const interfaceInfo = networkInterfaces[interfaceName];
    interfaceInfo.forEach(info => {
      if (info.family === 'IPv4' && !info.internal) {
        ipAddresses.push({
          address: info.address,
          ports: [], // Se agregarán los puertos más tarde
        });
      }
    });
  }

  exec('sudo docker ps --filter "name=mi_proyecto_docker" --format "{{.Ports}}"', (error, stdout) => {
    if (error) {
      console.error(`Error ejecutando docker ps: ${error}`);
      return res.status(500).json({ error: 'Error al obtener los puertos de Docker' });
    }

    const ports = stdout.trim().split(', ').map(portMapping => {
      const portMatch = portMapping.match(/(\d+)->/);
      return portMatch ? portMatch[1] : null;
    }).filter(port => port !== null);

    const ipAddressesWithPorts = ipAddresses.map(ipInfo => ({
      ...ipInfo,
      ports,
    }));

    res.json({ ips: ipAddressesWithPorts });
  });
});


app.get('/ips-ver', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = [];

  // Obtener la IP que el servidor está utilizando para responder
  const currentIp = req.socket.localAddress.replace(/^.*:/, '');

  for (const interfaceName in networkInterfaces) {
    const interfaceInfo = networkInterfaces[interfaceName];
    interfaceInfo.forEach(info => {
      if (info.family === 'IPv4' && !info.internal) {
        // Determinar si la conexión es WiFi o Ethernet
        let ipType = interfaceName.toLowerCase().includes('wifi') || interfaceName.toLowerCase().includes('wlan') ? 'WiFi' : 'Ethernet';
        let isRaspberryPi = os.hostname().toLowerCase().includes('raspberrypi');
        let networkName = ipType === 'WiFi' ? 'WiFi Network' : 'Ethernet Network';

        // Verifica si esta es la IP en uso comparándola con la IP del socket
        let isCurrent = info.address === currentIp;

        ipAddresses.push({
          address: info.address,
          type: ipType,
          isCurrent: isCurrent,
          isRaspberryPi: isRaspberryPi,
          networkName: networkName
        });
      }
    });
  }

  console.log('IPs detectadas:', ipAddresses); // Verificar las IPs detectadas y cuál es la actual
  res.json({ ips: ipAddresses });
});

// Ruta para registrar usuarios
app.post('/register', (req, res) => {
  const { first_name, last_name, username, password, dni, celular, email, genero, role } = req.body;
  const userRole = role || 'user'; // Si no se proporciona un rol, usar 'user' por defecto

  if (email === 'admin@gmail.com') {
    return res.status(403).send('Cannot register with this email');
  }

  const query = 'INSERT INTO usuarios (first_name, last_name, username, password, dni, celular, email, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [first_name, last_name, username, password, dni, celular, email, genero, userRole], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).send('Error registering user');
    }
    res.status(201).send('User registered successfully');
  });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  if (!email || !password) {
    return res.status(400).send({ message: 'Correo electrónico y contraseña son requeridos' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send({ message: 'Error logging in' });
    }

    if (results.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(400).send({ message: 'Usuario no encontrado' });
    }

    const user = results[0];
    if (user.password !== password) {
      console.log('Incorrect password');
      return res.status(400).send({ message: 'Incorrect password' });
    }
    

    console.log('Login successful:', { userId: user.id });
    res.status(200).send({ message: 'Login successful', user });
  });
});

// Ruta para obtener todos los usuarios
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM usuarios';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }
    // Eliminar el campo de la contraseña
    const usersWithoutPasswords = results.map(user => {
      delete user.password;
      return user;
  });
    res.json(results);
  });
});
// Ruta para registrar usuarios
app.post('/register', (req, res) => {
  const { first_name, last_name, username, password, dni, celular, email, genero, role } = req.body;
  const userRole = role || 'user'; // Si no se proporciona un rol, usar 'user' por defecto

  if (email === 'admin@gmail.com') {
    return res.status(403).send('Cannot register with this email');
  }

  const query = 'INSERT INTO usuarios (first_name, last_name, username, password, dni, celular, email, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [first_name, last_name, username, password, dni, celular, email, genero, userRole], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).send('Error registering user');
    }
    res.status(201).send('User registered successfully');
  });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  if (!email || !password) {
    return res.status(400).send({ message: 'Correo electrónico y contraseña son requeridos' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send({ message: 'Error logging in' });
    }

    if (results.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(400).send({ message: 'Usuario no encontrado' });
    }

    const user = results[0];
    if (user.password !== password) {
      console.log('Incorrect password');
      return res.status(400).send({ message: 'Incorrect password' });
    }
    

    console.log('Login successful:', { userId: user.id });
    res.status(200).send({ message: 'Login successful', user });
  });
});

// Ruta para obtener todos los usuarios
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM usuarios';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }
    // Eliminar el campo de la contraseña
    const usersWithoutPasswords = results.map(user => {
      delete user.password;
      return user;
  });
    res.json(results);
  });
});

// Ruta para eliminar un usuario
app.delete('/deletes/:id', (req, res) => {
  const userId = req.params.id;
  const checkAdminQuery = 'SELECT email FROM usuarios WHERE id = ?';

  db.query(checkAdminQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send('Error checking user');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    if (results[0].email === 'admin@gmail.com') {
      return res.status(403).send('No se puede eliminar el usuario administrador');
    }

    const deleteQuery = 'DELETE FROM usuarios WHERE id = ?';
    db.query(deleteQuery, [userId], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).send('Error deleting user');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('User not found');
      }
      res.status(200).send('User deleted successfully');
    });
  });
});

// Ruta para actualizar un usuario
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, username, password, dni, celular, email, genero, role } = req.body;

  const checkAdminQuery = 'SELECT email FROM usuarios WHERE id = ?';
  db.query(checkAdminQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send('Error checking user');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    if (results[0].email === 'admin@gmail.com') {
      return res.status(403).send('No se puede actualizar el usuario administrador');
    }

    const updateQuery = 'UPDATE usuarios SET first_name = ?, last_name = ?, username = ?, password = ?, dni = ?, celular = ?, email = ?, genero = ?, role = ? WHERE id = ?';
    db.query(updateQuery, [first_name, last_name, username, password, dni, celular, email, genero, role, userId], (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).send('Error updating user');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('User not found');
      }
      res.status(200).send('User updated successfully');
    });
  });
});

// CURSOS

// Ruta para obtener todos los cursos
app.get('/cursos', (req, res) => {
  const query = 'SELECT id, title, introduction, objetivos_especificos, TO_BASE64(image) as image FROM cursos';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).send('Error fetching courses');
    }
    res.json(results);
  });
});

// Ruta para agregar un curso
app.post('/cursos', (req, res) => {
  const { title, image, introduction, objetivos_especificos } = req.body;
  const query = 'INSERT INTO cursos (title, image, introduction, objetivos_especificos) VALUES (?, ?, ?, ?)';
  db.query(query, [title, Buffer.from(image, 'base64'), introduction, objetivos_especificos], (err, result) => {
    if (err) {
      console.error('Error inserting course:', err);
      return res.status(500).send('Error inserting course');
    }
    res.status(201).send('Course added successfully');
  });
});

// Ruta para eliminar un curso
app.delete('/cursos/:id', (req, res) => {
  const cursoId = req.params.id;

  // Primero, eliminar archivos relacionados con las semanas del curso
  const deleteCourseFilesQuery = `
    DELETE curso_archivos FROM curso_archivos
    INNER JOIN curso_semanas ON curso_archivos.semana_id = curso_semanas.id
    WHERE curso_semanas.curso_id = ?
  `;
  db.query(deleteCourseFilesQuery, [cursoId], (err) => {
    if (err) {
      console.error('Error deleting course files:', err);
      return res.status(500).send('Error deleting course files');
    }

    // Luego, eliminar las semanas relacionadas con el curso
    const deleteCourseWeeksQuery = 'DELETE FROM curso_semanas WHERE curso_id = ?';
    db.query(deleteCourseWeeksQuery, [cursoId], (err) => {
      if (err) {
        console.error('Error deleting course weeks:', err);
        return res.status(500).send('Error deleting course weeks');
      }

      // Finalmente, eliminar el curso
      const deleteCourseQuery = 'DELETE FROM cursos WHERE id = ?';
      db.query(deleteCourseQuery, [cursoId], (err, result) => {
        if (err) {
          console.error('Error deleting course:', err);
          return res.status(500).send('Error deleting course');
        }
        if (result.affectedRows === 0) {
          return res.status(404).send('Course not found');
        }
        res.status(200).send('Course deleted successfully');
      });
    });
  });
});

// Ruta para actualizar un curso
app.put('/cursos/:id', (req, res) => {
  const cursoId = req.params.id;
  const { title, image, introduction, objetivos_especificos } = req.body;

  const query = 'UPDATE cursos SET title = ?, image = ?, introduction = ?, objetivos_especificos = ? WHERE id = ?';
  db.query(query, [title, Buffer.from(image, 'base64'), introduction, objetivos_especificos, cursoId], (err, result) => {
    if (err) {
      console.error('Error updating course:', err);
      return res.status(500).send('Error updating course');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Course not found');
    }
    res.status(200).send('Course updated successfully');
  });
});

// Ruta para obtener el contenido de un curso específico

// Ruta para obtener el contenido de un curso específico
app.get('/cursos/:id/contenido', (req, res) => {
  const cursoId = req.params.id;
  const { role } = req.query;

  let querySemanas;
  if (role === 'admin') {
    querySemanas = 'SELECT id, semana, is_enabled FROM curso_semanas WHERE curso_id = ?';
  } else {
    querySemanas = 'SELECT id, semana, is_enabled FROM curso_semanas WHERE curso_id = ? AND (role = ?)';
  }

  db.query(querySemanas, [cursoId, role], (err, semanas) => {
    if (err) {
      console.error('Error fetching weeks:', err);
      return res.status(500).send('Error fetching weeks');
    }

    const semanasIds = semanas.map(semana => semana.id);
    if (semanasIds.length === 0) {
      return res.json([]);
    }

    const queryArchivos = 'SELECT semana_id, nombre_archivo, TO_BASE64(archivo) as archivo FROM curso_archivos WHERE semana_id IN (?)';
    db.query(queryArchivos, [semanasIds], (err, archivos) => {
      if (err) {
        console.error('Error fetching files:', err);
        return res.status(500).send('Error fetching files');
      }

      const resultado = semanas.map(semana => ({
        id: semana.id,
        semana: semana.semana,
        is_enabled: semana.is_enabled,
        archivos: archivos.filter(archivo => archivo.semana_id === semana.id)
      }));

      res.json(resultado);
    });
  });
});


// Ruta para agregar una semana a un curso
// Ruta para agregar una semana a un curso
app.post('/cursos/:id/semanas', (req, res) => {
  const cursoId = req.params.id;
  const { semana, role } = req.body;

  const query = 'INSERT INTO curso_semanas (curso_id, semana, role) VALUES (?, ?, ?)';
  db.query(query, [cursoId, semana, role], (err, result) => {
    if (err) {
      console.error('Error inserting week:', err);
      return res.status(500).send('Error inserting week');
    }
    res.status(201).send('Week added successfully');
  });
});

// Ruta para eliminar una semana
app.delete('/semanas/:id', (req, res) => {
  const semanaId = req.params.id;
  const query = 'DELETE FROM curso_semanas WHERE id = ?';
  db.query(query, [semanaId], (err, result) => {
    if (err) {
      console.error('Error deleting week:', err);
      return res.status(500).send('Error deleting week');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Week not found');
    }
    res.status(200).send('Week deleted successfully');
  });
});

// Ruta para eliminar un archivo
app.delete('/archivos/:id', (req, res) => {
  const archivoId = req.params.id;

  const deleteFileQuery = 'DELETE FROM curso_archivos WHERE id = ?';
  db.query(deleteFileQuery, [archivoId], (err, result) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).send('Error deleting file');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('File not found');
    }
    res.status(200).send('File deleted successfully');
  });
});

// Ruta para actualizar una semana
app.put('/semanas/:id', (req, res) => {
  const semanaId = req.params.id;
  const { semana } = req.body;

  const query = 'UPDATE curso_semanas SET semana = ? WHERE id = ?';
  db.query(query, [semana, semanaId], (err, result) => {
    if (err) {
      console.error('Error updating week:', err);
      return res.status(500).send('Error updating week');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Week not found');
    }
    res.status(200).send('Week updated successfully');
  });
});

// Ruta para obtener todas las semanas de un curso
// Ruta para obtener todas las semanas de un curso, incluyendo el rol
app.get('/cursos/:id/semanas', (req, res) => {
  const cursoId = req.params.id;
  const query = 'SELECT * FROM curso_semanas WHERE curso_id = ?';
  db.query(query, [cursoId], (err, results) => {
    if (err) {
      console.error('Error fetching weeks:', err);
      return res.status(500).send('Error fetching weeks');
    }
    res.json(results);
  });
});

// Ruta para obtener todos los archivos de una semana
// Obtener archivos de una semana
app.get('/semanas/:id/archivos', (req, res) => {
  const semanaId = req.params.id;
  const query = 'SELECT id, semana_id, nombre_archivo, TO_BASE64(archivo) as archivo FROM curso_archivos WHERE semana_id = ?';
  db.query(query, [semanaId], (err, results) => {
    if (err) {
      console.error('Error fetching files:', err);
      return res.status(500).send('Error fetching files');
    }
    res.json(results);
  });
});

// Ruta para agregar un archivo a una semana
// Ruta para agregar un archivo a una semana
// Ruta para agregar un archivo a una semana
app.post('/semanas/:id/archivos', (req, res) => {
  const semanaId = req.params.id;
  const { nombre_archivo, archivo } = req.body;

  // Verificar si los datos están presentes
  if (!nombre_archivo || !archivo) {
    return res.status(400).send('Faltan datos requeridos');
  }

  // Verificar si el archivo tiene el formato correcto
  const validFormats = ['.docx', '.pdf', '.pptx']; // Ahora acepta PPTX
  const fileExtension = nombre_archivo.slice(nombre_archivo.lastIndexOf('.')).toLowerCase();

  if (!validFormats.includes(fileExtension)) {
    return res.status(400).send('Solo se permiten archivos DOCX, PDF y PPTX');
  }

  const query = 'INSERT INTO curso_archivos (semana_id, nombre_archivo, archivo) VALUES (?, ?, ?)';
  db.query(query, [semanaId, nombre_archivo, Buffer.from(archivo, 'base64')], (err, result) => {
    if (err) {
      console.error('Error inserting file:', err);
      return res.status(500).send('Error inserting file');
    }
    res.status(201).send({ id: result.insertId, semana_id: semanaId, nombre_archivo, archivo });
  });
});


// Ruta para eliminar una entrega de archivo
app.delete('/entrega_archivos/:id', (req, res) => {
  const entregaId = req.params.id;
  
  const deleteEntregaQuery = 'DELETE FROM entrega_archivos WHERE id = ?';
  db.query(deleteEntregaQuery, [entregaId], (err, result) => {
    if (err) {
      console.error('Error deleting file submission:', err);
      return res.status(500).send('Error deleting file submission');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('File submission not found');
    }
    res.status(200).send('File submission deleted successfully');
  });
});


// Ruta para actualizar una entrega de archivo
app.put('/entrega_archivos/:id', (req, res) => {
  const entregaId = req.params.id;
  const { archivo, descripcion, comentarios } = req.body;

  const query = 'UPDATE entrega_archivos SET archivo = ?, descripcion = ?, comentarios = ? WHERE id = ?';
  db.query(query, [Buffer.from(archivo, 'base64'), descripcion, comentarios, entregaId], (err, result) => {
    if (err) {
      console.error('Error updating file submission:', err);
      return res.status(500).send('Error updating file submission');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('File submission not found');
    }
    res.status(200).send('File submission updated successfully');
  });
});

// Subir archivo de entrega
app.post('/entrega_archivos', (req, res) => {
  const { usuario_id, archivo, descripcion, comentarios } = req.body;

  if (!usuario_id || !archivo || !descripcion) {
    return res.status(400).send('Faltan datos requeridos');
  }

  const query = 'INSERT INTO entrega_archivos (usuario_id, archivo, descripcion, comentarios) VALUES (?, FROM_BASE64(?), ?, ?)';
  db.query(query, [usuario_id, archivo, descripcion, comentarios], (err, result) => {
    if (err) {
      console.error('Error inserting file:', err);
      return res.status(500).send('Error inserting file');
    }
    res.status(201).send('File submitted successfully');
  });
});


// Obtener todas las entregas de archivos
app.get('/entrega_archivos', (req, res) => {
  const query = `
  SELECT ea.id, u.first_name, u.last_name, u.email, TO_BASE64(ea.archivo) as archivo, ea.descripcion, ea.comentarios, ea.created_at 
  FROM entrega_archivos ea
    JOIN usuarios u ON ea.usuario_id = u.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching file submissions:', err);
      return res.status(500).send('Error fetching file submissions');
    }
    res.json(results);
  });
});




app.get('/entrega_archivos/usuario/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT id, usuario_id, TO_BASE64(archivo) as archivo, descripcion, comentarios, created_at 
    FROM entrega_archivos 
    WHERE usuario_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user file submissions:', err);
      return res.status(500).send('Error fetching user file submissions');
    }
    res.json(results);
  });
});


app.get('/api/notes/:date', (req, res) => {
  const { date } = req.params;
  const query = 'SELECT id, note FROM notes WHERE date = ?';
  db.query(query, [date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error' });
    res.json(results);
  });
});
// Ruta para guardar una nueva nota
app.post('/api/notes', (req, res) => {
  const { date, note } = req.body;
  const query = 'INSERT INTO notes (date, note) VALUES (?, ?)';
  db.query(query, [date, note], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database insert error' });
    res.status(201).json({ message: 'Note saved successfully', id: result.insertId });
  });
});



// Obtener todas las notas de la base de datos
app.get('/api/notes', (req, res) => {
  const query = 'SELECT date, note FROM notes';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error' });
    res.json(results);
  });
});

// Eliminar una nota por su ID
// Eliminar una nota por su ID
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database query error' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  });
});


// Ruta para actualizar el estado de is_enabled de una semana
app.put('/semanas/:id/enable', (req, res) => {
  const semanaId = req.params.id;
  const { is_enabled } = req.body;

  const query = 'UPDATE curso_semanas SET is_enabled = ? WHERE id = ?';
  db.query(query, [is_enabled, semanaId], (err, result) => {
    if (err) {
      console.error('Error updating week status:', err);
      return res.status(500).send('Error updating week status');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Week not found');
    }
    res.status(200).send('Week status updated successfully');
  });
});


// Ruta para obtener el estado de la entrega
// Ruta para obtener el estado de la entrega
// Ruta para obtener el estado de la entrega
// Ruta para obtener el estado de la entrega
// Ruta para obtener el estado de la entrega
// Ruta para obtener el estado de la entrega
// Ruta para obtener el estado de la entrega
// Ruta para obtener el estado de la entrega
// Ruta para actualizar el estado de la entrega
app.post('/entrega-status', (req, res) => {
  const { isEnabled, startDate, endDate } = req.body;
  const query = `
    UPDATE settings 
    SET entrega_enabled = ?, start_time = ?, end_time = ? 
    WHERE id = 1
  `;
  db.query(query, [isEnabled, startDate, endDate], (err, result) => {
    if (err) {
      console.error('Error updating entrega status:', err);
      return res.status(500).send('Error updating entrega status');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Settings not found');
    }
    res.status(200).send('Entrega status updated successfully');
  });
});

app.get('/entrega-status', (req, res) => {
  const query = 'SELECT entrega_enabled, start_time, end_time FROM settings WHERE id = 1';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching entrega status:', err);
      return res.status(500).send('Error fetching entrega status');
    }
    if (result.length === 0) {
      return res.status(404).send('Settings not found');
    }

    const { entrega_enabled, start_time, end_time } = result[0];
    const now = new Date();

    let isEnabled = entrega_enabled;
    if (start_time && end_time) {
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);

      // Comprueba si la fecha y hora actuales están dentro del rango
      if (now >= startTime && now <= endTime) {
        isEnabled = true;
      } else {
        isEnabled = false;
      }
    }

    res.json({
      isEnabled,
      startTime: result[0].start_time,
      endTime: result[0].end_time,
    });
  });
});





// Ruta para subir un archivo .zip
app.post('/api/arduino-files', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const { filename } = req.body;
  const fileData = req.file.buffer;

  const query = 'INSERT INTO zip_files (filename, file_data) VALUES (?, ?)';
  db.query(query, [filename, fileData], (err, result) => {
    if (err) {
      console.error('Error inserting file into database:', err);
      return res.status(500).send('Error saving file');
    }
    res.status(201).json({ id: result.insertId, filename, upload_date: new Date() });
  });
});


// Ruta para obtener todos los archivos .zip
app.get('/api/arduino-files', (req, res) => {
  const query = 'SELECT id, filename, upload_date FROM zip_files';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching files:', err);
      return res.status(500).send('Error fetching files');
    }
    res.json(results);
  });
});

// Ruta para descargar un archivo .zip específico
app.get('/api/arduino-files/:id', (req, res) => {
  const fileId = req.params.id;
  const query = 'SELECT filename, file_data FROM zip_files WHERE id = ?';
  db.query(query, [fileId], (err, result) => {
    if (err || result.length === 0) {
      console.error('Error fetching file:', err);
      return res.status(500).send('Error fetching file');
    }

    const file = result[0];
    res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
    res.send(file.file_data);
  });
});

// Ruta para eliminar un archivo .zip específico
app.delete('/api/arduino-files/:id', (req, res) => {
  const fileId = req.params.id;

  const query = 'DELETE FROM zip_files WHERE id = ?';
  db.query(query, [fileId], (err, result) => {
    if (err) {
      console.error('Error deleting file from database:', err);
      return res.status(500).send('Error deleting file');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('File not found');
    }
    res.status(200).send('File deleted successfully');
  });
});

// Ruta para agregar un código de Arduino
app.post('/api/arduino-codes', (req, res) => {
  const { title, code } = req.body;
  const query = 'INSERT INTO arduino_codes (title, code) VALUES (?, ?)';
  db.query(query, [title, code], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error adding Arduino code' });
    res.status(201).json({ message: 'Arduino code added successfully', id: result.insertId });
  });
});

// Ruta para obtener todos los códigos de Arduino
app.get('/api/arduino-codes', (req, res) => {
  const query = 'SELECT * FROM arduino_codes';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching Arduino codes' });
    res.json(results);
  });
});

// Ruta para eliminar un código de Arduino
app.delete('/api/arduino-codes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM arduino_codes WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error deleting Arduino code' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Arduino code not found' });
    res.status(200).json({ message: 'Arduino code deleted successfully' });
  });
});
// Ruta para actualizar un código de Arduino
app.put('/api/arduino-codes/:id', (req, res) => {
  const { id } = req.params;
  const { title, code } = req.body;
  const query = 'UPDATE arduino_codes SET title = ?, code = ? WHERE id = ?';
  db.query(query, [title, code, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating Arduino code' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Arduino code not found' });
    res.status(200).json({ message: 'Arduino code updated successfully' });
  });
});


// Servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
