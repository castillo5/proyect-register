// import mysql from 'mysql2';

// const db = mysql.createconnection({
//     host: 'localhost',
//     user: 'root',   
//     password: 'Jecg050505*',
//     database: 'postobon_01'
// });

// db.connet(err =>{
//     if(err) {
//         console.log('Error connecting to the database', err);
//         return;
//     }
//     console.log('conected to the database');
// });

// export default db;

// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ExpertSoft',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// Función para verificar conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos exitosa');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    return false;
  }
};

// Función para crear la tabla si no existe
export const createTableIfNotExists = async () => {
  const createTableSQL = `
  CREATE TABLE customer IF NOT EXISTS(
  ID_customer INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  active boolean);
  )
  `;
  
  try {
    await pool.execute(createTableSQL);
    console.log('✅ Tabla employees verificada/creada');
  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
  }
};

export default pool;
