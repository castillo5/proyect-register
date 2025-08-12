// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { getAllcustomer, getcustomerById, updatecustomer,deletecustomer,cargarCsvcustomer,insertcustomer,initializeDatabase} from './customerservice.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer (guardamos archivos en /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// API rutas (prefijo /api)
app.get('/api/employees', async (req, res) => {
  try {
    const rows = await getAllcustomer();
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/employees:', err.message);
    res.status(500).json({ error: 'Error de base de datos: ' + err.message });
  }
});

app.get('/api/customer/:id', async (req, res) => {
  try {
    const emp = await getcustomerById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(emp);
  } catch (err) {
    console.error('Error en GET /api/employees/:id:', err.message);
    res.status(500).json({ error: 'Error de base de datos: ' + err.message });
  }
});

app.post('/api/customer', async (req, res) => {
  try {
    const result = await insertcustomer(req.body);
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error('Error en POST /api/employees:', err.message);
    res.status(500).json({ error: 'Error de base de datos: ' + err.message });
  }
});

app.put('/api/customer/:id', async (req, res) => {
  try {
    const result = await updatecustomer(req.params.id, req.body);
    res.json({ success: true, changedRows: result.affectedRows });
  } catch (err) {
    console.error('Error en PUT /api/customer/:id:', err.message);
    res.status(500).json({ error: 'Error de base de datos: ' + err.message });
  }
});

app.delete('/api/customer/:id', async (req, res) => {
  try {
    const result = await deletecustomer(req.params.id);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error('Error en DELETE /api/customer/:id:', err.message);
    res.status(500).json({ error: 'Error de base de datos: ' + err.message });
  }
});

// Subir CSV y cargarlo
app.post('/api/upload-csv', upload.single('csvfile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const filePath = req.file.path;
    console.log(`Procesando archivo CSV: ${filePath}`);
    const result = await cargarCsvcustomer(filePath);
    res.json({ success: true, file: req.file.filename, inserted: result.length });
  } catch (err) {
    console.error('Error en POST /api/upload-csv:', err.message);
    res.status(500).json({ error: 'Error procesando CSV: ' + err.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await initializeDatabase();
    res.json({ 
      status: 'ok', 
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// fallback: servir index.html
app.get('/:path(*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar base de datos al arrancar
const startServer = async () => {
  console.log('🚀 Iniciando servidor...');
  
  // Verificar conexión a base de datos
  const dbReady = await initializeDatabase();
  if (!dbReady) {
    console.error('❌ No se pudo conectar a la base de datos. Verifica:');
    console.error('   1. Que MySQL esté ejecutándose');
    console.error('   2. Que la base de datos "ExpertSoft" exista');
    console.error('   3. Que las credenciales sean correctas');
    console.error('   4. Que el usuario tenga permisos');
  }
  
  app.listen(PORT, () => {
    console.log(`🌟 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    if (dbReady) {
      console.log('✅ Base de datos conectada correctamente');
    } else {
      console.log('⚠️  Servidor iniciado pero sin conexión a base de datos');
    }
  });
};

startServer();
