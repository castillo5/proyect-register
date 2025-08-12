
import fs from 'fs';
import csv from 'csv-parser';
import db, { testConnection, createTableIfNotExists } from './db.js';


// customerservice
export const insertcustomer = async (custumer) => {
  try {
    const { first_name, last_name, active} = customer;
    const insertQuery = `
      INSERT INTO customer (first_name,last_name, active)
      VALUES (?,?,?)
    `;
    const params = [first_name, last_name, active];
    const [result] = await db.execute(insertQuery, params);
    return result;
  } catch (error) {
    console.error('Error insertando customer: ', error.message);
    throw error;
  }
};



export const getAllcustomer = async () => {
  try {
    console.log("Getting all customer from database");
    const [rows] = await db.execute('SELECT * FROM customer ORDER BY id DESC');
    console.log(`Found ${rows.length} customer`);
    return rows;
  } catch (error) {
    console.error('Error obteniendo clientes:', error.message);
    throw error;
  }
};

export const getcustomerById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM customer WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error obteniendo clientes por ID:', error.message);
    throw error;
  }
};

export const updatecustomer = async (id, customer) => {
  try {
    const {first_name, last_name, active} = customer;
    const updateQuery = `
      UPDATE customer
      SET first_name=?, last_name=?, active=?
      WHERE id = ?
    `;
    const params = [first_name, last_name, active, id];
    const [result] = await db.execute(updateQuery, params);
    return result;
  } catch (error) {
    console.error('Error actualizando clientes:', error.message);
    throw error;
  }
};

export const deletecustomer = async (id) => {
  try {
    const [result] = await db.execute('DELETE FROM customer WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error eliminando cliente:', error.message);
    throw error;
  }
};
// toda las partes de edicion del cvs de customer

// Cargar CSV y guardar filas (ruta en disco)
export const cargarCsvcustomer = (rutaCSV) => {
  return new Promise((resolve, reject) => {
    const inserted = [];
    let totalRows = 0;
    let successfulInserts = 0;
    
    console.log(`Iniciando carga de CSV: ${rutaCSV}`);
    
    fs.createReadStream(rutaCSV)
      .pipe(csv())
      .on('data', async (row) => {
        totalRows++;
        // Mapea campos según tu CSV (asegúrate que coincidan los nombres)
        const customer = {
          first_name: row.first_name || row.first_name || '',
          last_name: row.last_name || row.last_name || '',
          active: row.active || row.active || '',
        };
        
        try {
          const res = await insertcustomer(customer);
          inserted.push(res);
          successfulInserts++;
          console.log(`Empleado insertado: ${customer.first_name} ${customer.last_name}`);
        } catch (err) {
          console.error(`Error al insertar fila CSV (${customer.Name}):`, err.message);
        }
      })
      .on('end', () => {
        console.log(`CSV procesado: ${successfulInserts}/${totalRows} clientes insertados`);
        resolve(inserted);
      })
      .on('error', (err) => {
        console.error('Error leyendo CSV:', err.message);
        reject(err);
      });
  });
};

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  const connected = await testConnection();
  if (connected) {
    await createTableIfNotExists();
    return true;
  }
  return false;
};
