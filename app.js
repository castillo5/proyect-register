// import {cargarcsv} from './employeservice.js';

// const archivo = 'empleados.csv';
// cargarcsv(archivo);

// app.js
// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { insertEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, cargarCsv } from './employeservice.js';

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
    const rows = await getAllEmployees();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const emp = await getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const result = await insertEmployee(req.body);
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const result = await updateEmployee(req.params.id, req.body);
    res.json({ success: true, changedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const result = await deleteEmployee(req.params.id);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subir CSV y cargarlo
app.post('/api/upload-csv', upload.single('csvfile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const filePath = req.file.path;
    await cargarCsv(filePath);
    res.json({ success: true, file: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fallback: servir index.html
app.get('/:path(*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
